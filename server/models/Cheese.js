/*
==============================================================
                    CHEESE MODEL
==============================================================

This model represents cheese options available in the
custom pizza builder.

Customers select one cheese type.

==============================================================
*/

const mongoose = require("mongoose");

const cheeseSchema = new mongoose.Schema(
  {
    // Cheese name displayed to customers.
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Additional price charged for this cheese.
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // -----------------------------
    // Current Stock
    // -----------------------------

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // -----------------------------
    // Unit of Measure
    // -----------------------------

    unit: {
      type: String,
      required: true,
      default: "units",
      trim: true,
    },

    // -----------------------------
    // Low Stock Threshold
    // -----------------------------

    lowStockThreshold: {
      type: Number,
      required: true,
      default: 20,
      min: 0,
    },

    // Allows the option to be hidden without deleting it.
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Cheese = mongoose.model("Cheese", cheeseSchema);

module.exports = Cheese;
