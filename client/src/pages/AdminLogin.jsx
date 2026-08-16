import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function AdminLogin() {
  const { loginAdmin, isAdminAuthenticated } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter the administrator email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await loginAdmin({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      toast.success(result.message || "Administrator authenticated.");

      navigate("/admin", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Administrator login failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page admin-auth">
      <section className="auth-brand-panel">
        <div className="auth-logo">🍕 Pizza Delivery Admin</div>

        <div className="auth-brand-content">
          <h2>Operations command centre.</h2>
          <p>
            Manage orders, pizza availability and inventory from one secure
            administrative workspace.
          </p>
        </div>

        <div className="auth-brand-footer">Authorized administrators only.</div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          <header className="auth-form-header">
            <span className="auth-eyebrow">Administration</span>
            <h1>Admin sign in</h1>
            <p>Authenticate with your administrator credentials.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-message error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="admin-email">Admin email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter administrator password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Access Admin Dashboard"}
            </button>
          </form>

          <div className="auth-security-note">
            🔒 Administrator registration is disabled. Admin accounts can only
            be created securely by the system owner.
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminLogin;
