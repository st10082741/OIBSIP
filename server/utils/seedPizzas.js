/*
==============================================================
                SEED INITIAL PIZZA CATALOG
==============================================================

Purpose:

This development utility creates the initial pizza catalog
inside MongoDB.

Unlike a basic seed script, this version uses "upsert".

Upsert means:

• Update the pizza if it already exists.
• Insert the pizza if it does not exist.
• Avoid creating duplicate pizzas.
• Do not delete pizzas before inserting data.

Run:

node utils/seedPizzas.js

==============================================================
*/

// Load environment variables from the .env file.
require("dotenv").config();

// Import the MongoDB connection function.
const connectDB = require("../config/db");

// Import the Pizza model.
const Pizza = require("../models/Pizza");

// Initial pizzas used to populate the database.
const pizzas = [
  {
    name: "Pepperoni",
    description:
      "Loaded with mozzarella cheese and delicious pepperoni slices.",
    price: 129.99,
    category: "Pork",
    image: "",
    rating: 4.9,
    featured: true,
    popular: true,
    available: true,
  },
  {
    name: "Hawaiian",
    description:
      "A sweet and savoury combination of ham, pineapple and mozzarella.",
    price: 119.99,
    category: "Pork",
    image: "",
    rating: 4.7,
    featured: true,
    popular: false,
    available: true,
  },
  {
    name: "BBQ Chicken",
    description: "Grilled chicken, mozzarella and smoky barbecue sauce.",
    price: 149.99,
    category: "Chicken",
    image: "",
    rating: 4.8,
    featured: true,
    popular: true,
    available: true,
  },
  {
    name: "Margherita",
    description: "Classic tomato sauce, mozzarella cheese and fresh herbs.",
    price: 99.99,
    category: "Vegetarian",
    image: "",
    rating: 4.6,
    featured: false,
    popular: true,
    available: true,
  },
  {
    name: "Beef Supreme",
    description: "Seasoned beef, peppers, onions and melted mozzarella cheese.",
    price: 159.99,
    category: "Beef",
    image: "",
    rating: 4.8,
    featured: false,
    popular: true,
    available: true,
  },
  {
    name: "Seafood Deluxe",
    description:
      "A premium seafood combination with mozzarella and garlic sauce.",
    price: 179.99,
    category: "Seafood",
    image: "",
    rating: 4.5,
    featured: false,
    popular: false,
    available: true,
  },
];

// Seed or update the initial pizza catalog.
const seedPizzas = async () => {
  try {
    // Connect this standalone script to MongoDB Atlas.
    await connectDB();

    /*
    Process every pizza individually.

    updateOne searches for a pizza using its name.

    $set updates its current information.

    upsert: true means MongoDB creates the pizza when
    a matching pizza does not already exist.
    */
    const operations = pizzas.map((pizza) => ({
      updateOne: {
        filter: {
          name: pizza.name,
        },
        update: {
          $set: pizza,
        },
        upsert: true,
      },
    }));

    // Run all insert/update operations efficiently.
    const result = await Pizza.bulkWrite(operations);

    console.log("=================================================");
    console.log("🍕 Pizza Catalog Seed Complete");
    console.log("=================================================");
    console.log(`➕ New pizzas created : ${result.upsertedCount}`);
    console.log(`✏️ Existing pizzas updated: ${result.modifiedCount}`);
    console.log(`📦 Total seed entries : ${pizzas.length}`);
    console.log("=================================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed pizza catalog:");
    console.error(error.message);

    process.exit(1);
  }
};

// Run the seed function.
seedPizzas();
