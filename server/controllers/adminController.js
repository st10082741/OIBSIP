/*
==============================================================
                ADMIN AUTHENTICATION CONTROLLER
==============================================================

Responsibilities:
• Authenticate administrators.
• Generate administrator JWT tokens.
• Return the authenticated administrator's profile.

Important:
• There is no public administrator registration endpoint.
• Administrator accounts are created securely by the system owner.
• Customer accounts cannot access administrator functionality.

==============================================================
*/

// Import JWT for generating administrator login tokens.
const jwt = require("jsonwebtoken");

// Import bcrypt for comparing passwords.
const bcrypt = require("bcrypt");

// Import the Admin model for MongoDB operations.
const Admin = require("../models/Admin");

// =============================================================
// ADMIN LOGIN
// =============================================================

const loginAdmin = async (req, res) => {
  try {
    // Read administrator login information.
    const { email, password } = req.body;

    // Make sure both required fields were submitted.
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // Find the administrator using the submitted email.
    const admin = await Admin.findOne({ email });

    // Use a general response so we do not reveal
    // whether a particular administrator email exists.
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    // Compare the submitted password against the stored bcrypt hash.
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    // Create an administrator JWT.
    //
    // The role field distinguishes this token
    // from a normal customer token.
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Return the JWT and safe administrator information.
    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================================
// GET AUTHENTICATED ADMIN PROFILE
// =============================================================

const getAdminProfile = async (req, res) => {
  try {
    /*
    adminAuthMiddleware already:
    • verified the JWT,
    • confirmed role: "admin",
    • fetched the administrator from MongoDB,
    • attached the result to req.admin.
    */

    return res.status(200).json({
      success: true,
      message: "Administrator profile fetched successfully.",
      admin: req.admin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================================
// GET ADMIN DASHBOARD ACCESS
// =============================================================

const getAdminDashboard = async (req, res) => {
  try {
    /*
    ============================================================
    Temporary Dashboard

    As additional milestones are completed, these values
    will be replaced with real database statistics.

    Future examples:

    • Total customers
    • Total orders
    • Total pizzas
    • Inventory status
    • Revenue
    • Pending deliveries

    ============================================================
    */

    const dashboard = {
      totalCustomers: 0,
      totalOrders: 0,
      totalPizzas: 0,
      lowStockItems: 0,
    };

    return res.status(200).json({
      success: true,
      message: "Administrator dashboard loaded successfully.",
      dashboard,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export administrator controller functions.
module.exports = {
  loginAdmin,
  getAdminProfile,
  getAdminDashboard,
};
