import api from "./api";

/*
==============================================================
                    ORDER SERVICE
==============================================================
Customer order requests used by the React application.
==============================================================
*/

// Create an order from the authenticated customer's cart.
export const createOrder = async (deliveryDetails) => {
  const response = await api.post("/orders", deliveryDetails);

  return response.data;
};

// Load the authenticated customer's latest order.
export const getCurrentOrder = async () => {
  const response = await api.get("/orders/current");

  return response.data;
};

// Load the authenticated customer's complete order history.
export const getMyOrders = async () => {
  const response = await api.get("/orders", {
    params: {
      _t: Date.now(),
    },

    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  return response.data;
};
