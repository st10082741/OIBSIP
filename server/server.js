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
• Starts listening for client requests

Everything begins here.

==============================================================
*/

// ------------------------------------------------------------
// Load Environment Variables
// ------------------------------------------------------------

/*
dotenv reads values stored inside the .env file.

Examples:

PORT
JWT_SECRET
EMAIL_USER

These values become available through:

process.env.PORT
process.env.JWT_SECRET
*/

require("dotenv").config();

// ------------------------------------------------------------
// Import Required Packages
// ------------------------------------------------------------

// Express is the framework used to build our API.
const express = require("express");

// CORS allows the React frontend to communicate
// with this backend from another origin.
const cors = require("cors");

// Node's path module helps create safe filesystem paths.
const path = require("path");

// ------------------------------------------------------------
// Import Database Connection
// ------------------------------------------------------------

const connectDB = require("./config/db");

// ------------------------------------------------------------
// Import API Routes
// ------------------------------------------------------------

// Customer authentication routes.
const authRoutes = require("./routes/authRoutes");

// Customer/user routes.
const userRoutes = require("./routes/userRoutes");

// Administrator authentication routes.
const adminRoutes = require("./routes/adminRoutes");

// Customer pizza/menu routes.
const pizzaRoutes = require("./routes/pizzaRoutes");

// Custom pizza builder routes.
const builderRoutes = require("./routes/builderRoutes");

// Administrator inventory routes.
const inventoryRoutes = require("./routes/inventoryRoutes");

// Administrator pizza-management routes.
const adminPizzaRoutes = require("./routes/adminPizzaRoutes");

// ------------------------------------------------------------
// Create Express Application
// ------------------------------------------------------------

const app = express();

// ------------------------------------------------------------
// Connect to MongoDB
// ------------------------------------------------------------

/*
Establish the database connection.

If MongoDB cannot be reached, our database configuration
handles the connection failure.
*/

connectDB();

// ------------------------------------------------------------
// Global Middleware
// ------------------------------------------------------------

/*
Enable Cross-Origin Resource Sharing.

Development frontend:
http://localhost:5173

Development backend:
http://localhost:5000
*/

app.use(cors());

// Parse incoming JSON request bodies.
//
// Example:
//
// {
//   "email": "victor@email.com",
//   "password": "123456"
// }
//
// becomes:
//
// req.body.email
// req.body.password

app.use(express.json());

// ------------------------------------------------------------
// Serve Uploaded Files
// ------------------------------------------------------------

/*
Expose files stored inside:

server/uploads/

through the public URL:

/uploads

For example, a pizza image stored at:

server/uploads/pizzas/pizza-123.jpg

can be accessed through:

http://localhost:5000/uploads/pizzas/pizza-123.jpg

MongoDB therefore only needs to store the image path rather
than the actual image file.
*/

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------------------------------------------
// Register Authentication Routes
// ------------------------------------------------------------

// Customer authentication.
//
// Example:
// POST /api/auth/login
app.use("/api/auth", authRoutes);

// Customer/user functionality.
app.use("/api/user", userRoutes);

// Administrator authentication.
//
// Example:
// POST /api/admin/login
app.use("/api/admin", adminRoutes);

// ------------------------------------------------------------
// Register Customer Pizza Routes
// ------------------------------------------------------------

/*
Examples:

GET /api/pizzas
GET /api/pizzas/featured
GET /api/pizzas/popular
GET /api/pizzas/:id
*/

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
// Register Administrator Pizza Management Routes
// ------------------------------------------------------------

/*
These routes are separate from customer pizza routes.

Examples:

GET    /api/admin/pizzas
POST   /api/admin/pizzas
PATCH  /api/admin/pizzas/:id
DELETE /api/admin/pizzas/:id

Milestone 9 also adds pizza image management under
this route group.
*/

app.use("/api/admin/pizzas", adminPizzaRoutes);

// ------------------------------------------------------------
// Health Check Route
// ------------------------------------------------------------

/*
This route verifies that the backend server
is running correctly.

GET http://localhost:5000
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🍕 Victor's Pizza Delivery API is running successfully.",
  });
});

// ------------------------------------------------------------
// Start Server
// ------------------------------------------------------------

// Use the port from .env or default to 5000.
const PORT = process.env.PORT || 5000;

// Start listening for incoming requests.
app.listen(PORT, () => {
  console.log("=================================================");
  console.log("🍕 Victor's Pizza Delivery Backend Started");
  console.log("=================================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("=================================================");
});
