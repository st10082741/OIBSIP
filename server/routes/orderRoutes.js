/*
==============================================================
                    ORDER ROUTES
==============================================================

These routes belong to authenticated customers.

Customers can:

• Create an order
• View their own orders

==============================================================
*/

const express = require("express");

const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getCurrentOrder,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

// Protect every order route.
router.use(authMiddleware);

// Create a new order from the authenticated customer's cart.
router.post("/", createOrder);

// Return the authenticated customer's current order.
router.get("/current", getCurrentOrder);

// Return the authenticated customer's orders.
router.get("/", getMyOrders);

module.exports = router;
