// Import navigation links from React Router
import { Link } from "react-router-dom";

// Import styles for this component
import "./Navbar.css";
// Import React's useContext hook
import { useContext } from "react";
// Import the shopping cart context
import { CartContext } from "../../context/CartContext";
// Reusable navigation bar displayed across the application
function Navbar() {
  // Access the shopping cart
  const { getCartCount } = useContext(CartContext);

  return (
    <nav className="navbar">
      {/* Application logo */}
      <h2 className="logo">Pizza Delivery</h2>

      {/* Navigation links */}
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
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/cart" className="cart-button">
            🛒 Cart ({getCartCount()})
          </Link>
        </li>
      </ul>
    </nav>
  );
}

// Allow this component to be used in other files
export default Navbar;
