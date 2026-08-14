/*
==============================================================
                    CART CONTROLLER
==============================================================

This controller handles the customer's shopping cart.

Current responsibilities:

• Get cart
• Add catalog pizza
• Update quantity
• Remove cart item
• Clear cart
• Calculate cart totals

Future responsibilities:

• Add custom pizzas
• Checkout price revalidation

==============================================================
*/

// Import mongoose for ObjectId validation.
const mongoose = require("mongoose");

// Import models.
const Cart = require("../models/Cart");
const Pizza = require("../models/Pizza");

// Import custom pizza ingredient models.
const PizzaBase = require("../models/PizzaBase");
const Sauce = require("../models/Sauce");
const Cheese = require("../models/Cheese");
const Vegetable = require("../models/Vegetable");
// =============================================================
// FORMAT CART RESPONSE
// =============================================================

const formatCart = (cart) => {
  /*
  Calculate totals dynamically instead of storing them
  permanently in MongoDB.

  This avoids stale totals when quantities change.
  */

  const items = cart.items.map((item) => {
    const subtotal = item.unitPrice * item.quantity;

    return {
      id: item._id,
      itemType: item.itemType,
      pizza: item.pizza,
      customPizza: item.customPizza,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal,
    };
  });

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart._id,
    items,
    totalQuantity,
    total,
  };
};

// =============================================================
// GET CUSTOMER CART
// =============================================================

const getCart = async (req, res) => {
  try {
    /*
    authMiddleware attaches the authenticated customer
    to req.user.
    */

    let cart = await Cart.findOne({
      user: req.user.id,
    }).populate([
      {
        path: "items.pizza",
      },
      {
        path: "items.customPizza.base",
      },
      {
        path: "items.customPizza.sauce",
      },
      {
        path: "items.customPizza.cheese",
      },
      {
        path: "items.customPizza.vegetables",
      },
    ]);
    /*
    Automatically create an empty cart the first time
    the customer accesses the cart.
    */

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart loaded successfully.",
      cart: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load cart.",
      error: error.message,
    });
  }
};

// =============================================================
// ADD CATALOG PIZZA TO CART
// =============================================================

const addPizzaToCart = async (req, res) => {
  try {
    const { pizzaId, quantity = 1 } = req.body;

    // Validate MongoDB pizza ID.
    if (!pizzaId || !mongoose.Types.ObjectId.isValid(pizzaId)) {
      return res.status(400).json({
        success: false,
        message: "A valid pizza ID is required.",
      });
    }

    // Quantity must be a positive integer.
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer.",
      });
    }

    /*
    Retrieve the pizza from MongoDB.

    We DO NOT accept a pizza price from the frontend.

    MongoDB remains the authoritative pricing source.
    */
    const pizza = await Pizza.findOne({
      _id: pizzaId,
      available: true,
    });

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found or currently unavailable.",
      });
    }

    // Find or create the customer's cart.
    let cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    /*
    If the same catalog pizza already exists in the cart,
    increase its quantity rather than creating duplicates.
    */

    const existingItem = cart.items.find(
      (item) =>
        item.itemType === "catalog" && item.pizza?.toString() === pizzaId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;

      /*
      Refresh the price snapshot using the current
      server-authoritative database price.
      */
      existingItem.unitPrice = pizza.price;
    } else {
      cart.items.push({
        itemType: "catalog",
        pizza: pizza._id,
        quantity,
        unitPrice: pizza.price,
      });
    }

    await cart.save();

    // Reload pizza information for the response.
    cart = await Cart.findById(cart._id).populate("items.pizza");

    return res.status(200).json({
      success: true,
      message: "Pizza added to cart successfully.",
      cart: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add pizza to cart.",
      error: error.message,
    });
  }
};

// =============================================================
// UPDATE CART ITEM QUANTITY
// =============================================================

const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer.",
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    // Find the embedded cart item using its own ID.
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    item.quantity = quantity;

    await cart.save();

    await cart.populate("items.pizza");

    return res.status(200).json({
      success: true,
      message: "Cart item quantity updated successfully.",
      cart: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update cart item quantity.",
      error: error.message,
    });
  }
};

// =============================================================
// REMOVE CART ITEM
// =============================================================

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    // Remove the selected embedded cart item.
    item.deleteOne();

    await cart.save();

    await cart.populate("items.pizza");

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully.",
      cart: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove cart item.",
      error: error.message,
    });
  }
};

