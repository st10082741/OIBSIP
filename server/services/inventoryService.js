/*
==============================================================
                    INVENTORY SERVICE
==============================================================

This service contains transaction-safe inventory logic used
during real order finalisation.

Responsibilities:

• Validate inventory
• Handle order quantities
• Prevent negative stock
• Prevent overselling
• Deduct ingredients atomically
• Work inside a MongoDB transaction

IMPORTANT:

Inventory is not permanently changed unless the entire
order finalisation transaction succeeds.

==============================================================
*/
const Pizza = require("../models/Pizza");
const PizzaBase = require("../models/PizzaBase");
const Sauce = require("../models/Sauce");
const Cheese = require("../models/Cheese");
const Vegetable = require("../models/Vegetable");

// =============================================================
// ATOMIC CONDITIONAL STOCK DEDUCTION
// =============================================================

/*
This helper performs an atomic MongoDB update.

Instead of:

1. Read stock
2. Check stock
3. Save new stock

we ask MongoDB to perform:

"Reduce stock ONLY if enough stock currently exists."

This protects against two simultaneous customers attempting
to consume the same final inventory.
*/

const deductItemStock = async (
  Model,
  id,
  quantity,
  ingredientName,
  session,
) => {
  const item = await Model.findOneAndUpdate(
    {
      _id: id,

      // Ingredient must still be available.
      available: true,

      // There must be enough stock at update time.
      stock: {
        $gte: quantity,
      },
    },

    {
      // Atomic decrement.
      $inc: {
        stock: -quantity,
      },
    },

    {
      returnDocument: "after",
      session,
      runValidators: true,
    },
  );

  /*
  If nothing was updated, one of these happened:

  • Item no longer exists
  • Item became unavailable
  • Another order consumed the remaining stock
  • There was insufficient stock
  */

  if (!item) {
    throw new Error(
      `${ingredientName} is unavailable or does not have enough stock.`,
    );
  }

  return item;
};

// =============================================================
// DEDUCT ONE CUSTOM ORDER ITEM
// =============================================================

const deductCustomOrderItem = async (orderItem, session) => {
  const quantity = orderItem.quantity;

  const customPizza = orderItem.customPizza;

  /*
  Deduct ONE base, sauce, cheese and each vegetable
  per custom pizza ordered.

  Example:

  Quantity = 2

  Stuffed Crust 100 → 98
  Pesto         100 → 98
  Parmesan      100 → 98
  Mushrooms      99 → 97
  Onions         99 → 97
  */

  const base = await deductItemStock(
    PizzaBase,
    customPizza.base.id,
    quantity,
    customPizza.base.name,
    session,
  );

  const sauce = await deductItemStock(
    Sauce,
    customPizza.sauce.id,
    quantity,
    customPizza.sauce.name,
    session,
  );

  const cheese = await deductItemStock(
    Cheese,
    customPizza.cheese.id,
    quantity,
    customPizza.cheese.name,
    session,
  );

  const vegetables = [];

  for (const vegetable of customPizza.vegetables) {
    const updatedVegetable = await deductItemStock(
      Vegetable,
      vegetable.id,
      quantity,
      vegetable.name,
      session,
    );

    vegetables.push(updatedVegetable);
  }

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

// =============================================================
// DEDUCT ONE CATALOG PIZZA ORDER ITEM
// =============================================================

const deductCatalogOrderItem = async (orderItem, session) => {
  const quantity = orderItem.quantity;

  /*
  The Order stores a snapshot of the catalog pizza,
  including its original MongoDB pizza ID.

  We use that ID to retrieve the CURRENT recipe from
  the Pizza collection.
  */

  const pizza = await Pizza.findById(orderItem.pizza.id).session(session);

  if (!pizza) {
    throw new Error(`Catalog pizza no longer exists.`);
  }

  if (!pizza.available) {
    throw new Error(`${pizza.name} is no longer available.`);
  }

  /*
  Every catalog pizza must have the three required
  core inventory ingredients before checkout can
  consume stock.
  */

  if (
    !pizza.recipe ||
    !pizza.recipe.base ||
    !pizza.recipe.sauce ||
    !pizza.recipe.cheese
  ) {
    throw new Error(`${pizza.name} does not have a complete inventory recipe.`);
  }

  // -----------------------------------------------------------
  // BASE
  // -----------------------------------------------------------

  const base = await deductItemStock(
    PizzaBase,
    pizza.recipe.base,
    quantity,
    `${pizza.name} pizza base`,
    session,
  );

  // -----------------------------------------------------------
  // SAUCE
  // -----------------------------------------------------------

  const sauce = await deductItemStock(
    Sauce,
    pizza.recipe.sauce,
    quantity,
    `${pizza.name} sauce`,
    session,
  );

  // -----------------------------------------------------------
  // CHEESE
  // -----------------------------------------------------------

  const cheese = await deductItemStock(
    Cheese,
    pizza.recipe.cheese,
    quantity,
    `${pizza.name} cheese`,
    session,
  );

  // -----------------------------------------------------------
  // VEGETABLES
  // -----------------------------------------------------------

  const vegetables = [];

  for (const vegetableId of pizza.recipe.vegetables || []) {
    const vegetable = await deductItemStock(
      Vegetable,
      vegetableId,
      quantity,
      `${pizza.name} vegetable`,
      session,
    );

    vegetables.push(vegetable);
  }

  return {
    pizza: {
      id: pizza._id,
      name: pizza.name,
    },

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

// =============================================================
// DEDUCT INVENTORY FOR AN ENTIRE ORDER
// =============================================================

const deductOrderInventory = async (order, session) => {
  const deductions = [];

  for (const item of order.items) {
    // ---------------------------------------------------------
    // CUSTOM PIZZA
    // ---------------------------------------------------------

    if (item.itemType === "custom") {
      const deduction = await deductCustomOrderItem(item, session);

      deductions.push({
        itemType: "custom",
        quantity: item.quantity,
        deduction,
      });

      continue;
    }

    // ---------------------------------------------------------
    // CATALOG PIZZA
    // ---------------------------------------------------------

    if (item.itemType === "catalog") {
      const deduction = await deductCatalogOrderItem(item, session);

      deductions.push({
        itemType: "catalog",
        quantity: item.quantity,
        deduction,
      });

      continue;
    }

    /*
    Defensive protection.

    We should never silently ignore an unknown order type
    during inventory finalisation.
    */

    throw new Error(`Unsupported order item type: ${item.itemType}`);
  }

  return deductions;
};

module.exports = {
  deductOrderInventory,
};
