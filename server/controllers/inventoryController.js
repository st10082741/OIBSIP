/*
==============================================================
                INVENTORY CONTROLLER
==============================================================

This controller handles administrator inventory operations.

Current responsibilities:
• Return the inventory dashboard
• Add inventory items
• Edit inventory items
• Update stock manually
• Change low-stock thresholds
• Enable or disable ingredients
• Delete inventory items

Important:
• All inventory routes are admin-only.
• The same reusable controller works across:
  - Pizza Bases
  - Sauces
  - Cheeses
  - Vegetables

==============================================================
*/

// Import the four inventory-aware ingredient models.
const PizzaBase = require("../models/PizzaBase");
const Sauce = require("../models/Sauce");
const Cheese = require("../models/Cheese");
const Vegetable = require("../models/Vegetable");

// =============================================================
// CATEGORY → MODEL MAP
// =============================================================

/*
Instead of writing four almost-identical controllers,
we map a category name to the correct Mongoose model.

Example:

pizza-base
    ↓
PizzaBase model
*/

const modelMap = {
  "pizza-base": PizzaBase,
  sauce: Sauce,
  cheese: Cheese,
  vegetable: Vegetable,
};

// =============================================================
// GET MODEL FROM CATEGORY
// =============================================================

const getModelByCategory = (category) => {
  return modelMap[category];
};

// =============================================================
// FORMAT INVENTORY ITEM
// =============================================================

const formatInventoryItem = (item, category) => {
  return {
    id: item._id,
    name: item.name,
    category,
    price: item.price,
    stock: item.stock,
    unit: item.unit,
    lowStockThreshold: item.lowStockThreshold,
    available: item.available,

    // Dynamically determine whether the item is low in stock.
    isLowStock: item.stock <= item.lowStockThreshold,
  };
};

// =============================================================
// GET INVENTORY DASHBOARD
// =============================================================

const getInventoryDashboard = async (req, res) => {
  try {
    // Fetch all inventory categories concurrently.
    const [pizzaBases, sauces, cheeses, vegetables] = await Promise.all([
      PizzaBase.find().sort({ name: 1 }),
      Sauce.find().sort({ name: 1 }),
      Cheese.find().sort({ name: 1 }),
      Vegetable.find().sort({ name: 1 }),
    ]);

    const formattedBases = pizzaBases.map((item) =>
      formatInventoryItem(item, "Pizza Base"),
    );

    const formattedSauces = sauces.map((item) =>
      formatInventoryItem(item, "Sauce"),
    );

    const formattedCheeses = cheeses.map((item) =>
      formatInventoryItem(item, "Cheese"),
    );

    const formattedVegetables = vegetables.map((item) =>
      formatInventoryItem(item, "Vegetable"),
    );

    const allInventoryItems = [
      ...formattedBases,
      ...formattedSauces,
      ...formattedCheeses,
      ...formattedVegetables,
    ];

    const lowStockItems = allInventoryItems.filter((item) => item.isLowStock);

    return res.status(200).json({
      success: true,
      message: "Inventory dashboard loaded successfully.",

      summary: {
        totalItems: allInventoryItems.length,
        lowStockItems: lowStockItems.length,
        totalPizzaBases: formattedBases.length,
        totalSauces: formattedSauces.length,
        totalCheeses: formattedCheeses.length,
        totalVegetables: formattedVegetables.length,
      },

      inventory: {
        pizzaBases: formattedBases,
        sauces: formattedSauces,
        cheeses: formattedCheeses,
        vegetables: formattedVegetables,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load inventory dashboard.",
      error: error.message,
    });
  }
};

// =============================================================
// ADD INVENTORY ITEM
// =============================================================

const addInventoryItem = async (req, res) => {
  try {
    // Category comes from the URL.
    const { category } = req.params;

    // Find the correct Mongoose model.
    const Model = getModelByCategory(category);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory category.",
      });
    }

    // Read item details from the request body.
    const { name, price, stock, unit, lowStockThreshold, available } = req.body;

    // Basic validation.
    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required.",
      });
    }

    // Prevent duplicate item names inside the same category.
    const existingItem = await Model.findOne({ name });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "An inventory item with this name already exists.",
      });
    }

    // Create the new item.
    const item = await Model.create({
      name,
      price,
      stock: stock ?? 0,
      unit: unit ?? "units",
      lowStockThreshold: lowStockThreshold ?? 20,
      available: available ?? true,
    });

    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully.",
      item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create inventory item.",
      error: error.message,
    });
  }
};

