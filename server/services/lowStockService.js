/*
==============================================================
                  LOW STOCK SERVICE
==============================================================

This service detects inventory items that have reached
or fallen below their configured low-stock threshold.

Supported inventory categories:

• Pizza Bases
• Sauces
• Cheeses
• Vegetables

Example:

Stock: 8
Threshold: 20

8 <= 20
→ LOW STOCK

==============================================================
*/

const PizzaBase = require("../models/PizzaBase");
const Sauce = require("../models/Sauce");
const Cheese = require("../models/Cheese");
const Vegetable = require("../models/Vegetable");

// =============================================================
// FIND LOW-STOCK ITEMS
// =============================================================

const getLowStockItems = async () => {
  /*
  MongoDB compares fields awkwardly in a normal find query,
  so we retrieve the inventory categories concurrently and
  evaluate each item's configured threshold in JavaScript.

  The inventory collections are small, making this clear and
  suitable for the current application.
  */

  const [pizzaBases, sauces, cheeses, vegetables] = await Promise.all([
    PizzaBase.find(),
    Sauce.find(),
    Cheese.find(),
    Vegetable.find(),
  ]);

  const lowStockItems = [];

  // -----------------------------------------------------------
  // PIZZA BASES
  // -----------------------------------------------------------

  pizzaBases.forEach((item) => {
    if (item.stock <= item.lowStockThreshold) {
      lowStockItems.push({
        id: item._id,
        name: item.name,
        category: "Pizza Base",
        stock: item.stock,
        threshold: item.lowStockThreshold,
        unit: item.unit,
      });
    }
  });

  // -----------------------------------------------------------
  // SAUCES
  // -----------------------------------------------------------

  sauces.forEach((item) => {
    if (item.stock <= item.lowStockThreshold) {
      lowStockItems.push({
        id: item._id,
        name: item.name,
        category: "Sauce",
        stock: item.stock,
        threshold: item.lowStockThreshold,
        unit: item.unit,
      });
    }
  });

  // -----------------------------------------------------------
  // CHEESES
  // -----------------------------------------------------------

  cheeses.forEach((item) => {
    if (item.stock <= item.lowStockThreshold) {
      lowStockItems.push({
        id: item._id,
        name: item.name,
        category: "Cheese",
        stock: item.stock,
        threshold: item.lowStockThreshold,
        unit: item.unit,
      });
    }
  });

  // -----------------------------------------------------------
  // VEGETABLES
  // -----------------------------------------------------------

  vegetables.forEach((item) => {
    if (item.stock <= item.lowStockThreshold) {
      lowStockItems.push({
        id: item._id,
        name: item.name,
        category: "Vegetable",
        stock: item.stock,
        threshold: item.lowStockThreshold,
        unit: item.unit,
      });
    }
  });

  return lowStockItems;
};

module.exports = {
  getLowStockItems,
};
