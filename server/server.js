/*
==============================================================
                    VICTOR'S PIZZA DELIVERY API
==============================================================

Author      : Victor Sumbo
Project     : Oasis Infobyte Internship Project
Backend     : Node.js + Express.js + MongoDB
Version     : 1.0.0

==============================================================
PURPOSE

This file is the entry point of the entire backend application.

Think of this file as the "Restaurant Manager."

Responsibilities

• Starts the Express server
• Loads environment variables
• Connects to MongoDB
• Enables CORS
• Registers API routes
• Starts listening for client requests

Everything begins here.

==============================================================
*/

// ------------------------------------------------------------
// Load environment variables
// ------------------------------------------------------------

// dotenv reads values stored inside the .env file.
//
// Example:
//
// PORT
// JWT_SECRET
// EMAIL_USER
//
// These values become available anywhere in the project using:
//
// process.env.PORT
//

require("dotenv").config();

// ------------------------------------------------------------
// Import Required Packagess
// ------------------------------------------------------------

// Express is the framework that helps us build APIs.
const express = require("express");

// CORS allows our React frontend to communicate
// with this backend.
const cors = require("cors");

// Import our MongoDB connection function.
const connectDB = require("./config/db");

// Import our API routes.
const authRoutes = require("./routes/authRoutes");

// Register User Routes
const userRoutes = require("./routes/userRoutes");
// ------------------------------------------------------------
// Create the Express Application
// ------------------------------------------------------------
// Import administrator authentication routes.
const adminRoutes = require("./routes/adminRoutes");
// ------------------------------------------------------------
// Import pizza routes.
const pizzaRoutes = require("./routes/pizzaRoutes");
// ------------------------------------------------------------
// Create an Express application instance.
//
// Everything in our backend will be attached
// to this object.
const app = express();

// ------------------------------------------------------------
// Connect to MongoDB
// ------------------------------------------------------------

// Establish a connection with our database.
//
// If the database cannot be reached,
// the application will stop.
connectDB();

// ------------------------------------------------------------
// Global Middleware
// ------------------------------------------------------------

// Enable Cross-Origin Resource Sharing.
//
// Our frontend runs on:
//
// http://localhost:5173
//
// while our backend runs on:
//
// http://localhost:5000
//
// Without CORS the browser would block requests.
app.use(cors());

// Parse incoming JSON requests.
//
// Example:
//
// {
//    "email":"victor@email.com",
//    "password":"123456"
// }
//
// becomes
//
// req.body.email
// req.body.password
//
app.use(express.json());

// ------------------------------------------------------------
// Register API Routes
// ------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
// Register administrator authentication routes.
// This creates POST "http://localhost:5000/api/admin/login"
app.use("/api/admin", adminRoutes);
// ------------------------------------------------------------
// Customer Pizza Routes/endpoints
app.use("/api/pizzas", pizzaRoutes);
// ------------------------------------------------------------
// Health Check Route
// ------------------------------------------------------------

// This route allows us to verify that the backend
// is running correctly.
//
// Open:
//
// http://localhost:5000
//
// User should receive the message below.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🍕 Victor's Pizza Delivery API is running successfully.",
  });
});

// ------------------------------------------------------------
// Start Server
// ------------------------------------------------------------

// Read the server port from our .env file.
//
// If no port exists,
// default to 5000.
const PORT = process.env.PORT || 5000;

// Start listening for incoming requests.
app.listen(PORT, () => {
  console.log("=================================================");
  console.log("🍕 Victor's Pizza Delivery Backend Started");
  console.log("=================================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("=================================================");
});
