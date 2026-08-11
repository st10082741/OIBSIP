/*
==============================================================
                    SAUCE MODEL
==============================================================

This model represents sauces available in the
custom pizza builder.

The assignment requires five sauce options.

==============================================================
*/

const mongoose = require("mongoose");

const sauceSchema = new mongoose.Schema(
  {
    // Sauce name displayed to customers.
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Additional price for this sauce.
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

    /*
Sauces could later use litres, bottles or portions.
For this project we begin with units for simple
and predictable stock deduction.
*/
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

    // Allows the admin to enable or disable the sauce.
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Sauce = mongoose.model("Sauce", sauceSchema);

module.exports = Sauce;
