/*
==============================================================
              SEED PIZZA BUILDER OPTIONS
==============================================================

This utility inserts the initial ingredient options used
by the custom pizza builder.

It uses upsert so that:

• Existing options are updated.
• Missing options are created.
• Duplicate options are avoided.
• Existing collections are not deleted.

Run:

node utils/seedBuilderOptions.js

==============================================================
*/

// Load environment variables.
require("dotenv").config();

// Import the database connection.
const connectDB = require("../config/db");

// Import pizza builder models.
const PizzaBase = require("../models/PizzaBase");
const Sauce = require("../models/Sauce");
const Cheese = require("../models/Cheese");
const Vegetable = require("../models/Vegetable");

// =============================================================
// INITIAL PIZZA BASES
// =============================================================

// The assignment requires five pizza base options.
const pizzaBases = [
  {
    name: "Thin Crust",
    price: 0,
    available: true,
  },
  {
    name: "Thick Crust",
    price: 10,
    available: true,
  },
  {
    name: "Stuffed Crust",
    price: 20,
    available: true,
  },
  {
    name: "Gluten Free",
    price: 15,
    available: true,
  },
  {
    name: "Cheese Burst",
    price: 25,
    available: true,
  },
];

// =============================================================
// INITIAL SAUCES
// =============================================================

// The assignment requires five sauce options.
const sauces = [
  {
    name: "Tomato",
    price: 0,
    available: true,
  },
  {
    name: "BBQ",
    price: 5,
    available: true,
  },
  {
    name: "Garlic",
    price: 5,
    available: true,
  },
  {
    name: "Pesto",
    price: 10,
    available: true,
  },
  {
    name: "Alfredo",
    price: 10,
    available: true,
  },
];

// =============================================================
// INITIAL CHEESES
// =============================================================

const cheeses = [
  {
    name: "Mozzarella",
    price: 10,
    available: true,
  },
  {
    name: "Cheddar",
    price: 12,
    available: true,
  },
  {
    name: "Parmesan",
    price: 15,
    available: true,
  },
  {
    name: "Feta",
    price: 15,
    available: true,
  },
];

// =============================================================
// INITIAL VEGETABLES
// =============================================================

// Customers may select multiple vegetables.
const vegetables = [
  {
    name: "Mushrooms",
    price: 8,
    available: true,
  },
  {
    name: "Onions",
    price: 5,
    available: true,
  },
  {
    name: "Green Peppers",
    price: 6,
    available: true,
  },
  {
    name: "Olives",
    price: 8,
    available: true,
  },
  {
    name: "Tomatoes",
    price: 5,
    available: true,
  },
  {
    name: "Jalapenos",
    price: 7,
    available: true,
  },
];

// =============================================================
// REUSABLE UPSERT FUNCTION
// =============================================================

const upsertOptions = async (Model, options) => {
  /*
  Create one MongoDB update operation for each option.

  The name acts as the identifier for seed purposes.

  upsert: true means:
  • Update when the option already exists.
  • Create when it does not exist.
  */

  const operations = options.map((option) => ({
    updateOne: {
      filter: {
        name: option.name,
      },
      update: {
        $set: option,
      },
      upsert: true,
    },
  }));

  return Model.bulkWrite(operations);
};

// =============================================================
// SEED BUILDER OPTIONS
// =============================================================

const seedBuilderOptions = async () => {
  try {
    // Connect the standalone script to MongoDB.
    await connectDB();

    // Seed each ingredient category.
    await upsertOptions(PizzaBase, pizzaBases);
    await upsertOptions(Sauce, sauces);
    await upsertOptions(Cheese, cheeses);
    await upsertOptions(Vegetable, vegetables);

    console.log("=================================================");
    console.log("🍕 Pizza Builder Seed Complete");
    console.log("=================================================");
    console.log(`Pizza bases : ${pizzaBases.length}`);
    console.log(`Sauces      : ${sauces.length}`);
    console.log(`Cheeses     : ${cheeses.length}`);
    console.log(`Vegetables  : ${vegetables.length}`);
    console.log("=================================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed pizza builder options:");
    console.error(error.message);

    process.exit(1);
  }
};

seedBuilderOptions();
