// AuthContext.jsx file is responsible for managing authentication state
// and providing authentication-related functions to the rest of the application.
//  It uses React's Context API to share authentication data and methods across components.
import { createContext, useContext, useMemo, useState } from "react";

import api from "../services/api";

export const AuthContext = createContext(null);

function getStoredJSON(key) {
  try {
    const value = localStorage.getItem(key);

    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function AuthProvider({ children }) {
  // ============================================================
  // CUSTOMER SESSION
  // ============================================================

  const [user, setUser] = useState(() => getStoredJSON("customerUser"));

  const [customerToken, setCustomerToken] = useState(
    () => localStorage.getItem("customerToken") || "",
  );

  // ============================================================
  // ADMIN SESSION
  // ============================================================

  const [admin, setAdmin] = useState(() => getStoredJSON("adminUser"));

  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem("adminToken") || "",
  );

  // ============================================================
  // CUSTOMER REGISTRATION
  // ============================================================

  const register = async ({ name, email, password }) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return response.data;
  };

  // ============================================================
  // CUSTOMER LOGIN
  // ============================================================

  const login = async ({ email, password }) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user: loggedInUser } = response.data;

    localStorage.setItem("customerToken", token);
    localStorage.setItem("customerUser", JSON.stringify(loggedInUser));

    setCustomerToken(token);
    setUser(loggedInUser);

    return response.data;
  };

  // ============================================================
  // CUSTOMER LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");

    setCustomerToken("");
    setUser(null);
  };

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  const requestPasswordReset = async (email) => {
    const response = await api.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  };

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  const resetPassword = async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
    });

    return response.data;
  };

  // ============================================================
  // ADMIN LOGIN
  // ============================================================

  const loginAdmin = async ({ email, password }) => {
    const response = await api.post("/admin/login", {
      email,
      password,
    });

    const { token, admin: loggedInAdmin } = response.data;

    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(loggedInAdmin));

    setAdminToken(token);
    setAdmin(loggedInAdmin);

    return response.data;
  };

  // ============================================================
  // ADMIN LOGOUT
  // ============================================================

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    setAdminToken("");
    setAdmin(null);
  };

  // ============================================================
  // CONTEXT VALUES
  // ============================================================

  const value = useMemo(
    () => ({
      user,
      customerToken,

      admin,
      adminToken,

      isAuthenticated: Boolean(customerToken && user),
      isAdminAuthenticated: Boolean(adminToken && admin),

      register,
      login,
      logout,

      requestPasswordReset,
      resetPassword,

      loginAdmin,
      logoutAdmin,
    }),
    [user, customerToken, admin, adminToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

export default AuthProvider;
