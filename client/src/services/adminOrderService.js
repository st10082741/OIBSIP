import api from "./api";

/*
==============================================================
                ADMIN ORDER SERVICE
==============================================================
Uses the administrator JWT through X-Auth-Type.
==============================================================
*/

export const getAdminOrders = async () => {
  const response = await api.get("/admin/orders", {
    headers: {
      "X-Auth-Type": "admin",
    },
  });

  return response.data;
};

export const getAdminOrderById = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}`, {
    headers: {
      "X-Auth-Type": "admin",
    },
  });

  return response.data;
};

export const updateAdminOrderStatus = async (orderId, status) => {
  const response = await api.patch(
    `/admin/orders/${orderId}/status`,
    {
      status,
    },
    {
      headers: {
        "X-Auth-Type": "admin",
      },
    },
  );

  return response.data;
};
