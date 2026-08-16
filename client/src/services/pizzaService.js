import api from "./api";

/*
==============================================================
                    PIZZA SERVICE
==============================================================

All customer-facing pizza requests live here.

The React application no longer depends on hardcoded
pizza arrays.
==============================================================
*/

// Load all available pizzas.
export const getPizzas = async () => {
  const response = await api.get("/pizzas");

  return response.data;
};

// Load featured pizzas.
export const getFeaturedPizzas = async () => {
  const response = await api.get("/pizzas/featured");

  return response.data;
};

// Load popular pizzas.
export const getPopularPizzas = async () => {
  const response = await api.get("/pizzas/popular");

  return response.data;
};

// Load one pizza.
export const getPizzaById = async (id) => {
  const response = await api.get(`/pizzas/${id}`);

  return response.data;
};