// =============================================================
// CLEAR CUSTOMER CART
// =============================================================

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      cart: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart.",
      error: error.message,
    });
  }
};
// =============================================================
// ADD CUSTOM PIZZA TO CART
// =============================================================

const addCustomPizzaToCart = async (req, res) => {
  try {
    /*
    The frontend sends ingredient IDs only.

    Example:

    {
      "baseId": "...",
      "sauceId": "...",
      "cheeseId": "...",
      "vegetableIds": ["...", "..."],
      "quantity": 1
    }

    The frontend does NOT control ingredient prices.
    */

    const {
      baseId,
      sauceId,
      cheeseId,
      vegetableIds = [],
      quantity = 1,
    } = req.body;

    // ---------------------------------------------------------
    // BASIC INPUT VALIDATION
    // ---------------------------------------------------------

    if (!baseId || !sauceId || !cheeseId) {
      return res.status(400).json({
        success: false,
        message: "Pizza base, sauce and cheese are required.",
      });
    }

    if (!Array.isArray(vegetableIds)) {
      return res.status(400).json({
        success: false,
        message: "Vegetable selections must be an array.",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer.",
      });
    }

    // ---------------------------------------------------------
    // VALIDATE SELECTED INGREDIENTS
    // ---------------------------------------------------------

    /*
    Retrieve all selected ingredients concurrently.

    Only ingredients that are currently available
    may be added to the customer's cart.
    */

    const [base, sauce, cheese, vegetables] = await Promise.all([
      PizzaBase.findOne({
        _id: baseId,
        available: true,
      }),

      Sauce.findOne({
        _id: sauceId,
        available: true,
      }),

      Cheese.findOne({
        _id: cheeseId,
        available: true,
      }),

      Vegetable.find({
        _id: {
          $in: vegetableIds,
        },
        available: true,
      }),
    ]);

    if (!base) {
      return res.status(400).json({
        success: false,
        message: "Selected pizza base is invalid or unavailable.",
      });
    }

    if (!sauce) {
      return res.status(400).json({
        success: false,
        message: "Selected sauce is invalid or unavailable.",
      });
    }

    if (!cheese) {
      return res.status(400).json({
        success: false,
        message: "Selected cheese is invalid or unavailable.",
      });
    }

    /*
    Every submitted vegetable ID must match an
    available vegetable in MongoDB.
    */

    if (vegetables.length !== vegetableIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected vegetables are invalid or unavailable.",
      });
    }

    // ---------------------------------------------------------
    // CALCULATE CUSTOM PIZZA PRICE
    // ---------------------------------------------------------

    const vegetableTotal = vegetables.reduce(
      (total, vegetable) => total + vegetable.price,
      0,
    );

    /*
    MongoDB remains the source of truth for pricing.

    The request cannot manipulate these prices because
    they were retrieved directly from the database.
    */

    const customPizzaPrice =
      base.price + sauce.price + cheese.price + vegetableTotal;

    // ---------------------------------------------------------
    // FIND OR CREATE CUSTOMER CART
    // ---------------------------------------------------------

    let cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    // ---------------------------------------------------------
    // ADD CUSTOM PIZZA
    // ---------------------------------------------------------

    /*
    Custom pizzas are intentionally added as separate
    cart lines.

    Two custom pizzas may look similar but represent
    different configurations, so we avoid automatically
    merging them at this stage.
    */

    cart.items.push({
      itemType: "custom",

      pizza: null,

      customPizza: {
        base: base._id,
        sauce: sauce._id,
        cheese: cheese._id,
        vegetables: vegetables.map((vegetable) => vegetable._id),
      },

      quantity,

      // Price snapshot generated by the backend.
      unitPrice: customPizzaPrice,
    });

    await cart.save();

    // ---------------------------------------------------------
    // POPULATE CART INFORMATION
    // ---------------------------------------------------------

    /*
    Populate ingredient references so the frontend
    receives readable names and prices rather than
    only MongoDB IDs.
    */

    await cart.populate([
      {
        path: "items.pizza",
      },
      {
        path: "items.customPizza.base",
      },
      {
        path: "items.customPizza.sauce",
      },
      {
        path: "items.customPizza.cheese",
      },
      {
        path: "items.customPizza.vegetables",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Custom pizza added to cart successfully.",
      cart: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add custom pizza to cart.",
      error: error.message,
    });
  }
};
// Export cart controller functions.
module.exports = {
  getCart,
  addPizzaToCart,
  addCustomPizzaToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
