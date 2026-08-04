/*
==============================================================
                    ADMIN ROUTES
==============================================================

Public:
• POST /api/admin/login

Protected:
• GET /api/admin/profile
• GET /api/admin/dashboard

==============================================================
*/

const express = require("express");

const router = express.Router();

// Import administrator controllers.
const {
  loginAdmin,
  getAdminProfile,
  getAdminDashboard,
} = require("../controllers/adminController");

// Authenticate the administrator and load their account.
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

// Check whether the authenticated administrator has an allowed role.
const authorizeRoles = require("../middleware/roleMiddleware");

// Public administrator login.
router.post("/login", loginAdmin);

// Any authenticated administrator may view their own profile.
router.get("/profile", adminAuthMiddleware, getAdminProfile);

// Only accounts with the "admin" role may access the dashboard.
router.get(
  "/dashboard",
  adminAuthMiddleware,
  authorizeRoles("admin"),
  getAdminDashboard,
);

module.exports = router;
