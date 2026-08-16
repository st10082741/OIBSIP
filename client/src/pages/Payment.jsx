//This page is a simulated checkout for the internship test. It does not integrate with Razorpay,
//  but instead simulates the required test payment flow.

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  completeTestPayment,
  createTestPaymentSession,
} from "../services/paymentService";

import { useCart } from "../context/CartContext";

import "./Payment.css";

function Payment() {
  const { orderId } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const { refreshCart } = useCart();

  const [payment, setPayment] = useState(null);
  const [order, setOrder] = useState(location.state?.order || null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    const loadPaymentSession = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await createTestPaymentSession(orderId);

        setPayment(result.payment);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Could not prepare the payment session.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPaymentSession();
  }, [orderId]);

  const handlePayment = async (result) => {
    if (!payment?.testPaymentOrderId) {
      setError("Payment session is unavailable.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const response = await completeTestPayment({
        orderId,
        testPaymentOrderId: payment.testPaymentOrderId,
        result,
      });

      if (result === "Success") {
        setPaymentResult("success");

        await refreshCart();

        toast.success("Payment completed successfully.");

        setOrder((current) => ({
          ...(current || {}),
          ...response.order,
        }));

        return;
      }

      setPaymentResult("failure");

      toast.error("Test payment failed.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "Payment could not be completed.",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="payment-state">
        <div className="payment-spinner" />

        <h2>Preparing secure test payment...</h2>
      </main>
    );
  }

  if (error && !payment) {
    return (
      <main className="payment-state">
        <span>⚠️</span>

        <h2>Payment unavailable</h2>

        <p>{error}</p>

        <Link to="/orders">View My Orders</Link>
      </main>
    );
  }

  if (paymentResult === "success") {
    return (
      <main className="payment-result-page">
        <section className="payment-result success">
          <div className="payment-result-icon">✓</div>

          <span>Payment successful</span>

          <h1>Your pizza order is confirmed.</h1>

          <p>
            Your payment was completed in Razorpay Test Mode. The kitchen can
            now begin processing your order.
          </p>

          <div className="payment-result-details">
            <div>
              <span>Order</span>
              <strong>#{orderId.slice(-6).toUpperCase()}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{order?.status || "Order Received"}</strong>
            </div>

            <div>
              <span>Payment</span>
              <strong>Paid</strong>
            </div>
          </div>

          <div className="payment-result-actions">
            <button type="button" onClick={() => navigate("/orders")}>
              Track My Order
            </button>

            <Link to="/">Back to Dashboard</Link>
          </div>
        </section>
      </main>
    );
  }

  if (paymentResult === "failure") {
    return (
      <main className="payment-result-page">
        <section className="payment-result failure">
          <div className="payment-result-icon">!</div>

          <span>Payment failed</span>

          <h1>Your order has not been paid.</h1>

          <p>
            No inventory was deducted and your cart remains unchanged. You can
            retry the test payment.
          </p>

          <div className="payment-result-actions">
            <button type="button" onClick={() => setPaymentResult(null)}>
              Try Again
            </button>

            <Link to="/cart">Return to Cart</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="payment-page">
      <section className="payment-card">
        <div className="payment-brand">
          <div>
            <span className="payment-eyebrow">Razorpay Test Mode</span>

            <h1>Complete your test payment.</h1>

            <p>
              This simulated checkout behaves like the required Razorpay test
              integration. No real money will be charged.
            </p>
          </div>

          <div className="payment-lock">🔒</div>
        </div>

        {error && <div className="payment-error">{error}</div>}

        <div className="payment-order-box">
          <div>
            <span>Order ID</span>
            <strong>#{orderId.slice(-6).toUpperCase()}</strong>
          </div>

          <div>
            <span>Amount</span>
            <strong>
              {payment?.currency || "ZAR"}{" "}
              {Number(payment?.amount || 0).toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Payment session</span>
            <small>{payment?.testPaymentOrderId}</small>
          </div>
        </div>

        <div className="payment-demo-note">
          <span>🧪</span>

          <div>
            <strong>Internship Test Checkout</strong>

            <p>
              Select Success to simulate a successful Razorpay test payment, or
              Failure to test the unsuccessful-payment path.
            </p>
          </div>
        </div>

        <div className="payment-actions">
          <button
            type="button"
            className="payment-success-btn"
            disabled={processing}
            onClick={() => handlePayment("Success")}
          >
            {processing ? "Processing..." : "✓ Simulate Success"}
          </button>

          <button
            type="button"
            className="payment-failure-btn"
            disabled={processing}
            onClick={() => handlePayment("Failure")}
          >
            ✕ Simulate Failure
          </button>
        </div>

        <Link className="payment-back" to="/cart">
          ← Return to cart
        </Link>
      </section>
    </main>
  );
}

export default Payment;
