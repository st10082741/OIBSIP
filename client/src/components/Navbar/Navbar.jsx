import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";

import "./Navbar.css";

import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  const { getCartCount } = useContext(CartContext);

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo">
        🍕 Pizza Delivery
      </Link>

      {/* Navigation */}
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/menu">Menu</Link>
        </li>

        <li>
          <Link to="/orders">Orders</Link>
        </li>

        <li>
          <Link to="/cart" className="cart-button">
            🛒 Cart ({getCartCount()})
          </Link>
        </li>

        {/* Logged-in customer */}
        <li className="navbar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="user-info">
            <span className="user-greeting">Welcome</span>
            <strong>{user?.name?.split(" ")[0] || "Customer"}</strong>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
