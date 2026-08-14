/*
==============================================================
                    PAYMENT ROUTES
==============================================================

These routes simulate Razorpay Test Mode.

They remain customer-authenticated because customers may
only pay for their own orders.

IMPORTANT:
Specific routes must be declared before dynamic routes
so Express does not interpret words such as "complete"
as an order ID.

==============================================================
*/

const express = require("express");

const router = express.Router();

const {
  createTestPayment,
  completeTestPayment,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

// =============================================================
// AUTHENTICATION
// =============================================================

// Protect all payment routes.
// Only authenticated customers can access their payments.
router.use(authMiddleware);

// =============================================================
// COMPLETE TEST PAYMENT
// =============================================================

/*
Simulate the result returned by Razorpay Test Mode.

Possible results:

Success
Failure

IMPORTANT:
This route MUST appear before /test/:orderId because
otherwise Express would interpret "complete" as an orderId.
*/

router.post("/test/complete", completeTestPayment);

// =============================================================
// CREATE TEST PAYMENT SESSION
// =============================================================

/*
Create a simulated Razorpay payment session for a
specific MongoDB order.

Example:

POST /api/payments/test/6a7d22a2b6dd0cc3ae173ad9
*/

router.post("/test/:orderId", createTestPayment);

// =============================================================
// EXPORT ROUTER
// =============================================================

module.exports = router;
