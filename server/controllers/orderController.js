/*
==============================================================
                    ORDER CONTROLLER
==============================================================

This controller handles customer order creation.

Current responsibilities:

• Validate delivery information
• Revalidate cart contents
• Recalculate trusted prices
• Create an order snapshot
• Store order with initial status
• Return customer orders

IMPORTANT:

Payment confirmation and inventory deduction are handled
in later batches.

==============================================================
*/

const Cart = require("../models/Cart");
const Order = require("../models/Order");

const Pizza = require("../models/Pizza");
const PizzaBase = require("../models/PizzaBase");
const Sauce = require("../models/Sauce");
const Cheese = require("../models/Cheese");
const Vegetable = require("../models/Vegetable");

// =============================================================
// CREATE ORDER
// =============================================================

const createOrder = async (req, res) => {
  try {
    const { street, city, province, postalCode, phone } = req.body;

    // ---------------------------------------------------------
    // DELIVERY VALIDATION
    // ---------------------------------------------------------

    if (!street || !city || !province || !postalCode || !phone) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery information is required.",
      });
    }

    // ---------------------------------------------------------
    // LOAD CART
    // ---------------------------------------------------------

    // ---------------------------------------------------------
    // PREVENT DUPLICATE PENDING ORDERS
    // ---------------------------------------------------------

    const existingPendingOrder = await Order.findOne({
      user: req.user.id,
      paymentStatus: "Pending",
    }).sort({
      createdAt: -1,
    });

    if (existingPendingOrder) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an order awaiting payment. Complete or cancel that order before creating another one.",
        orderId: existingPendingOrder._id,
      });
    }

    // ---------------------------------------------------------
    // LOAD CART
    // ---------------------------------------------------------

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const orderItems = [];

    let totalQuantity = 0;
    let totalAmount = 0;

    // ---------------------------------------------------------
    // REVALIDATE CART
    // ---------------------------------------------------------

    for (const item of cart.items) {
      // =======================================================
      // CATALOG PIZZA
      // =======================================================

      if (item.itemType === "catalog") {
        const pizza = await Pizza.findOne({
          _id: item.pizza,
          available: true,
        });

        if (!pizza) {
          return res.status(400).json({
            success: false,
            message: "One of the pizzas in your cart is no longer available.",
          });
        }

        const unitPrice = pizza.price;
        const subtotal = unitPrice * item.quantity;

        orderItems.push({
          itemType: "catalog",

          pizza: {
            id: pizza._id,
            name: pizza.name,
            image: pizza.image,
          },

          customPizza: null,

          quantity: item.quantity,
          unitPrice,
          subtotal,
        });

        totalQuantity += item.quantity;
        totalAmount += subtotal;

        continue;
      }

      // =======================================================
      // CUSTOM PIZZA
      // =======================================================

      if (item.itemType === "custom") {
        const customPizza = item.customPizza;

        const [base, sauce, cheese, vegetables] = await Promise.all([
          PizzaBase.findOne({
            _id: customPizza.base,
            available: true,
          }),

          Sauce.findOne({
            _id: customPizza.sauce,
            available: true,
          }),

          Cheese.findOne({
            _id: customPizza.cheese,
            available: true,
          }),

          Vegetable.find({
            _id: {
              $in: customPizza.vegetables,
            },
            available: true,
          }),
        ]);

        if (!base || !sauce || !cheese) {
          return res.status(400).json({
            success: false,
            message: "One or more custom pizza ingredients are unavailable.",
          });
        }

        if (vegetables.length !== customPizza.vegetables.length) {
          return res.status(400).json({
            success: false,
            message: "One or more custom pizza vegetables are unavailable.",
          });
        }

        // -----------------------------------------------------
        // STOCK CHECK
        // -----------------------------------------------------

        const requiredStock = item.quantity;

        if (
          base.stock < requiredStock ||
          sauce.stock < requiredStock ||
          cheese.stock < requiredStock
        ) {
          return res.status(400).json({
            success: false,
            message:
              "One or more custom pizza ingredients do not have enough stock.",
          });
        }

        for (const vegetable of vegetables) {
          if (vegetable.stock < requiredStock) {
            return res.status(400).json({
              success: false,
              message: `${vegetable.name} does not have enough stock.`,
            });
          }
        }

        // -----------------------------------------------------
        // TRUSTED PRICE
        // -----------------------------------------------------

        const vegetableTotal = vegetables.reduce(
          (sum, vegetable) => sum + vegetable.price,
          0,
        );

        const unitPrice =
          base.price + sauce.price + cheese.price + vegetableTotal;

        const subtotal = unitPrice * item.quantity;

        orderItems.push({
          itemType: "custom",

          pizza: {},

          customPizza: {
            base: {
              id: base._id,
              name: base.name,
              price: base.price,
            },

            sauce: {
              id: sauce._id,
              name: sauce.name,
              price: sauce.price,
            },

            cheese: {
              id: cheese._id,
              name: cheese.name,
              price: cheese.price,
            },

            vegetables: vegetables.map((vegetable) => ({
              id: vegetable._id,
              name: vegetable.name,
              price: vegetable.price,
            })),
          },

          quantity: item.quantity,
          unitPrice,
          subtotal,
        });

        totalQuantity += item.quantity;
        totalAmount += subtotal;
      }
    }

    // ---------------------------------------------------------
    // CREATE ORDER DOCUMENT
    // ---------------------------------------------------------

    const order = await Order.create({
      user: req.user.id,

      items: orderItems,

      totalQuantity,

      totalAmount: Number(totalAmount.toFixed(2)),

      deliveryAddress: {
        street,
        city,
        province,
        postalCode,
        phone,
      },

      paymentStatus: "Pending",

      status: "Order Received",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create order.",
      error: error.message,
    });
  }
};

// =============================================================
// GET CUSTOMER ORDERS
// =============================================================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({
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

module.exports = {
  createOrder,
  getMyOrders,
};
