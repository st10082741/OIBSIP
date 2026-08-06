/*
==============================================================
                    PIZZA CONTROLLER
==============================================================

This controller handles customer-facing pizza requests.

Current responsibilities:
• Return all available pizzas
• Return one available pizza by ID

Later responsibilities:
• Search pizzas
• Filter pizzas by category
• Sort pizzas
• Return featured pizzas
• Return popular pizzas

==============================================================
*/

// Import mongoose so we can validate MongoDB document IDs.
const mongoose = require("mongoose");

// Import the Pizza model for database operations.
const Pizza = require("../models/Pizza");

// =============================================================
// GET ALL AVAILABLE PIZZAS
// =============================================================

const getAllPizzas = async (req, res) => {
  try {
    /*
    Read optional query parameters.

    Examples:

    /api/pizzas?search=pep

    /api/pizzas?category=Pork

    /api/pizzas?sort=price
    */

    const { search, category, sort } = req.query;

    /*
    Build the MongoDB query dynamically.

    Every customer should only see pizzas that
    are currently available.
    */

    const query = {
      available: true,
    };

    /*
    Search pizzas by name.

    $regex performs a partial match.

    Example:

    search=pep

    matches

    Pepperoni
    */

    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    /*
    Filter pizzas by category.

    Example:

    category=Pork
    */

    if (category) {
      query.category = category;
    }

    /*
    Determine how MongoDB should sort the results.
    */

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "price") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "-price") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "rating") {
      sortOption = {
        rating: -1,
      };
    }

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    // Retrieve pizzas from MongoDB.
    const pizzas = await Pizza.find(query).sort(sortOption);

    return res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pizzas.",
      error: error.message,
    });
  }
};

// =============================================================
// GET FEATURED PIZZAS
// =============================================================

const getFeaturedPizzas = async (req, res) => {
  try {
    /*
    Return only pizzas that are:

    • Marked as featured by the administrator.
    • Currently available to customers.

    The highest-rated featured pizzas appear first.
    */

    const pizzas = await Pizza.find({
      featured: true,
      available: true,
    }).sort({
      rating: -1,
    });

    return res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured pizzas.",
      error: error.message,
    });
  }
};

// =============================================================
// GET POPULAR PIZZAS
// =============================================================

const getPopularPizzas = async (req, res) => {
  try {
    /*
    Return only pizzas that are:

    • Marked as popular by the administrator.
    • Currently available to customers.

    The highest-rated popular pizzas appear first.
    */

    const pizzas = await Pizza.find({
      popular: true,
      available: true,
    }).sort({
      rating: -1,
    });

    return res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch popular pizzas.",
      error: error.message,
    });
  }
};

// =============================================================
// GET ONE AVAILABLE PIZZA
// =============================================================

const getPizzaById = async (req, res) => {
  try {
    // Read the pizza ID from the URL.
    const { id } = req.params;

    /*
    Validate the MongoDB ID before querying the database.

    Without this check, an invalid ID could cause
    a Mongoose CastError.
    */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID.",
      });
    }

    /*
    Find a pizza that both:
    • Matches the supplied ID.
    • Is currently available.
    */

    const pizza = await Pizza.findOne({
      _id: id,
      available: true,
    });

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found or currently unavailable.",
      });
    }

    return res.status(200).json({
      success: true,
      pizza,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pizza.",
      error: error.message,
    });
  }
};

// Export the controller functions.
module.exports = {
  getAllPizzas,
  getFeaturedPizzas,
  getPopularPizzas,
  getPizzaById,
};
