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
