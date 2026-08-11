/*
==============================================================
                    INVENTORY SERVICE
==============================================================

This service contains reusable inventory business logic.

Responsibilities:
• Validate ingredient stock
• Prevent unavailable ingredients from being consumed
• Prevent stock from becoming negative
• Deduct stock for a custom pizza

Why a service?

Inventory deduction is business logic rather than HTTP logic.

Keeping it here means the same logic can later be called by:

• Order controllers
• Payment controllers
• Admin operations
• Other backend services

without duplicating code.

==============================================================
*/

// Import ingredient models.
const PizzaBase = require("../models/PizzaBase");
const Sauce = require("../models/Sauce");
const Cheese = require("../models/Cheese");
const Vegetable = require("../models/Vegetable");

// =============================================================
// VALIDATE INVENTORY ITEM
// =============================================================

/*
This helper verifies that an ingredient:

1. Exists
2. Is available
3. Has enough stock

It returns the database document when validation succeeds.
*/

const validateInventoryItem = async (Model, id, ingredientName) => {
  const item = await Model.findById(id);

  if (!item) {
    throw new Error(`${ingredientName} not found.`);
  }

  if (!item.available) {
    throw new Error(`${ingredientName} is currently unavailable.`);
  }

  if (item.stock < 1) {
    throw new Error(`${ingredientName} is out of stock.`);
  }

  return item;
};

// =============================================================
// DEDUCT CUSTOM PIZZA INVENTORY
// =============================================================

const deductCustomPizzaInventory = async ({
  baseId,
  sauceId,
  cheeseId,
  vegetableIds = [],
}) => {
  /*
  Retrieve and validate the main ingredients concurrently.

  These queries are independent, so Promise.all avoids
  unnecessary sequential database waiting.
  */

  const [base, sauce, cheese, vegetables] = await Promise.all([
    validateInventoryItem(PizzaBase, baseId, "Pizza base"),

    validateInventoryItem(Sauce, sauceId, "Sauce"),

    validateInventoryItem(Cheese, cheeseId, "Cheese"),

    Promise.all(
      vegetableIds.map((id) =>
        validateInventoryItem(Vegetable, id, "Vegetable"),
      ),
    ),
  ]);

  // ===========================================================
  // DEDUCT STOCK
  // ===========================================================

  /*
  One unit is consumed from each selected ingredient.

  Example:

  Thin Crust   15 → 14
  Tomato      100 → 99
  Mozzarella  100 → 99
  Mushrooms   100 → 99
  */

  base.stock -= 1;
  sauce.stock -= 1;
  cheese.stock -= 1;

  vegetables.forEach((vegetable) => {
    vegetable.stock -= 1;
  });

  // ===========================================================
  // SAVE UPDATED INVENTORY
  // ===========================================================

  /*
  Save all modified documents.

  Again, these operations are independent and can therefore
  be performed concurrently.
  */

  await Promise.all([
    base.save(),
    sauce.save(),
    cheese.save(),
    ...vegetables.map((vegetable) => vegetable.save()),
  ]);

  // Return a useful summary to whatever controller calls us.
  return {
    base: {
      id: base._id,
      name: base.name,
      remainingStock: base.stock,
    },

    sauce: {
      id: sauce._id,
      name: sauce.name,
      remainingStock: sauce.stock,
    },

    cheese: {
      id: cheese._id,
      name: cheese.name,
      remainingStock: cheese.stock,
    },

    vegetables: vegetables.map((vegetable) => ({
      id: vegetable._id,
      name: vegetable.name,
      remainingStock: vegetable.stock,
    })),
  };
};

module.exports = {
  deductCustomPizzaInventory,
};
