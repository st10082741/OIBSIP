/*
==============================================================
                    USER MODEL
==============================================================

This model represents every customer that registers
on our Pizza Delivery application.

Every registered user stored inside MongoDB
must follow this structure.

==============================================================
*/

// Import mongoose
const mongoose = require("mongoose");

// Create the User Schema
const userSchema = new mongoose.Schema(
  {
    // -----------------------------
    // User's Full Name
    // -----------------------------
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // -----------------------------
    // User Email
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
    // Email Verification Status
    // -----------------------------
    isVerified: {
      type: Boolean,
      default: false,
    },

    // -----------------------------
    // Email Verification Token
    // -----------------------------
    verificationToken: {
      type: String,
      default: "",
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

  // Automatically creates
  // createdAt
  // updatedAt
  {
    timestamps: true,
  },
);

// Create the User model
const User = mongoose.model("User", userSchema);

// Export it
module.exports = User;
