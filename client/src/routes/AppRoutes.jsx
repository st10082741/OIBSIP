import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";

// ============================================================
// ROUTE SECURITY
// ============================================================

import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "../components/AdminRoute/AdminRoute";

// ============================================================
// AUTHENTICATION PAGES
// ============================================================

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import AdminLogin from "../pages/AdminLogin";

// ============================================================
// CUSTOMER PAGES
// ============================================================

import Home from "../pages/Home";
import Menu from "../pages/Menu";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import NotFound from "../pages/NotFound";
import PizzaBuilder from "../pages/PizzaBuilder";
import Payment from "../pages/Payment";

// ============================================================
// ADMIN PAGES
// ============================================================

import AdminDashboard from "../pages/AdminDashboard";
import AdminInventory from "../pages/AdminInventory";
import AdminPizzas from "../pages/AdminPizzas";
// ============================================================
// ERROR PAGE
// ============================================================

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================
            PUBLIC AUTHENTICATION
        ================================================== */}

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        {/* ==================================================
            PROTECTED CUSTOMER APPLICATION
        ================================================== */}

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/builder" element={<PizzaBuilder />} />
            <Route path="/payment/:orderId" element={<Payment />} />
          </Route>
        </Route>

        {/* ==================================================
            PROTECTED ADMIN APPLICATION
        ================================================== */}

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="/admin/inventory" element={<AdminInventory />} />

            <Route path="/admin/pizzas" element={<AdminPizzas />} />
          </Route>
        </Route>

        {/* ==================================================
            404
        ================================================== */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
