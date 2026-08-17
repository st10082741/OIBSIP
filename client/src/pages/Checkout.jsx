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

      navigate(`/payment/${result.order._id}`, {
        state: {
          order: result.order,
        },
      });
    } catch (requestError) {
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
      {/* ==================================================
          PAGE INTRO
      ================================================== */}

      <header className="checkout-heading">
        <span className="checkout-eyebrow">Secure checkout</span>

        <h1>Almost at your doorstep.</h1>

        <p>
          Confirm your delivery details and review your order before moving
          securely to payment.
        </p>

        <Link className="checkout-back" to="/cart">
          ← Back to cart
        </Link>
      </header>

      {/* ==================================================
          CHECKOUT PROGRESS
      ================================================== */}

      <div className="checkout-progress">
        <div className="checkout-progress-step completed">
          <span>✓</span>

          <div>
            <strong>Cart</strong>
            <small>Order selected</small>
          </div>
        </div>

        <div className="checkout-progress-line completed" />

        <div className="checkout-progress-step active">
          <span>2</span>

          <div>
            <strong>Delivery</strong>
            <small>Confirm details</small>
          </div>
        </div>

        <div className="checkout-progress-line" />

        <div className="checkout-progress-step">
          <span>3</span>

          <div>
            <strong>Payment</strong>
            <small>Complete order</small>
          </div>
        </div>
      </div>

      {/* ==================================================
          CHECKOUT EXPERIENCE
      ================================================== */}

      <div className="checkout-experience">
        <div className="checkout-layout">
          {/* ==================================================
              DELIVERY
          ================================================== */}

          <section className="checkout-delivery">
            <div className="checkout-section-heading">
              <div className="checkout-number">1</div>

              <div>
                <span className="checkout-section-label">
                  Delivery information
                </span>

                <h2>Where should we deliver?</h2>

                <p>
                  Add the address and contact details our delivery team will
                  use.
                </p>
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

                <div>
                  <strong>Secure order verification</strong>

                  <p>
                    Your final order total is recalculated by the backend before
                    payment. The browser is never trusted for the final amount.
                  </p>
                </div>
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
              SUMMARY
          ================================================== */}

          <aside className="checkout-summary">
            <div className="checkout-section-heading summary-heading">
              <div className="checkout-number">2</div>

              <div>
                <span className="checkout-section-label">Your order</span>

                <h2>Order summary</h2>

                <p>
                  {getCartCount()} {getCartCount() === 1 ? "pizza" : "pizzas"}{" "}
                  ready for checkout
                </p>
              </div>
            </div>

            <div className="checkout-items">
              {cartItems.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <div className="checkout-item-info">
                    <div className="checkout-item-icon">🍕</div>

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
                  </div>

                  <strong className="checkout-item-price">
                    R {Number(item.subtotal).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-divider" />

            <div className="checkout-total-row">
              <span>Subtotal</span>

              <strong>R {Number(getCartTotal()).toFixed(2)}</strong>
            </div>

            <div className="checkout-total-row delivery">
              <span>Delivery</span>

              <strong>Included</strong>
            </div>

            <div className="checkout-grand-total">
              <div>
                <span>Total</span>

                <small>Verified by the server at payment</small>
              </div>

              <strong>R {Number(getCartTotal()).toFixed(2)}</strong>
            </div>

            <div className="checkout-payment-note">
              <span>💳</span>

              <div>
                <strong>Razorpay-style Test Mode</strong>

                <p>
                  This internship demonstration does not process real money.
                </p>
              </div>
            </div>

            <div className="checkout-order-note">
              <span>🚚</span>

              <p>
                After payment, track your order from confirmation through the
                kitchen and delivery stages.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
