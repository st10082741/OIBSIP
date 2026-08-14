/*
==============================================================
                  PAYMENT CONTROLLER
==============================================================

This controller simulates Razorpay Test Mode for the
internship project.

Purpose:

• Create a test payment session
• Allow Success or Failure simulation
• Confirm the order only after Success
• Finalise successful orders inside a MongoDB transaction
• Deduct inventory atomically
• Clear the customer's cart
• Prevent double-payment / double-deduction

This architecture can later be replaced with real Razorpay
credentials without redesigning the order system.

==============================================================
*/

const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Cart = require("../models/Cart");

const { deductOrderInventory } = require("../services/inventoryService");

// =============================================================
// CREATE TEST PAYMENT SESSION
// =============================================================

const createTestPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // A paid order must never create another payment session.
    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This order has already been paid.",
      });
    }

    /*
    Reuse an existing test payment session instead of
    generating duplicate payment sessions.
    */
    if (order.testPaymentOrderId) {
      return res.status(200).json({
        success: true,
        message: "Test payment session already exists.",

        payment: {
          testPaymentOrderId: order.testPaymentOrderId,

          amount: order.totalAmount,

          currency: "ZAR",

          orderId: order._id,
        },
      });
    }

    /*
    Create a Razorpay-style simulated test order identifier.

    Example:

    test_order_a1b2c3d4
    */

    const testPaymentOrderId = `test_order_${crypto
      .randomBytes(8)
      .toString("hex")}`;

    order.testPaymentOrderId = testPaymentOrderId;

    /*
    Keep the order in Pending state until the customer
    selects Success or Failure.
    */
    order.paymentStatus = "Pending";

    order.paymentMethod = "Razorpay Test Mode";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Test payment session created successfully.",

      payment: {
        testPaymentOrderId,

        amount: order.totalAmount,

        currency: "ZAR",

        orderId: order._id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create test payment session.",
      error: error.message,
    });
  }
};

// =============================================================
// COMPLETE TEST PAYMENT
// =============================================================

const completeTestPayment = async (req, res) => {
  try {
    const { orderId, testPaymentOrderId, result } = req.body;

    // ---------------------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------------------

    if (!orderId || !testPaymentOrderId || !result) {
      return res.status(400).json({
        success: false,
        message: "Order ID, test payment order ID and result are required.",
      });
    }

    if (result !== "Success" && result !== "Failure") {
      return res.status(400).json({
        success: false,
        message: "Payment result must be Success or Failure.",
      });
    }

    // ---------------------------------------------------------
    // LOAD ORDER
    // ---------------------------------------------------------

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Confirm the payment session belongs to this order.
    if (order.testPaymentOrderId !== testPaymentOrderId) {
      return res.status(400).json({
        success: false,
        message: "Test payment session does not match this order.",
      });
    }

    // ---------------------------------------------------------
    // PAYMENT FAILURE
    // ---------------------------------------------------------

    /*
    Failure does NOT:

    • Deduct inventory
    • Clear the cart
    • Confirm the order as paid
    */

    if (result === "Failure") {
      // Do not downgrade an already-paid order.
      if (order.paymentStatus === "Paid") {
        return res.status(400).json({
          success: false,
          message: "This order has already been paid.",
        });
      }

      order.paymentStatus = "Failed";

      order.paymentMethod = "Razorpay Test Mode";

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Test payment failed.",

        order: {
          id: order._id,

          paymentStatus: order.paymentStatus,

          paymentMethod: order.paymentMethod,
        },
      });
    }

    // =========================================================
    // PAYMENT SUCCESS
    // =========================================================

    /*
    Successful payment finalisation must be atomic.

    The following must all succeed together:

    1. Re-check and deduct inventory
    2. Mark payment as Paid
    3. Generate payment identifier
    4. Clear customer cart

    If any operation fails, the transaction rolls back.
    */

    const session = await mongoose.startSession();

    try {
      let deductions = [];

      let generatedTestPaymentId = "";

      await session.withTransaction(async () => {
        // ---------------------------------------------------
        // RELOAD ORDER INSIDE TRANSACTION
        // ---------------------------------------------------

        const transactionOrder = await Order.findOne({
          _id: orderId,
          user: req.user.id,
        }).session(session);

        if (!transactionOrder) {
          throw new Error("Order not found during payment finalisation.");
        }

        // ---------------------------------------------------
        // IDEMPOTENCY PROTECTION
        // ---------------------------------------------------

        /*
          This prevents the same Success request from
          deducting inventory twice.
          */

        if (transactionOrder.paymentStatus === "Paid") {
          throw new Error("This order has already been paid.");
        }

        // Confirm the payment session again inside transaction.
        if (transactionOrder.testPaymentOrderId !== testPaymentOrderId) {
          throw new Error("Test payment session does not match this order.");
        }

        // ---------------------------------------------------
        // ATOMIC INVENTORY DEDUCTION
        // ---------------------------------------------------

        /*
          deductOrderInventory uses conditional MongoDB
          updates such as:

          stock >= required quantity

          together with:

          $inc: { stock: -quantity }

          This prevents concurrent orders from overselling
          the same final units.
          */

        deductions = await deductOrderInventory(transactionOrder, session);

        // ---------------------------------------------------
        // GENERATE TEST PAYMENT ID
        // ---------------------------------------------------

        generatedTestPaymentId = `test_pay_${crypto
          .randomBytes(8)
          .toString("hex")}`;

        // ---------------------------------------------------
        // MARK PAYMENT AS PAID
        // ---------------------------------------------------

        transactionOrder.paymentStatus = "Paid";

        transactionOrder.paymentMethod = "Razorpay Test Mode";

        transactionOrder.testPaymentId = generatedTestPaymentId;

        await transactionOrder.save({
          session,
        });

        // ---------------------------------------------------
        // CLEAR CUSTOMER CART
        // ---------------------------------------------------

        await Cart.updateOne(
          {
            user: req.user.id,
          },

          {
            $set: {
              items: [],
            },
          },

          {
            session,
          },
        );
      });

      // -------------------------------------------------------
      // TRANSACTION SUCCEEDED
      // -------------------------------------------------------

      return res.status(200).json({
        success: true,
        message: "Test payment completed and order finalised successfully.",

        order: {
          id: orderId,

          paymentStatus: "Paid",

          paymentMethod: "Razorpay Test Mode",

          testPaymentOrderId,

          testPaymentId: generatedTestPaymentId,

          status: "Order Received",
        },

        inventory: {
          deductions,
        },

        cartCleared: true,
      });
    } catch (error) {
      /*
      If any step inside withTransaction() fails,
      MongoDB aborts the transaction.

      That means:

      • Inventory changes roll back
      • Order remains unpaid
      • Cart remains unchanged
      */

      return res.status(400).json({
        success: false,
        message:
          "Payment succeeded but order finalisation could not be completed.",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to complete test payment.",
      error: error.message,
    });
  }
};

module.exports = {
  createTestPayment,
  completeTestPayment,
};
