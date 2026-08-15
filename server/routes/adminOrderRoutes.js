/*
==============================================================
                  ADMIN ORDER ROUTES
==============================================================

These routes allow administrators to manage incoming orders.

All routes require:

• Valid administrator JWT
• Admin role

==============================================================
*/

const express = require("express");

const router = express.Router();

const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/adminOrderController");

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

// Protect every route below.
router.use(adminAuthMiddleware, authorizeRoles("admin"));

// Return every customer order.
router.get("/", getAllOrders);

// Return one order.
router.get("/:id", getOrderById);

// Update order status.
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
