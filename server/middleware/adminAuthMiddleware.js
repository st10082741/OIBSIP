/*
==============================================================
                ADMIN AUTHENTICATION MIDDLEWARE
==============================================================

Purpose:
• Protect administrator-only routes.
• Verify the JWT sent in the Authorization header.
• Confirm that the token belongs to an administrator.
• Confirm that the administrator still exists in MongoDB.

Expected header:

Authorization: Bearer ADMIN_JWT_TOKEN

==============================================================
*/

// Import JWT so the token can be verified.
const jwt = require("jsonwebtoken");

// Import the Admin model to confirm the administrator exists.
const Admin = require("../models/Admin");

// Middleware used before protected admin controllers.
const adminAuthMiddleware = async (req, res, next) => {
  try {
    // Read the Authorization header sent by the client.
    const authHeader = req.headers.authorization;

    // Reject requests that do not contain a Bearer token.
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Admin access denied. No authentication token provided.",
      });
    }

    // Extract only the token from:
    // Bearer eyJhbGciOiJIUzI1Ni...
    const token = authHeader.split(" ")[1];

    // Verify that the token was signed using our JWT secret.
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Customer tokens do not contain role: "admin".
    // This prevents customers from accessing administrator routes.
    if (decodedToken.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. Administrator privileges required.",
      });
    }

    // Confirm that the administrator still exists in MongoDB.
    const admin = await Admin.findById(decodedToken.id).select(
      "-password -resetPasswordToken -resetPasswordExpires",
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Administrator account no longer exists.",
      });
    }

    // Attach the authenticated administrator to the request.
    // Protected controllers can now access req.admin.
    req.admin = admin;

    // Continue to the requested controller.
    next();
  } catch (error) {
    // jwt.verify throws an error when the token is invalid or expired.
    return res.status(401).json({
      success: false,
      message: "Invalid or expired administrator token.",
    });
  }
};

// Export the middleware for use in administrator routes.
module.exports = adminAuthMiddleware;
