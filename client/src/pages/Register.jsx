import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Register() {
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    const strongPasswordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!strongPasswordPattern.test(formData.password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character.",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setSuccessMessage(result.message);
      toast.success("Account created!");

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Registration could not be completed.",
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
          <h2>Create it. Customize it. Track it.</h2>
          <p>
            Join Pizza Delivery and build pizzas exactly the way you want them,
            from the base all the way to your favourite vegetables.
          </p>
        </div>

        <div className="auth-brand-footer">Your perfect pizza starts here.</div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          <header className="auth-form-header">
            <span className="auth-eyebrow">Create account</span>
            <h1>Join us</h1>
            <p>Register and verify your email before your first login.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="auth-message success">
                {successMessage}
                <br />
                Check your inbox and use the verification link before signing
                in.
              </div>
            )}

            {error && <div className="auth-message error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
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
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="8+ characters with Aa, 1 and @"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already registered?
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Register;
