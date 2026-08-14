/*
==============================================================
                    CHECKOUT ROUTES
==============================================================

Checkout routes belong to authenticated customers.

The backend determines the customer from the JWT rather
than accepting a customer ID from the request.

==============================================================
*/

const express = require("express");

const router = express.Router();

const { prepareCheckout } = require("../controllers/checkoutController");

const authMiddleware = require("../middleware/authMiddleware");

// Protect every checkout route.
router.use(authMiddleware);

// Validate the cart and generate a trusted checkout summary.
router.get("/", prepareCheckout);

module.exports = router;
