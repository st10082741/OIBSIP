/*
==============================================================
                PIZZA BUILDER ROUTES
==============================================================

These routes provide the available ingredient options
used by the custom pizza builder.

==============================================================
*/

const express = require("express");

const router = express.Router();

const {
  getPizzaBases,
  getSauces,
  getCheeses,
  getVegetables,
  buildCustomPizza,
} = require("../controllers/builderController");

// Step 1: Available pizza bases.
router.get("/bases", getPizzaBases);

// Step 2: Available sauces.
router.get("/sauces", getSauces);

// Step 3: Available cheese types.
router.get("/cheeses", getCheeses);

// Step 4: Available vegetables.
router.get("/vegetables", getVegetables);

// Step 5: Validate and construct a customer's custom pizza.
router.post("/build", buildCustomPizza);

module.exports = router;
