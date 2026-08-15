/*
==============================================================
                ADMIN ORDER CONTROLLER
==============================================================

This controller handles administrator order management.

Responsibilities:

• View all customer orders
• View one order
• Update order status

Order status flow:

Order Received
      ↓
In Kitchen
      ↓
Sent to Delivery

==============================================================
*/

const mongoose = require("mongoose");

const Order = require("../models/Order");

// =============================================================
// GET ALL ORDERS
// =============================================================

const getAllOrders = async (req, res) => {
  try {
    /*
    Return newest orders first.

    Populate basic customer information so the admin
    dashboard can identify who placed each order.
    */

    const orders = await Order.find().populate("user", "name email").sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
      error: error.message,
    });
  }
};

// =============================================================
// GET ONE ORDER
// =============================================================

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order.",
      error: error.message,
    });
  }
};

// =============================================================
// UPDATE ORDER STATUS
// =============================================================

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    /*
    Only statuses supported by the assignment
    may be assigned.
    */

    const allowedStatuses = [
      "Order Received",
      "In Kitchen",
      "Sent to Delivery",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    /*
    Do not allow kitchen/delivery processing
    for an unpaid order.
    */

    if (order.paymentStatus !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid orders can be processed.",
      });
    }

    order.status = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",

      order: {
        id: order._id,
        paymentStatus: order.paymentStatus,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
