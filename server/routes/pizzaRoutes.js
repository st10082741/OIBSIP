/*
==============================================================
                    PIZZA ROUTES
==============================================================

These routes handle customer requests for pizzas.

Current routes:

• GET /api/pizzas
• GET /api/pizzas/:id

Future routes:

• Search pizzas
• Featured pizzas
• Popular pizzas
• Category filtering
• Pizza management (Admin)

==============================================================
*/

const express = require("express");

const router = express.Router();

// Import pizza controller functions.
const {
  getAllPizzas,
  getFeaturedPizzas,
  getPopularPizzas,
  getPizzaById,
} = require("../controllers/pizzaController");

// =============================================================
// CUSTOMER ROUTES
// =============================================================

// Return every available pizza.
router.get("/", getAllPizzas);

// Return featured pizzas.
router.get("/featured", getFeaturedPizzas);

// Return popular pizzas.
router.get("/popular", getPopularPizzas);

// Return one pizza using its MongoDB ID.
router.get("/:id", getPizzaById);

// Export the router.
module.exports = router;
