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
• Parses incoming JSON
• Serves uploaded pizza images
• Registers API routes
• Starts scheduled background jobs
• Starts listening for client requests

Everything begins here.

==============================================================
*/

// ------------------------------------------------------------
// Load Environment Variables
// ------------------------------------------------------------

require("dotenv").config();

// ------------------------------------------------------------
// Import Required Packages
// ------------------------------------------------------------

const express = require("express");
const cors = require("cors");
const path = require("path");

// ------------------------------------------------------------
// Import Database Connection
// ------------------------------------------------------------

const connectDB = require("./config/db");

// ------------------------------------------------------------
// Import API Routes
// ------------------------------------------------------------

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const pizzaRoutes = require("./routes/pizzaRoutes");
const builderRoutes = require("./routes/builderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const adminPizzaRoutes = require("./routes/adminPizzaRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");

// ------------------------------------------------------------
// Import Scheduled Jobs
// ------------------------------------------------------------

/*
Milestone 12:

The low-stock scheduled job automatically checks
inventory and emails the administrator when stock
falls below its configured threshold.
*/

const { startLowStockJob } = require("./jobs/lowStockJob");

// ------------------------------------------------------------
// Create Express Application
// ------------------------------------------------------------

const app = express();

// ------------------------------------------------------------
// Connect to MongoDB
// ------------------------------------------------------------

connectDB();

// ------------------------------------------------------------
// Global Middleware
// ------------------------------------------------------------

app.use(cors());

app.use(express.json());

// ------------------------------------------------------------
// Serve Uploaded Files
// ------------------------------------------------------------

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------------------------------------------
// Register Authentication Routes
// ------------------------------------------------------------

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/admin", adminRoutes);

// ------------------------------------------------------------
// Register Customer Pizza Routes
// ------------------------------------------------------------

app.use("/api/pizzas", pizzaRoutes);

// ------------------------------------------------------------
// Register Pizza Builder Routes
// ------------------------------------------------------------

app.use("/api/builder", builderRoutes);

// ------------------------------------------------------------
// Register Administrator Inventory Routes
// ------------------------------------------------------------

app.use("/api/inventory", inventoryRoutes);

// ------------------------------------------------------------
// Register Customer Shopping Cart Routes
// ------------------------------------------------------------

app.use("/api/cart", cartRoutes);

// ------------------------------------------------------------
// Register Customer Checkout Routes
// ------------------------------------------------------------

app.use("/api/checkout", checkoutRoutes);

// ------------------------------------------------------------
// Register Customer Order Routes
// ------------------------------------------------------------

app.use("/api/orders", orderRoutes);

// ------------------------------------------------------------
// Register Customer Payment Routes
// ------------------------------------------------------------

app.use("/api/payments", paymentRoutes);

// ------------------------------------------------------------
// Register Administrator Pizza Management Routes
// ------------------------------------------------------------

app.use("/api/admin/pizzas", adminPizzaRoutes);

// ------------------------------------------------------------
// Register Administrator Order Management Routes
// ------------------------------------------------------------

app.use("/api/admin/orders", adminOrderRoutes);

// ------------------------------------------------------------
// Health Check Route
// ------------------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🍕 Victor's Pizza Delivery API is running successfully.",
  });
});

// ------------------------------------------------------------
// Start Scheduled Background Jobs
// ------------------------------------------------------------

/*
Milestone 12 change:

Start the automated low-stock inventory checker.

The actual schedule comes from:

LOW_STOCK_CRON

inside .env.

During testing:
*/
// LOW_STOCK_CRON=*/1 * * * *

/*
After testing successfully:
LOW_STOCK_CRON=0 9 * * *

The job runs independently from HTTP requests.
*/

startLowStockJob();

// ------------------------------------------------------------
// Start Server
// ------------------------------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================================");

  console.log("🍕 Victor's Pizza Delivery Backend Started");

  console.log("=================================================");

  console.log(`🚀 Server running on http://localhost:${PORT}`);

  console.log("=================================================");
});
