/*
==============================================================
                    CART ROUTES
==============================================================

Every shopping-cart route belongs to an authenticated
customer.

Customers may only access their own cart because the
backend obtains the user ID from the JWT.

==============================================================
*/

const express = require("express");

const router = express.Router();

const {
  getCart,
  addPizzaToCart,
  addCustomPizzaToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

// Protect every cart route below.
router.use(authMiddleware);

// Return the authenticated customer's cart.
router.get("/", getCart);

// Add a regular menu pizza.
router.post("/items", addPizzaToCart);

// Add a custom pizza.
router.post("/custom", addCustomPizzaToCart);

// Update the quantity of one cart item.
router.patch("/items/:itemId", updateCartItemQuantity);

// Remove one cart item.
router.delete("/items/:itemId", removeCartItem);

// Remove everything from the cart.
router.delete("/", clearCart);

module.exports = router;
