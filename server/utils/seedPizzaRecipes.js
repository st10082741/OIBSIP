/*
==============================================================
                    SEED PIZZA RECIPES
==============================================================

This utility maps existing catalog pizzas to the inventory
ingredients they consume.

Why this exists:

• Catalog pizzas need inventory recipes.
• Recipes should use MongoDB references, not hardcoded names.
• Existing pizza documents are updated safely.
• The script can be rerun without creating duplicate pizzas.

Run:

node utils/seedPizzaRecipes.js

==============================================================
*/

// Load environment variables.
require("dotenv").config();

// Connect to MongoDB.
const connectDB = require("../config/db");

// Import models.
const Pizza = require("../models/Pizza");
const PizzaBase = require("../models/PizzaBase");
const Sauce = require("../models/Sauce");
const Cheese = require("../models/Cheese");
const Vegetable = require("../models/Vegetable");

// =============================================================
// FIND INGREDIENT BY NAME
// =============================================================

const findIngredient = async (Model, name) => {
  const ingredient = await Model.findOne({
    name,
  });

  if (!ingredient) {
    throw new Error(`Ingredient not found: ${name}`);
  }

  return ingredient;
};

// =============================================================
// SEED PIZZA RECIPES
// =============================================================

const seedPizzaRecipes = async () => {
  try {
    await connectDB();

    // ---------------------------------------------------------
    // LOAD COMMON INGREDIENTS
    // ---------------------------------------------------------

    const [
      thinCrust,
      tomato,
      bbq,
      garlic,
      mozzarella,
      mushrooms,
      onions,
      greenPeppers,
      tomatoes,
    ] = await Promise.all([
      findIngredient(PizzaBase, "Thin Crust"),

      findIngredient(Sauce, "Tomato"),

      findIngredient(Sauce, "BBQ"),

      findIngredient(Sauce, "Garlic"),

      findIngredient(Cheese, "Mozzarella"),

      findIngredient(Vegetable, "Mushrooms"),

      findIngredient(Vegetable, "Onions"),

      findIngredient(Vegetable, "Green Peppers"),

      findIngredient(Vegetable, "Tomatoes"),
    ]);

    // ---------------------------------------------------------
    // RECIPE DEFINITIONS
    // ---------------------------------------------------------

    /*
    These recipes map catalog pizzas to ingredients that
    already exist in the inventory system.

    Some toppings such as pepperoni, chicken, beef, seafood,
    ham and pineapple are not currently represented in the
    inventory collections, so we only map ingredients that
    the existing inventory architecture can actually track.

    This keeps the data honest rather than inventing stock.
    */

    const recipes = [
      {
        pizzaName: "Pepperoni",

        recipe: {
          base: thinCrust._id,
          sauce: tomato._id,
          cheese: mozzarella._id,
          vegetables: [],
        },
      },

      {
        pizzaName: "BBQ Chicken",

        recipe: {
          base: thinCrust._id,
          sauce: bbq._id,
          cheese: mozzarella._id,
          vegetables: [],
        },
      },

      {
        pizzaName: "Margherita",

        recipe: {
          base: thinCrust._id,
          sauce: tomato._id,
          cheese: mozzarella._id,
          vegetables: [tomatoes._id],
        },
      },

      {
        pizzaName: "Hawaiian",

        recipe: {
          base: thinCrust._id,
          sauce: tomato._id,
          cheese: mozzarella._id,
          vegetables: [],
        },
      },

      {
        pizzaName: "Beef Supreme",

        recipe: {
          base: thinCrust._id,
          sauce: tomato._id,
          cheese: mozzarella._id,
          vegetables: [greenPeppers._id, onions._id],
        },
      },

      {
        pizzaName: "Seafood Deluxe",

        recipe: {
          base: thinCrust._id,
          sauce: garlic._id,
          cheese: mozzarella._id,
          vegetables: [],
        },
      },
    ];

    // ---------------------------------------------------------
    // UPDATE PIZZAS
    // ---------------------------------------------------------

    for (const item of recipes) {
      const pizza = await Pizza.findOneAndUpdate(
        {
          name: item.pizzaName,
        },
        {
          $set: {
            recipe: item.recipe,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!pizza) {
        throw new Error(`Pizza not found: ${item.pizzaName}`);
      }

      console.log(`✅ Recipe updated: ${pizza.name}`);
    }

    console.log("=================================================");
    console.log("🍕 Catalog Pizza Recipe Seed Complete");
    console.log("=================================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed pizza recipes:");

    console.error(error.message);

    process.exit(1);
  }
};

seedPizzaRecipes();
