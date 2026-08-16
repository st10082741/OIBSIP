import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // EMAIL VERIFICATION MESSAGE
  // ============================================================

  const searchParams = new URLSearchParams(location.search);
  const emailVerified = searchParams.get("verified") === "true";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      toast.success(result.message || "Welcome back!");

      const destination = location.state?.from?.pathname || "/";

      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-logo">🍕 Pizza Delivery</div>

        <div className="auth-brand-content">
          <h2>Your next pizza is only a few clicks away.</h2>

          <p>
            Sign in to build your own pizza, manage your cart and follow your
            order from the kitchen to delivery.
          </p>
        </div>

        <div className="auth-brand-footer">
          Fresh ingredients. Simple ordering. Fast delivery.
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          <header className="auth-form-header">
            <span className="auth-eyebrow">Customer account</span>

            <h1>Welcome back</h1>

            <p>Enter your account details to continue ordering.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* ==================================================
                EMAIL VERIFICATION SUCCESS
            ================================================== */}

            {emailVerified && (
              <div className="auth-message success">
                Email verified successfully. You can now sign in.
              </div>
            )}

            {/* ==================================================
                LOGIN ERROR
            ================================================== */}

            {error && <div className="auth-message error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="auth-helper-row">
              <Link className="auth-link" to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            New here?
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
