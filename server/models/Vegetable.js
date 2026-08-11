/*
==============================================================
                    VEGETABLE MODEL
==============================================================

This model represents vegetable toppings available in the
custom pizza builder.

Unlike bases, sauces and cheese, customers may select
multiple vegetables.

==============================================================
*/

const mongoose = require("mongoose");

const vegetableSchema = new mongoose.Schema(
  {
    // Vegetable name displayed to customers.
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Additional price for selecting this vegetable.
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

    // Allows the admin to temporarily disable this vegetable.
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Vegetable = mongoose.model("Vegetable", vegetableSchema);

module.exports = Vegetable;
