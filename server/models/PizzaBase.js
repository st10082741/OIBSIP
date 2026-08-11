/*
==============================================================
                    PIZZA BASE MODEL
==============================================================

This model represents pizza bases available in the
custom pizza builder.

Examples:
• Thin Crust
• Thick Crust
• Stuffed Crust
• Gluten Free
• Cheese Burst

The admin will later be able to manage these options.

==============================================================
*/

const mongoose = require("mongoose");

const pizzaBaseSchema = new mongoose.Schema(
  {
    // Name displayed to the customer.
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Additional amount charged for selecting this base.
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // -----------------------------
    // Current Stock
    // -----------------------------

    // Number of pizza bases currently available.
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // -----------------------------
    // Unit of Measure
    // -----------------------------

    // Describes how this inventory item is counted.
    // Pizza bases are normally counted as individual units.
    unit: {
      type: String,
      required: true,
      default: "units",
      trim: true,
    },

    // -----------------------------
    // Low Stock Threshold
    // -----------------------------

    /*
When stock reaches or falls below this value,
the item is considered low stock.

The automated notification milestone will later
use this value when sending emails to the admin.
*/
    lowStockThreshold: {
      type: Number,
      required: true,
      default: 20,
      min: 0,
    },

    /*
    Determines whether customers can currently select
    this base.

    Instead of deleting an option, the admin can disable it.
    */
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const PizzaBase = mongoose.model("PizzaBase", pizzaBaseSchema);

module.exports = PizzaBase;
