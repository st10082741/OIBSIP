import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";

import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const { cartItems, getCartTotal, getCartCount } = useCart();

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const hasEmptyField = Object.values(formData).some(
      (value) => !value.trim(),
    );

    if (hasEmptyField) {
      setError("Please complete all delivery information.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await createOrder({
        street: formData.street.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        postalCode: formData.postalCode.trim(),
        phone: formData.phone.trim(),
      });

      toast.success("Order summary created.");

      /*
      Send the newly-created order to the payment page.

      The payment page will still use the backend order ID,
      so the browser is never trusted for payment totals.
      */
      navigate(`/payment/${result.order._id}`, {
        state: {
          order: result.order,
        },
      });
    } catch (requestError) {
      /*
      Your backend returns HTTP 409 when the customer
      already has an order awaiting payment.
      */

      if (
        requestError.response?.status === 409 &&
        requestError.response?.data?.orderId
      ) {
        toast.info("You already have an order awaiting payment.");

        navigate(`/payment/${requestError.response.data.orderId}`);

        return;
      }

      setError(
        requestError.response?.data?.message ||
          "We could not prepare your order.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🍕</div>

          <span>Nothing to checkout</span>

          <h1>Your cart is empty.</h1>

          <p>
            Add a pizza from the menu or create your own masterpiece before
            heading to checkout.
          </p>

          <Link className="checkout-menu-link" to="/menu">
            Explore Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-heading">
        <div>
          <span className="checkout-eyebrow">Secure checkout</span>

          <h1>Almost at your doorstep.</h1>

          <p>
            Confirm where we should deliver your order before continuing to
            payment.
          </p>
        </div>

        <Link className="checkout-back" to="/cart">
          ← Back to cart
        </Link>
      </div>

      <div className="checkout-layout">
        {/* ==================================================
            DELIVERY FORM
        ================================================== */}

        <section className="checkout-card checkout-delivery">
          <div className="checkout-section-heading">
            <div className="checkout-number">1</div>

            <div>
              <h2>Delivery details</h2>
              <p>Tell us where your pizza is going.</p>
            </div>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit}>
            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-field checkout-field-full">
              <label htmlFor="street">Street address</label>

              <input
                id="street"
                name="street"
                type="text"
                placeholder="12 Pizza Street"
                value={formData.street}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="checkout-form-grid">
              <div className="checkout-field">
                <label htmlFor="city">City</label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Cape Town"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="province">Province</label>

                <input
                  id="province"
                  name="province"
                  type="text"
                  placeholder="Western Cape"
                  value={formData.province}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="postalCode">Postal code</label>

                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  placeholder="8001"
                  value={formData.postalCode}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="phone">Phone number</label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="071 234 5678"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="checkout-security">
              <span>🔒</span>

              <p>
                Your final order total is recalculated securely by the server
                before payment.
              </p>
            </div>

            <button
              className="checkout-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Preparing order..." : "Continue to Payment →"}
            </button>
          </form>
        </section>

        {/* ==================================================
            ORDER SUMMARY
        ================================================== */}

        <aside className="checkout-card checkout-summary">
          <div className="checkout-section-heading">
            <div className="checkout-number">2</div>

            <div>
              <h2>Order summary</h2>
              <p>
                {getCartCount()} {getCartCount() === 1 ? "pizza" : "pizzas"}
              </p>
            </div>
          </div>

          <div className="checkout-items">
            {cartItems.map((item) => (
              <div className="checkout-item" key={item.id}>
                <div>
                  <strong>
                    {item.itemType === "catalog"
                      ? item.pizza?.name
                      : "Custom Pizza"}
                  </strong>

                  <span>Quantity {item.quantity}</span>

                  {item.itemType === "custom" && (
                    <small>
                      {[
                        item.customPizza?.base?.name,
                        item.customPizza?.sauce?.name,
                        item.customPizza?.cheese?.name,
                        ...(item.customPizza?.vegetables || []).map(
                          (vegetable) => vegetable.name,
                        ),
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </small>
                  )}
                </div>

                <strong>R {Number(item.subtotal).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <div className="checkout-divider" />

          <div className="checkout-total-row">
            <span>Subtotal</span>
            <span>R {Number(getCartTotal()).toFixed(2)}</span>
          </div>

          <div className="checkout-total-row delivery">
            <span>Delivery</span>
            <span>Included</span>
          </div>

          <div className="checkout-grand-total">
            <div>
              <span>Total</span>
              <small>Server verified at next step</small>
            </div>

            <strong>R {Number(getCartTotal()).toFixed(2)}</strong>
          </div>

          <div className="checkout-payment-note">
            <span>💳</span>

            <div>
              <strong>Razorpay Test Mode</strong>
              <p>No real money will be charged.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
