/*
==============================================================
                    USER CONTROLLER
==============================================================

This controller handles protected customer functionality.

Current responsibilities:
• Return the logged-in customer's profile.
• Return customer dashboard information.

Future responsibilities:
• Return the customer's active order.
• Return order history.
• Return real-time delivery status.

==============================================================
*/

// Import the User model for customer database operations.
const User = require("../models/User");

// Import the Pizza model for dashboard pizza information.
const Pizza = require("../models/Pizza");

// =============================================================
// GET CUSTOMER PROFILE
// =============================================================

const getUserProfile = async (req, res) => {
  try {
    // Find the authenticated customer using the ID from the JWT.
    // Sensitive password and token fields are excluded.
    const user = await User.findById(req.user.id).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpires",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================================
// GET CUSTOMER DASHBOARD
// =============================================================

const getCustomerDashboard = async (req, res) => {
  try {
    /*
    Fetch dashboard information in parallel.

    Promise.all allows MongoDB queries to run at the same time
    instead of waiting for each query to finish individually.
    */

    const [featuredPizzas, popularPizzas, availablePizzaCount] =
      await Promise.all([
        // Return available featured pizzas, highest rated first.
        Pizza.find({
          featured: true,
          available: true,
        })
          .sort({
            rating: -1,
          })
          .limit(6),

        // Return available popular pizzas, highest rated first.
        Pizza.find({
          popular: true,
          available: true,
        })
          .sort({
            rating: -1,
          })
          .limit(6),

        // Count all pizzas currently available to customers.
        Pizza.countDocuments({
          available: true,
        }),
      ]);

    /*
    Active order is currently null because the Order model
    will be implemented in the Order Management milestone.

    Later this will contain:

    • Order ID
    • Ordered items
    • Total amount
    • Order status
    • Delivery information

    Required status flow:

    Order Received
          ↓
    In Kitchen
          ↓
    Sent to Delivery
    */

    const activeOrder = null;

    return res.status(200).json({
      success: true,
      message: "Customer dashboard loaded successfully.",
      dashboard: {
        availablePizzaCount,
        featuredPizzas,
        popularPizzas,
        activeOrder,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load customer dashboard.",
      error: error.message,
    });
  }
};

// Export the customer controller functions.
module.exports = {
  getUserProfile,
  getCustomerDashboard,
};
