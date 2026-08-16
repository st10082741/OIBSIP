import api from "./api";

const adminConfig = {
  headers: {
    "X-Auth-Type": "admin",
  },
};

// Load complete inventory dashboard.
export const getAdminInventory = async () => {
  const response = await api.get("/inventory", adminConfig);

  return response.data;
};

// Edit inventory details.
export const updateInventoryItem = async (category, id, updates) => {
  const response = await api.patch(
    `/inventory/${category}/${id}`,
    updates,
    adminConfig,
  );

  return response.data;
};

// Increase or decrease stock.
export const adjustInventoryStock = async (category, id, amount) => {
  const response = await api.patch(
    `/inventory/${category}/${id}/stock`,
    { amount },
    adminConfig,
  );

  return response.data;
};

// Add inventory ingredient.
export const addInventoryItem = async (category, item) => {
  const response = await api.post(`/inventory/${category}`, item, adminConfig);

  return response.data;
};

// Delete inventory ingredient.
export const deleteInventoryItem = async (category, id) => {
  const response = await api.delete(
    `/inventory/${category}/${id}`,
    adminConfig,
  );

  return response.data;
};
