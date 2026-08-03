/*
==============================================================
                MONGODB DATABASE CONFIGURATION
==============================================================

PURPOSE

This file is responsible for establishing a connection
between our backend application and MongoDB.

Think of MongoDB as the restaurant warehouse.

Whenever we need:

• Users
• Orders
• Inventory
• Pizzas

we retrieve or store them here.

==============================================================
*/

// ------------------------------------------------------------
// Import Mongoose
// ------------------------------------------------------------

// Mongoose is an ODM (Object Data Modelling) library.
//
// It allows JavaScript to communicate with MongoDB
// using models and schemas.
const mongoose = require("mongoose");

// ------------------------------------------------------------
// Create Database Connection Function
// ------------------------------------------------------------

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB.
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed");

    console.error(error.message);

    // Exit the application.
    process.exit(1);
  }
};

// Export the function so server.js can use it.
module.exports = connectDB;
