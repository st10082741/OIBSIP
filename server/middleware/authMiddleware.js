/*
==============================================================
                AUTHENTICATION MIDDLEWARE
==============================================================

Purpose

Protect routes that require users to be logged in such as: 
  - /api/profile
  - /api/orders

==============================================================
*/

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store logged in user
    req.user = {
      id: decoded.id,
    };

    // Continue
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

module.exports = authMiddleware;