// =============================================================
// UPDATE INVENTORY ITEM
// =============================================================

const updateInventoryItem = async (req, res) => {
  try {
    const { category, id } = req.params;

    const Model = getModelByCategory(category);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory category.",
      });
    }

    /*
    Only allow fields that an administrator
    is meant to manage.
    */

    const allowedFields = [
      "name",
      "price",
      "stock",
      "unit",
      "lowStockThreshold",
      "available",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const item = await Model.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inventory item updated successfully.",
      item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update inventory item.",
      error: error.message,
    });
  }
};

// =============================================================
// ADJUST STOCK
// =============================================================

const adjustStock = async (req, res) => {
  try {
    const { category, id } = req.params;

    const Model = getModelByCategory(category);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory category.",
      });
    }

    /*
    amount may be positive or negative.

    Examples:

    +20 = restock 20 units
    -5  = manually remove 5 units
    */

    const { amount } = req.body;

    if (typeof amount !== "number") {
      return res.status(400).json({
        success: false,
        message: "Stock adjustment amount must be a number.",
      });
    }

    const item = await Model.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    const newStock = item.stock + amount;

    // Never allow inventory to become negative.
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be reduced below zero.",
      });
    }

    item.stock = newStock;

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully.",
      item: {
        id: item._id,
        name: item.name,
        stock: item.stock,
        lowStockThreshold: item.lowStockThreshold,
        isLowStock: item.stock <= item.lowStockThreshold,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update stock.",
      error: error.message,
    });
  }
};

// =============================================================
// DELETE INVENTORY ITEM
// =============================================================

const deleteInventoryItem = async (req, res) => {
  try {
    const { category, id } = req.params;

    const Model = getModelByCategory(category);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory category.",
      });
    }

    const item = await Model.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory item.",
      error: error.message,
    });
  }
};

// =============================================================
// TEST LOW-STOCK DETECTION
// =============================================================

const testLowStockDetection = async (req, res) => {
  try {
    const { getLowStockItems } = require("../services/lowStockService");

    const lowStockItems = await getLowStockItems();

    return res.status(200).json({
      success: true,
      count: lowStockItems.length,
      lowStockItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check low-stock inventory.",
      error: error.message,
    });
  }
};

// =============================================================
// TEST LOW-STOCK EMAIL
// =============================================================

const testLowStockEmail = async (req, res) => {
  try {
    const { getLowStockItems } = require("../services/lowStockService");

    const { sendLowStockEmail } = require("../services/lowStockEmailService");

    const lowStockItems = await getLowStockItems();

    if (lowStockItems.length === 0) {
      return res.status(200).json({
        success: true,
        emailSent: false,
        message: "No low-stock items detected. No email was sent.",
      });
    }

    const result = await sendLowStockEmail(lowStockItems);

    return res.status(200).json({
      success: true,
      emailSent: result.sent,
      count: lowStockItems.length,
      message: "Low-stock notification email sent successfully.",
      lowStockItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send low-stock notification email.",
      error: error.message,
    });
  }
};

// Export inventory controller functions.
module.exports = {
  getInventoryDashboard,
  addInventoryItem,
  updateInventoryItem,
  adjustStock,
  deleteInventoryItem,
  testLowStockDetection,
  testLowStockEmail,
};
