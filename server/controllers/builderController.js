/*
==============================================================
                PIZZA BUILDER CONTROLLER
==============================================================

This controller provides the ingredient options used by
the custom pizza builder.

Customers can retrieve:

• Pizza bases
• Sauces
• Cheeses
• Vegetables

Only options marked as available are returned.

==============================================================
*/

// Import the builder models.
const PizzaBase = require("../models/PizzaBase");
const Sauce = require("../models/Sauce");
const Cheese = require("../models/Cheese");
const Vegetable = require("../models/Vegetable");

// =============================================================
// GET AVAILABLE PIZZA BASES
// =============================================================

const getPizzaBases = async (req, res) => {
  try {
    const bases = await PizzaBase.find({
      available: true,
    }).sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: bases.length,
      bases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pizza bases.",
      error: error.message,
    });
  }
};

// =============================================================
// GET AVAILABLE SAUCES
// =============================================================

const getSauces = async (req, res) => {
  try {
    const sauces = await Sauce.find({
      available: true,
    }).sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: sauces.length,
      sauces,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sauces.",
      error: error.message,
    });
  }
};

// =============================================================
// GET AVAILABLE CHEESES
// =============================================================

const getCheeses = async (req, res) => {
  try {
    const cheeses = await Cheese.find({
      available: true,
    }).sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: cheeses.length,
      cheeses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cheeses.",
      error: error.message,
    });
  }
};

// =============================================================
// GET AVAILABLE VEGETABLES
// =============================================================

const getVegetables = async (req, res) => {
  try {
    const vegetables = await Vegetable.find({
      available: true,
    }).sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: vegetables.length,
      vegetables,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vegetables.",
      error: error.message,
    });
  }
};

// =============================================================
// BUILD CUSTOM PIZZA
// =============================================================

const buildCustomPizza = async (req, res) => {
  try {
    /*
    The frontend sends MongoDB IDs for the customer's
    selected ingredients.

    Example request:

    {
      "baseId": "...",
      "sauceId": "...",
      "cheeseId": "...",
      "vegetableIds": ["...", "..."]
    }

    We intentionally do NOT accept ingredient prices
    from the frontend.

    The backend retrieves the real prices from MongoDB.
    */

    const { baseId, sauceId, cheeseId, vegetableIds = [] } = req.body;

    // ---------------------------------------------------------
    // VALIDATE REQUIRED SELECTIONS
    // ---------------------------------------------------------

    /*
    A custom pizza requires exactly:

    • One pizza base
    • One sauce
    • One cheese

    Vegetables are optional because the customer may
    choose zero or multiple vegetables.
    */

    if (!baseId || !sauceId || !cheeseId) {
      return res.status(400).json({
        success: false,
        message: "Please select a pizza base, sauce and cheese.",
      });
    }

    // Ensure vegetableIds is an array.
    if (!Array.isArray(vegetableIds)) {
      return res.status(400).json({
        success: false,
        message: "Vegetable selections must be an array.",
      });
    }

    /*
    Retrieve the selected ingredients from MongoDB.

    Promise.all allows these independent database queries
    to execute concurrently instead of sequentially.
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

    // ---------------------------------------------------------
    // VALIDATE DATABASE RESULTS
    // ---------------------------------------------------------

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
    Every requested vegetable ID must correspond to an
    available vegetable.

    If three IDs were submitted but MongoDB only returned
    two vegetables, one selection was invalid or unavailable.
    */

    if (vegetables.length !== vegetableIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected vegetables are invalid or unavailable.",
      });
    }

    // ---------------------------------------------------------
    // CALCULATE VEGETABLE TOTAL
    // ---------------------------------------------------------

    /*
Customers may select multiple vegetables.

reduce() adds the price of every selected vegetable
together and produces one vegetable total.

Example:

Mushrooms = R8
Onions    = R5

vegetableTotal = R13
*/

    const vegetableTotal = vegetables.reduce(
      (total, vegetable) => total + vegetable.price,
      0,
    );

    // ---------------------------------------------------------
    // CALCULATE CUSTOM PIZZA TOTAL
    // ---------------------------------------------------------

    /*
The backend calculates the final price using values
retrieved directly from MongoDB.

We never trust prices submitted by the frontend.
*/

    const totalPrice = base.price + sauce.price + cheese.price + vegetableTotal;

    // ---------------------------------------------------------
    // CREATE ORDER SUMMARY
    // ---------------------------------------------------------

    /*
The order summary returns only the information
the customer needs before payment.

This avoids sending unnecessary database fields
such as __v, createdAt and updatedAt.
*/

    const orderSummary = {
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

      pricing: {
        base: base.price,
        sauce: sauce.price,
        cheese: cheese.price,
        vegetables: vegetableTotal,
        total: totalPrice,
      },
    };

    // Return the final custom pizza summary.
    return res.status(200).json({
      success: true,
      message: "Custom pizza summary generated successfully.",
      orderSummary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to build custom pizza.",
      error: error.message,
    });
  }
};

// Export builder controller functions.
module.exports = {
  getPizzaBases,
  getSauces,
  getCheeses,
  getVegetables,
  buildCustomPizza,
};
