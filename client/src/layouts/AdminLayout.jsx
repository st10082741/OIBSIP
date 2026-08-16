import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./AdminLayout.css";

function AdminLayout() {
  const { admin, logoutAdmin } = useAuth();

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logoutAdmin();

    navigate("/admin/login", {
      replace: true,
    });
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className={`admin-app-layout ${collapsed ? "collapsed" : ""}`}>
      <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-brand">
            <div className="admin-brand-icon">🍕</div>

            {!collapsed && (
              <div>
                <strong>Pizza Delivery</strong>

                <span>Admin Console</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="admin-collapse-button"
            onClick={() => setCollapsed((current) => !current)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {!collapsed && <span className="admin-nav-label">Operations</span>}

          <NavLink
            to="/admin"
            end
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
            title="Orders"
          >
            <span>📦</span>

            {!collapsed && "Orders"}
          </NavLink>

          <NavLink
            to="/admin/inventory"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
            title="Inventory"
          >
            <span>📊</span>

            {!collapsed && "Inventory"}
          </NavLink>

          <NavLink
            to="/admin/pizzas"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
            title="Pizza Menu"
          >
            <span>🍕</span>

            {!collapsed && "Pizza Menu"}
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-account">
            <div className="admin-account-avatar">
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            {!collapsed && (
              <div>
                <strong>{admin?.name || "Administrator"}</strong>

                <span>{admin?.email}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="admin-signout-button"
            onClick={handleLogout}
            title="Sign out"
          >
            {collapsed ? "↪" : "Sign out"}
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close admin menu"
          onClick={closeMenu}
        />
      )}

      <div className="admin-main-area">
        <header className="admin-mobile-header">
          <div>
            <strong>🍕 Admin Console</strong>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
          >
            ☰
          </button>
        </header>

        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
