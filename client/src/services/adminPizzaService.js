import api from "./api";

const adminHeaders = {
  "X-Auth-Type": "admin",
};

// Get every pizza, including unavailable ones.
export const getAdminPizzas = async () => {
  const response = await api.get("/admin/pizzas", {
    headers: adminHeaders,
  });

  return response.data;
};

// Create pizza.
export const createAdminPizza = async (pizzaData) => {
  const response = await api.post("/admin/pizzas", pizzaData, {
    headers: adminHeaders,
  });

  return response.data;
};

// Edit pizza.
export const updateAdminPizza = async (pizzaId, updates) => {
  const response = await api.patch(`/admin/pizzas/${pizzaId}`, updates, {
    headers: adminHeaders,
  });

  return response.data;
};

// Delete pizza.
export const deleteAdminPizza = async (pizzaId) => {
  const response = await api.delete(`/admin/pizzas/${pizzaId}`, {
    headers: adminHeaders,
  });

  return response.data;
};

// Upload or replace pizza image.
export const uploadAdminPizzaImage = async (pizzaId, imageFile) => {
  const formData = new FormData();

  formData.append("image", imageFile);

  const response = await api.patch(`/admin/pizzas/${pizzaId}/image`, formData, {
    headers: {
      "X-Auth-Type": "admin",
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
