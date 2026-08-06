/*
==============================================================
                    USER ROUTES
==============================================================

These routes contain protected customer functionality.

A valid customer JWT is required.

==============================================================
*/

const express = require("express");

const router = express.Router();

// Import customer authentication middleware.
const authMiddleware = require("../middleware/authMiddleware");

// Import customer controller functions.
const {
  getUserProfile,
  getCustomerDashboard,
} = require("../controllers/userController");

// Return the authenticated customer's profile.
router.get("/profile", authMiddleware, getUserProfile);

// Return customer dashboard information.
router.get("/dashboard", authMiddleware, getCustomerDashboard);

module.exports = router;
