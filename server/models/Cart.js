/*
==============================================================
                        CART MODEL
==============================================================

This model represents a customer's shopping cart.

A cart belongs to one customer and may contain:

• Regular menu pizzas
• Custom-built pizzas

Important:
• Quantity is stored per cart item.
• Unit price is stored as a cart snapshot.
• Cart totals are calculated by the backend.
• Checkout will later revalidate prices before payment.

==============================================================
*/

const mongoose = require("mongoose");

// =============================================================
// CUSTOM PIZZA SELECTION SCHEMA
// =============================================================

/*
A custom pizza remembers which ingredients were selected.

The actual ingredient data remains in the individual
PizzaBase, Sauce, Cheese and Vegetable collections.
*/

const customPizzaSchema = new mongoose.Schema(
  {
    base: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PizzaBase",
    },

    sauce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sauce",
    },

    cheese: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cheese",
    },

    vegetables: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vegetable",
      },
    ],
  },
  {
    _id: false,
  },
);

// =============================================================
// CART ITEM SCHEMA
// =============================================================

const cartItemSchema = new mongoose.Schema(
  {
    /*
    Distinguishes between:

    • A normal pizza from the menu
    • A custom-built pizza
    */
    itemType: {
      type: String,
      enum: ["catalog", "custom"],
      required: true,
    },

    /*
    Used when itemType = "catalog".

    References a Pizza document.
    */
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pizza",
      default: null,
    },

    /*
    Used when itemType = "custom".
    */
    customPizza: {
      type: customPizzaSchema,
      default: null,
    },

    // Number of this item the customer wants.
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    /*
    Price of one item when it was placed in the cart.

    IMPORTANT:
    Checkout will later revalidate the current price
    before payment so the browser cannot control pricing.
    */
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// =============================================================
// CART SCHEMA
// =============================================================

const cartSchema = new mongoose.Schema(
  {
    // Every cart belongs to exactly one customer.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
