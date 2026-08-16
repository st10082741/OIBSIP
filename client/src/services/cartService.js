import api from "./api";

/*
==============================================================
                    CART SERVICE
==============================================================

All customer shopping-cart communication with the backend.

The backend remains the source of truth for:

• Pizza prices
• Custom pizza prices
• Quantities
• Cart totals
==============================================================
*/

// Load the authenticated customer's cart.
export const getCart = async () => {
  const response = await api.get("/cart");

  return response.data;
};

// Add a regular catalog pizza.
export const addCatalogPizza = async (pizzaId, quantity = 1) => {
  const response = await api.post("/cart/items", {
    pizzaId,
    quantity,
  });

  return response.data;
};

// Add a custom pizza.
export const addCustomPizza = async ({
  baseId,
  sauceId,
  cheeseId,
  vegetableIds = [],
  quantity = 1,
}) => {
  const response = await api.post("/cart/custom", {
    baseId,
    sauceId,
    cheeseId,
    vegetableIds,
    quantity,
  });

  return response.data;
};

// Update one cart item's quantity.
export const updateCartItem = async (itemId, quantity) => {
  const response = await api.patch(`/cart/items/${itemId}`, {
    quantity,
  });

  return response.data;
};

// Remove one item.
export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/cart/items/${itemId}`);

  return response.data;
};

// Clear entire cart.
export const clearCustomerCart = async () => {
  const response = await api.delete("/cart");

  return response.data;
};
