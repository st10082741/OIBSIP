/*
==============================================================
                    PIZZA MODEL
==============================================================

This model represents pizzas displayed to customers.

Every pizza stored in MongoDB contains:

• Name
• Description
• Price
• Category
• Image
• Rating
• Featured
• Popular
• Availability

==============================================================
*/

// Import mongoose.
const mongoose = require("mongoose");

// Create the Pizza schema.
const pizzaSchema = new mongoose.Schema(
  {
    // -----------------------------
    // Pizza Name
    // -----------------------------
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // -----------------------------
    // Pizza Description
    // -----------------------------
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // -----------------------------
    // Pizza Price
    // -----------------------------
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // -----------------------------
    // Pizza Category
    // -----------------------------
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // -----------------------------
    // Pizza Image
    // -----------------------------
    image: {
      type: String,
      default: "",
    },

    // -----------------------------
    // Customer Rating
    // -----------------------------
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // -----------------------------
    // Featured Pizza
    // -----------------------------
    featured: {
      type: Boolean,
      default: false,
    },

    // -----------------------------
    // Popular Pizza
    // -----------------------------
    popular: {
      type: Boolean,
      default: false,
    },

    // -----------------------------
    // Pizza Availability
    // -----------------------------
    available: {
      type: Boolean,
      default: true,
    },
  },

  // Automatically creates
  // createdAt and updatedAt.
  {
    timestamps: true,
  },
);

// Create the Pizza model.
const Pizza = mongoose.model("Pizza", pizzaSchema);

// Export the model.
module.exports = Pizza;
