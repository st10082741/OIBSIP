import axios from "axios";

/*
==============================================================
                    API CLIENT
==============================================================

Central Axios instance used by the React application.

Development:
http://localhost:5000/api

Production:
VITE_API_URL can point to the deployed HTTPS backend.
==============================================================
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/*
Attach the correct JWT automatically.

Customer pages use:
customerToken

Administrator pages use:
adminToken

Individual admin requests can explicitly select the admin
token through the X-Auth-Type request header.
*/
api.interceptors.request.use(
  (config) => {
    const authType = config.headers?.["X-Auth-Type"];

    if (authType === "admin") {
      const adminToken = localStorage.getItem("adminToken");

      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }

      delete config.headers["X-Auth-Type"];
      return config;
    }

    const customerToken = localStorage.getItem("customerToken");

    if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
