import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please complete both password fields.");
      return;
    }

    const strongPasswordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!strongPasswordPattern.test(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await resetPassword(token, password);

      toast.success(result.message || "Password reset successfully.");

      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "The password reset link is invalid or expired.",
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
          <h2>Choose a fresh password.</h2>
          <p>Create a new secure password for your Pizza Delivery account.</p>
        </div>

        <div className="auth-brand-footer">Secure account recovery.</div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          <header className="auth-form-header">
            <span className="auth-eyebrow">Password reset</span>
            <h1>New password</h1>
            <p>
              Use 8+ characters with uppercase, lowercase, a number and a
              special character.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-message error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="8+ characters with Aa, 1 and @"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-new-password">Confirm new password</label>

              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                disabled={loading}
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Updating password..." : "Reset Password"}
            </button>
          </form>

          <p className="auth-switch">
            <Link to="/login">Return to login</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default ResetPassword;
