/*
==============================================================
                    CHECKOUT CONTROLLER
==============================================================

This controller prepares a customer's cart for checkout.

Current responsibilities:

• Load the authenticated customer's cart
• Reject empty carts
• Revalidate catalog pizzas
• Revalidate custom pizza ingredients
• Check ingredient availability
• Check custom pizza stock
• Recalculate prices from MongoDB
• Return a trusted checkout summary

IMPORTANT:

This controller does NOT:

• Create an order
• Process payment
• Deduct inventory
• Clear the cart

Those operations belong to later batches.

==============================================================
*/

const Cart = require("../models/Cart");

const Pizza = require("../models/Pizza");
const PizzaBase = require("../models/PizzaBase");
const Sauce = require("../models/Sauce");
const Cheese = require("../models/Cheese");
const Vegetable = require("../models/Vegetable");

// =============================================================
// PREPARE CHECKOUT
// =============================================================

const prepareCheckout = async (req, res) => {
  try {
    // ---------------------------------------------------------
    // LOAD CUSTOMER CART
    // ---------------------------------------------------------

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const checkoutItems = [];

    let totalQuantity = 0;
    let total = 0;

    // ---------------------------------------------------------
    // REVALIDATE EVERY CART ITEM
    // ---------------------------------------------------------

    for (const item of cart.items) {
      // =======================================================
      // CATALOG PIZZA
      // =======================================================

      if (item.itemType === "catalog") {
        /*
        Retrieve the pizza again from MongoDB.

        We intentionally do not trust the price snapshot
        stored inside the cart.
        */

        const pizza = await Pizza.findOne({
          _id: item.pizza,
          available: true,
        });

        if (!pizza) {
          return res.status(400).json({
            success: false,
            message: "One of the pizzas in your cart is no longer available.",
          });
        }

        const unitPrice = pizza.price;

        const subtotal = unitPrice * item.quantity;

        checkoutItems.push({
          cartItemId: item._id,
          itemType: "catalog",

          pizza: {
            id: pizza._id,
            name: pizza.name,
            image: pizza.image,
          },

          quantity: item.quantity,
          unitPrice,
          subtotal,
        });

        totalQuantity += item.quantity;
        total += subtotal;

        continue;
      }

      // =======================================================
      // CUSTOM PIZZA
      // =======================================================

      if (item.itemType === "custom") {
        const customPizza = item.customPizza;

        /*
        Reload every ingredient from MongoDB.

        This allows checkout to verify:

        • Ingredient still exists
        • Ingredient is still available
        • Current ingredient price
        • Current ingredient stock
        */

        const [base, sauce, cheese, vegetables] = await Promise.all([
          PizzaBase.findOne({
            _id: customPizza.base,
            available: true,
          }),

          Sauce.findOne({
            _id: customPizza.sauce,
            available: true,
          }),

          Cheese.findOne({
            _id: customPizza.cheese,
            available: true,
          }),

          Vegetable.find({
            _id: {
              $in: customPizza.vegetables,
            },
            available: true,
          }),
        ]);

        // -----------------------------------------------------
        // AVAILABILITY VALIDATION
        // -----------------------------------------------------

        if (!base) {
          return res.status(400).json({
            success: false,
            message: "The selected pizza base is no longer available.",
          });
        }

        if (!sauce) {
          return res.status(400).json({
            success: false,
            message: "The selected sauce is no longer available.",
          });
        }

        if (!cheese) {
          return res.status(400).json({
            success: false,
            message: "The selected cheese is no longer available.",
          });
        }

        if (vegetables.length !== customPizza.vegetables.length) {
          return res.status(400).json({
            success: false,
            message: "One or more selected vegetables are no longer available.",
          });
        }

        // -----------------------------------------------------
        // STOCK VALIDATION
        // -----------------------------------------------------

        /*
        Quantity matters here.

        If the customer is purchasing 2 custom pizzas,
        we need at least:

        2 bases
        2 sauces
        2 cheeses
        2 of EACH selected vegetable
        */

        const requiredStock = item.quantity;

        if (base.stock < requiredStock) {
          return res.status(400).json({
            success: false,
            message: `${base.name} does not have enough stock.`,
          });
        }

        if (sauce.stock < requiredStock) {
          return res.status(400).json({
            success: false,
            message: `${sauce.name} does not have enough stock.`,
          });
        }

        if (cheese.stock < requiredStock) {
          return res.status(400).json({
            success: false,
            message: `${cheese.name} does not have enough stock.`,
          });
        }

        for (const vegetable of vegetables) {
          if (vegetable.stock < requiredStock) {
            return res.status(400).json({
              success: false,
              message: `${vegetable.name} does not have enough stock.`,
            });
          }
        }

        // -----------------------------------------------------
        // TRUSTED PRICE CALCULATION
        // -----------------------------------------------------

        const vegetableTotal = vegetables.reduce(
          (sum, vegetable) => sum + vegetable.price,
          0,
        );

        const unitPrice =
          base.price + sauce.price + cheese.price + vegetableTotal;

        const subtotal = unitPrice * item.quantity;

        checkoutItems.push({
          cartItemId: item._id,
          itemType: "custom",

          customPizza: {
            base: {
              id: base._id,
              name: base.name,
              price: base.price,
            },

            sauce: {
              id: sauce._id,
              name: sauce.name,
              price: sauce.price,
            },

            cheese: {
              id: cheese._id,
              name: cheese.name,
              price: cheese.price,
            },

            vegetables: vegetables.map((vegetable) => ({
              id: vegetable._id,
              name: vegetable.name,
              price: vegetable.price,
            })),
          },

          quantity: item.quantity,
          unitPrice,
          subtotal,
        });

        totalQuantity += item.quantity;
        total += subtotal;
      }
    }

    // ---------------------------------------------------------
    // RETURN TRUSTED CHECKOUT SUMMARY
    // ---------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Checkout prepared successfully.",

      checkout: {
        items: checkoutItems,
        totalQuantity,

        /*
        JavaScript floating-point arithmetic can sometimes
        produce values such as:

        245.98999999999998

        Round monetary values to two decimal places.
        */
        total: Number(total.toFixed(2)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to prepare checkout.",
      error: error.message,
    });
  }
};

// Export checkout controller functions.
module.exports = {
  prepareCheckout,
};
