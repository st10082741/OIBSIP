/*
==============================================================
                    INVENTORY ROUTES
==============================================================

All routes in this file are administrator-only.

Supported inventory categories:

• pizza-base
• sauce
• cheese
• vegetable

IMPORTANT:
Specific routes such as /test-deduction must be declared
before dynamic routes such as /:category.

Otherwise, Express could interpret "test-deduction"
as an inventory category.

==============================================================
*/

const express = require("express");

const router = express.Router();

// =============================================================
// CONTROLLER IMPORTS
// =============================================================

const {
  getInventoryDashboard,
  addInventoryItem,
  updateInventoryItem,
  adjustStock,
  deleteInventoryItem,
  testLowStockDetection,
  testLowStockEmail,
} = require("../controllers/inventoryController");

// =============================================================
// SECURITY MIDDLEWARE
// =============================================================

// Verifies that a valid administrator JWT was provided.
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

// Verifies that the authenticated user has the admin role.
const authorizeRoles = require("../middleware/roleMiddleware");

// =============================================================
// PROTECT ALL INVENTORY ROUTES
// =============================================================

/*
Every route declared after this middleware requires:

1. A valid admin authentication token.
2. Administrator privileges.

This prevents customers from accessing or modifying inventory.
*/

router.use(adminAuthMiddleware, authorizeRoles("admin"));

// =============================================================
// INVENTORY DASHBOARD
// =============================================================

/*
GET /api/inventory

Returns:
• Pizza bases
• Sauces
• Cheeses
• Vegetables
• Stock levels
• Low-stock information
*/

router.get("/", getInventoryDashboard);

// =============================================================

// =============================================================
// ADD INVENTORY ITEM
// =============================================================

// =============================================================
// TEST LOW-STOCK DETECTION
// =============================================================

/*
GET /api/inventory/test-low-stock
/*
Returns a list of inventory items that are low in stock.
*/

router.get("/test-low-stock", testLowStockDetection);

router.post("/test-low-stock-email", testLowStockEmail);

/*
POST /api/inventory/:category

Examples:

POST /api/inventory/vegetable
POST /api/inventory/cheese
POST /api/inventory/sauce
POST /api/inventory/pizza-base
*/

router.post("/:category", addInventoryItem);

// =============================================================
// UPDATE INVENTORY ITEM
// =============================================================

/*
PATCH /api/inventory/:category/:id

Allows the administrator to update:

• Name
• Price
• Stock
• Unit
• Low-stock threshold
• Availability
*/

router.patch("/:category/:id", updateInventoryItem);

// =============================================================
// ADJUST STOCK
// =============================================================

/*
PATCH /api/inventory/:category/:id/stock

Positive amount:
+20 → Restock 20 units

Negative amount:
-5 → Remove 5 units
*/

router.patch("/:category/:id/stock", adjustStock);

// =============================================================
// DELETE INVENTORY ITEM
// =============================================================

/*
DELETE /api/inventory/:category/:id

Deletes an inventory item from its corresponding collection.
*/

router.delete("/:category/:id", deleteInventoryItem);

// Export the router.
module.exports = router;
