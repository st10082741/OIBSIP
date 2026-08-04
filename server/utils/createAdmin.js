/*
==============================================================
                CREATE INITIAL ADMIN
==============================================================

This development utility creates the first administrator.

Why it exists:
• Public admin registration is intentionally unavailable.
• The password is hashed before storage.
• Running it again will not create a duplicate admin.

Run:
node utils/createAdmin.js

==============================================================
*/

// Load environment variables before using the database connection.
require("dotenv").config();

// Import bcrypt for securely hashing the admin password.
const bcrypt = require("bcrypt");

// Import the MongoDB connection function.
const connectDB = require("../config/db");

// Import the Admin model.
const Admin = require("../models/Admin");

// Create the initial administrator.
const createAdmin = async () => {
  try {
    // Connect this standalone script to MongoDB Atlas.
    await connectDB();

    // Change these development details before running the script.
    const adminDetails = {
      name: "Victor Sumbo",
      email: "bachisumbo@gmail.com",
      password: "AdminPassword1997",
    };

    // Prevent duplicate administrator accounts.
    const existingAdmin = await Admin.findOne({
      email: adminDetails.email,
    });

    if (existingAdmin) {
      console.log("ℹ️ Admin account already exists.");
      process.exit(0);
    }

    // Hash the plain password before saving it.
    const hashedPassword = await bcrypt.hash(adminDetails.password, 10);

    // Save the administrator in the separate admins collection.
    await Admin.create({
      name: adminDetails.name,
      email: adminDetails.email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Initial admin account created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Admin creation failed:", error.message);
    process.exit(1);
  }
};

createAdmin();
