/*
==============================================================
                    ADMIN MODEL
==============================================================

This model represents administrators.

Admins manage:

• Orders
• Inventory
• Pizzas
• Customers

==============================================================
*/

// Import mongoose to define the structure of admin documents in MongoDB
const mongoose = require("mongoose");

// Create Admin Schema to define the structure of admin documents in MongoDB
const adminSchema = new mongoose.Schema(
  {
    // -----------------------------
    // Admin Name
    // -----------------------------
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // -----------------------------
    // Admin Email
    // -----------------------------
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // -----------------------------
    // Encrypted Password
    // -----------------------------
    password: {
      type: String,
      required: true,
    },

    // -----------------------------
    // Admin Role
    //timestamps is used to track when the admin was created and last updated
    // -----------------------------
    role: {
      type: String,
      default: "admin",
    },

    // -----------------------------
    // Forgot Password Token
    // -----------------------------
    resetPasswordToken: {
      type: String,
      default: "",
    },

    // -----------------------------
    // Password Reset Expiry
    // -----------------------------
    resetPasswordExpires: {
      type: Date,
    },
  },

  {
    timestamps: true,
  },
);

// Create Admin model
const Admin = mongoose.model("Admin", adminSchema);

// Export model
module.exports = Admin;
