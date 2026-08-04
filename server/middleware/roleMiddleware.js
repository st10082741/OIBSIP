/*
==============================================================
                ROLE AUTHORIZATION MIDDLEWARE
==============================================================

Purpose:
• Control which administrator roles may access a route.
• Run after adminAuthMiddleware.
• Reuse the same authorization logic across future features.

Example:

router.get(
  "/inventory",
  adminAuthMiddleware,
  authorizeRoles("admin"),
  getInventory,
);

==============================================================
*/

// Create middleware that accepts one or more permitted roles.
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    /*
    adminAuthMiddleware should already have authenticated
    the administrator and attached the account to req.admin.
    */
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    // Check whether the authenticated administrator has permission.
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    // The administrator has an allowed role.
    next();
  };
};

// Export the reusable authorization middleware.
module.exports = authorizeRoles;
