/*
==============================================================
                  ADMIN PIZZA ROUTES
==============================================================

These routes allow administrators to manage the pizza menu.

Every route is protected by:

• Admin JWT authentication
• Admin role authorization

Customers cannot create, edit or delete pizzas.

==============================================================
*/

const express = require("express");

const router = express.Router();

// Import administrator pizza controllers.
const {
  getAllAdminPizzas,
  getAdminPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
  uploadPizzaImage,
} = require("../controllers/adminPizzaController");

// Import administrator security middleware.
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const pizzaUpload = require("../middleware/pizzaUploadMiddleware");

// =============================================================
// PROTECT EVERY ROUTE BELOW
// =============================================================

router.use(adminAuthMiddleware, authorizeRoles("admin"));

// =============================================================
// ADMIN PIZZA CRUD
// =============================================================

// Return all pizzas, including unavailable pizzas.
router.get("/", getAllAdminPizzas);

// Create a new pizza.
router.post("/", createPizza);

// Upload or replace one pizza image.
router.patch("/:id/image", pizzaUpload.single("image"), uploadPizzaImage);

// Return one pizza by ID.
router.get("/:id", getAdminPizzaById);

// Edit a pizza.
router.patch("/:id", updatePizza);

// Permanently delete a pizza.
router.delete("/:id", deletePizza);

module.exports = router;
