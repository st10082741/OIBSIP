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

      // Prevent two pizzas from having the exact same name.
      unique: true,

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
    // Inventory Recipe
    // -----------------------------

    /*
Maps a catalog pizza to the inventory ingredients
consumed whenever the pizza is successfully ordered.

This allows regular menu pizzas to use the same
inventory system as custom-built pizzas.

The recipe stores MongoDB references rather than
hardcoded ingredient names.
*/

    recipe: {
      base: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PizzaBase",
        default: null,
      },

      sauce: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sauce",
        default: null,
      },

      cheese: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cheese",
        default: null,
      },

      vegetables: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vegetable",
        },
      ],
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
