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
