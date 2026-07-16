// Import the routing components from React Router
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import the layouts
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Import all application pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";

import Home from "../pages/Home";
import Menu from "../pages/Menu";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";

// This component contains every route in the application
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Main application pages */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/menu" element={<Menu />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/checkout" element={<Checkout />} />

          <Route path="/orders" element={<Orders />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* If no route matches, show the 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
