/*
==============================================================
                ADMIN PIZZA CONTROLLER
==============================================================

This controller handles administrator pizza management.

Responsibilities:

• View all pizzas, including unavailable pizzas
• View one pizza
• Create pizzas
• Update pizzas
• Delete pizzas
• Control featured status
• Control popular status
• Control availability
• Manage catalog pizza inventory recipes
• Upload / replace pizza images

Customer-facing pizza requests remain inside
pizzaController.js.

==============================================================
*/

// Import mongoose for MongoDB ID validation.
const mongoose = require("mongoose");

// Import the Pizza model.
const Pizza = require("../models/Pizza");

// =============================================================
// GET ALL PIZZAS FOR ADMIN
// =============================================================

const getAllAdminPizzas = async (req, res) => {
  try {
    /*
    Unlike the customer endpoint, the admin endpoint returns
    BOTH available and unavailable pizzas.

    The administrator needs to see hidden pizzas so they
    can manage or reactivate them.
    */

    const pizzas = await Pizza.find().sort({
      createdAt: -1,
    });

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
// GET ONE PIZZA FOR ADMIN
// =============================================================

const getAdminPizzaById = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent Mongoose CastErrors from invalid IDs.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID.",
      });
    }

    /*
    Admin can retrieve the pizza regardless of whether
    available is true or false.
    */
    const pizza = await Pizza.findById(id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found.",
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

// =============================================================
// CREATE PIZZA
// =============================================================

const createPizza = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,

      /*
      Recipe maps a catalog pizza to the inventory
      ingredients consumed when the pizza is ordered.

      Example:

      recipe: {
        base: "...",
        sauce: "...",
        cheese: "...",
        vegetables: ["...", "..."]
      }
      */
      recipe,

      image,
      rating,
      featured,
      popular,
      available,
    } = req.body;

    // Validate the fields required to create a menu pizza.
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price and category are required.",
      });
    }

    // Reject invalid negative prices.
    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Pizza price must be a non-negative number.",
      });
    }

    /*
    Check for an existing pizza with the same name.

    The regular expression makes this comparison
    case-insensitive.

    Example:

    Pepperoni
    pepperoni

    are treated as the same name.
    */
    const existingPizza = await Pizza.findOne({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (existingPizza) {
      return res.status(400).json({
        success: false,
        message: "A pizza with this name already exists.",
      });
    }

    // ---------------------------------------------------------
    // CREATE PIZZA DOCUMENT
    // ---------------------------------------------------------

    const pizza = await Pizza.create({
      name,
      description,
      price,
      category,

      /*
      If the admin does not provide a recipe yet,
      initialise a safe empty recipe.

      This allows the pizza to exist in the menu while
      its inventory mapping can be configured later.
      */
      recipe: recipe ?? {
        base: null,
        sauce: null,
        cheese: null,
        vegetables: [],
      },

      /*
      The image path may be empty when the pizza is first
      created. The dedicated image-upload endpoint can
      populate it later.
      */
      image: image ?? "",

      rating: rating ?? 0,
      featured: featured ?? false,
      popular: popular ?? false,
      available: available ?? true,
    });

    return res.status(201).json({
      success: true,
      message: "Pizza created successfully.",
      pizza,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create pizza.",
      error: error.message,
    });
  }
};

// =============================================================
// UPDATE PIZZA
// =============================================================

const updatePizza = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID.",
      });
    }

    /*
    Only these fields may be changed through
    the administrator pizza-management API.

    Recipe is included so the administrator can manage
    inventory mappings without changing backend code.
    */
    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "recipe",
      "image",
      "rating",
      "featured",
      "popular",
      "available",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Reject a negative price if price is being updated.
    if (
      updates.price !== undefined &&
      (typeof updates.price !== "number" || updates.price < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Pizza price must be a non-negative number.",
      });
    }

    // Reject ratings outside the supported 0–5 range.
    if (
      updates.rating !== undefined &&
      (typeof updates.rating !== "number" ||
        updates.rating < 0 ||
        updates.rating > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Pizza rating must be between 0 and 5.",
      });
    }

    /*
    If the pizza name is being changed, prevent it from
    duplicating another pizza.
    */
    if (updates.name) {
      const duplicatePizza = await Pizza.findOne({
        _id: {
          $ne: id,
        },

        name: {
          $regex: `^${updates.name.trim()}$`,
          $options: "i",
        },
      });

      if (duplicatePizza) {
        return res.status(400).json({
          success: false,
          message: "A pizza with this name already exists.",
        });
      }
    }

    /*
    Update the pizza and return the updated document.

    runValidators ensures Mongoose schema validation still
    applies to the fields being changed.
    */
    const pizza = await Pizza.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pizza updated successfully.",
      pizza,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update pizza.",
      error: error.message,
    });
  }
};

// =============================================================
// DELETE PIZZA
// =============================================================

const deletePizza = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID.",
      });
    }

    const pizza = await Pizza.findByIdAndDelete(id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pizza deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete pizza.",
      error: error.message,
    });
  }
};

// =============================================================
// UPLOAD / REPLACE PIZZA IMAGE
// =============================================================

const uploadPizzaImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the MongoDB pizza ID.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID.",
      });
    }

    // Multer places the uploaded file on req.file.
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a pizza image.",
      });
    }

    const pizza = await Pizza.findById(id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found.",
      });
    }

    /*
    Store the public image path in MongoDB.

    We store the URL/path rather than storing the
    actual image binary inside the Pizza document.
    */
    pizza.image = `/uploads/pizzas/${req.file.filename}`;

    await pizza.save();

    return res.status(200).json({
      success: true,
      message: "Pizza image uploaded successfully.",

      pizza: {
        id: pizza._id,
        name: pizza.name,
        image: pizza.image,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload pizza image.",
      error: error.message,
    });
  }
};

// =============================================================
// EXPORT ADMINISTRATOR PIZZA FUNCTIONS
// =============================================================

module.exports = {
  getAllAdminPizzas,
  getAdminPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
  uploadPizzaImage,
};
