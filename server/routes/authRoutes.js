/*
==============================================================
                    AUTHENTICATION ROUTES
==============================================================

These routes connect authentication requests
to the correct controller functions.

==============================================================
*/

const express = require("express");

const router = express.Router();

// Import authentication controller functions.
const {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// Register a new customer.
router.post("/register", registerUser);

// Verify a customer's email.
router.get("/verify-email/:token", verifyEmail);

// Log in a verified customer.
router.post("/login", loginUser);

// Send a password-reset email.
router.post("/forgot-password", forgotPassword);

// Replace the forgotten password using the emailed token.
router.post("/reset-password/:token", resetPassword);

module.exports = router;
