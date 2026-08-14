/*
==============================================================
                        ORDER MODEL
==============================================================

This model represents a confirmed customer order.

An order may contain:

• Catalog pizzas
• Custom pizzas
• Delivery information
• Trusted prices
• Payment information
• Order status

Order status flow:

Order Received
      ↓
In Kitchen
      ↓
Sent to Delivery

==============================================================
*/

const mongoose = require("mongoose");

// =============================================================
// CUSTOM ORDER PIZZA SCHEMA
// =============================================================

const customOrderPizzaSchema = new mongoose.Schema(
  {
    base: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      price: {
        type: Number,
        required: true,
      },
    },

    sauce: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      price: {
        type: Number,
        required: true,
      },
    },

    cheese: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      price: {
        type: Number,
        required: true,
      },
    },

    vegetables: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    _id: false,
  },
);

// =============================================================
// ORDER ITEM SCHEMA
// =============================================================

const orderItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["catalog", "custom"],
      required: true,
    },

    /*
    Catalog pizza information is stored as a snapshot.

    Even if the pizza is later renamed or removed,
    the historical order still remembers what was purchased.
    */
    pizza: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },

      name: {
        type: String,
      },

      image: {
        type: String,
        default: "",
      },
    },

    customPizza: {
      type: customOrderPizzaSchema,
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

// =============================================================
// DELIVERY ADDRESS SCHEMA
// =============================================================

const deliveryAddressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    province: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

// =============================================================
// ORDER SCHEMA
// =============================================================

const orderSchema = new mongoose.Schema(
  {
    // Customer who placed the order.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Snapshot of ordered products.
    items: {
      type: [orderItemSchema],
      required: true,
    },

    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },

    /*
    Payment starts as pending.

    Razorpay will later change this after a successful
    test payment.
    */
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      default: "Razorpay",
    },

    /*
Simulated Razorpay test identifiers.

These mimic the structure of a real payment gateway flow
while we remain in internship test mode.
*/

    testPaymentOrderId: {
      type: String,
      default: "",
    },

    testPaymentId: {
      type: String,
      default: "",
    },

    /*
    Required order-tracking flow from the assignment.
    */
    status: {
      type: String,
      enum: ["Order Received", "In Kitchen", "Sent to Delivery"],
      default: "Order Received",
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
