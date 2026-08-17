import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import "./Navbar.css";

import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  const { getCartCount } = useContext(CartContext);
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const firstName = user?.name?.split(" ")[0] || "Customer";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();

    setProfileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const navClassName = ({ isActive }) =>
    `navbar-link${isActive ? " active" : ""}`;

  return (
    <header className="navbar-shell">
      <nav className="navbar">
        {/* ==================================================
            BRAND
        ================================================== */}

        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🍕</span>

          <div className="navbar-brand-copy">
            <strong>Pizza Delivery</strong>
            <span>Freshly made. Delivered fast.</span>
          </div>
        </Link>

        {/* ==================================================
            MAIN NAVIGATION
        ================================================== */}

        <div className="navbar-navigation">
          <NavLink to="/" end className={navClassName}>
            Home
          </NavLink>

          <NavLink to="/menu" className={navClassName}>
            Menu
          </NavLink>

          <NavLink to="/orders" className={navClassName}>
            Orders
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `navbar-link navbar-cart${isActive ? " active" : ""}`
            }
          >
            <span className="navbar-cart-icon">🛒</span>

            <span>Cart</span>

            {cartCount > 0 && (
              <span className="navbar-cart-count">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* ==================================================
            CUSTOMER ACCOUNT
        ================================================== */}

        <div className="navbar-account" ref={profileRef}>
          <button
            type="button"
            className={`navbar-profile-trigger ${profileOpen ? "open" : ""}`}
            onClick={() => setProfileOpen((previous) => !previous)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <span className="navbar-avatar">{initial}</span>

            <span className="navbar-profile-copy">
              <small>Signed in as</small>
              <strong>{firstName}</strong>
            </span>

            <span
              className={`navbar-profile-chevron ${profileOpen ? "open" : ""}`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {profileOpen && (
            <div className="navbar-profile-menu" role="menu">
              <div className="navbar-profile-menu-header">
                <span className="navbar-menu-avatar">{initial}</span>

                <div>
                  <strong>{user?.name || "Customer"}</strong>

                  {user?.email && <span>{user.email}</span>}
                </div>
              </div>

              <div className="navbar-profile-divider" />

              <Link
                to="/orders"
                className="navbar-profile-item"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <span>📦</span>

                <div>
                  <strong>Your orders</strong>
                  <small>Track and review purchases</small>
                </div>
              </Link>

              <Link
                to="/cart"
                className="navbar-profile-item"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <span>🛒</span>

                <div>
                  <strong>Your cart</strong>
                  <small>
                    {cartCount} {cartCount === 1 ? "item" : "items"} ready
                  </small>
                </div>
              </Link>

              <div className="navbar-profile-divider" />

              <button
                type="button"
                className="navbar-profile-item navbar-signout"
                role="menuitem"
                onClick={handleLogout}
              >
                <span>↗</span>

                <div>
                  <strong>Sign out</strong>
                  <small>End this customer session</small>
                </div>
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
