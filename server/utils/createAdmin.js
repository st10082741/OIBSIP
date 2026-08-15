/*
==============================================================
                    CREATE INITIAL ADMIN
==============================================================

This utility creates the application's initial administrator.

Security:
• Public admin registration is unavailable.
• Credentials are loaded from environment variables.
• The password is bcrypt-hashed before storage.
• Existing administrators are NOT automatically modified.

Run:
node utils/createAdmin.js

==============================================================
*/

require("dotenv").config();

const bcrypt = require("bcrypt");

const connectDB = require("../config/db");

const Admin = require("../models/Admin");

// =============================================================
// CREATE INITIAL ADMIN
// =============================================================

const createAdmin = async () => {
  try {
    await connectDB();

    // ---------------------------------------------------------
    // Validate environment variables.
    // ---------------------------------------------------------

    const adminEmail = process.env.ADMIN_SEED_EMAIL;

    const adminPassword = process.env.ADMIN_SEED_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error(
        "❌ ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be defined in .env.",
      );

      process.exit(1);
    }

    // ---------------------------------------------------------
    // Normalise admin email.
    // ---------------------------------------------------------

    const normalizedEmail = adminEmail.trim().toLowerCase();

    // ---------------------------------------------------------
    // Prevent duplicate administrators.
    // ---------------------------------------------------------

    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      console.log("ℹ️ Admin account already exists. No changes were made.");

      process.exit(0);
    }
    // ---------------------------------------------------------
    // Hash password before storing it.
    // ---------------------------------------------------------

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // ---------------------------------------------------------
    // Create administrator.
    // ---------------------------------------------------------

    await Admin.create({
      name: "Victor Sumbo",
      email: normalizedEmail,
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
