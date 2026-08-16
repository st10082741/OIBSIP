import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function ForgotPassword() {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const result = await requestPasswordReset(email.trim().toLowerCase());

      setMessage(result.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to process the password reset request.",
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
          <h2>We'll help you get back to your pizza.</h2>
          <p>
            Enter the email connected to your account and we'll send you a
            secure password reset link.
          </p>
        </div>

        <div className="auth-brand-footer">
          Reset links expire after one hour.
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          <header className="auth-form-header">
            <span className="auth-eyebrow">Account recovery</span>
            <h1>Forgot password?</h1>
            <p>We'll send password-reset instructions to your inbox.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {message && <div className="auth-message success">{message}</div>}

            {error && <div className="auth-message error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="reset-email">Email address</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                disabled={loading}
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>

          <p className="auth-switch">
            Remembered your password?
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;
