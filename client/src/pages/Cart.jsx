import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

import { getImageUrl } from "../utils/imageUrl";

import "./Cart.css";

function Cart() {
  const {
    cartItems,
    loading,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useCart();

  // ===========================================================
  // DISPLAY HELPERS
  // ===========================================================

  const getItemName = (item) => {
    if (item.itemType === "catalog") {
      return item.pizza?.name || "Pizza";
    }

    return "Your Custom Pizza";
  };

  const getCustomDescription = (item) => {
    const custom = item.customPizza;

    if (!custom) return "";

    const vegetables =
      custom.vegetables?.map((vegetable) => vegetable.name).join(", ") ||
      "No vegetables";

    return [
      custom.base?.name,
      custom.sauce?.name,
      custom.cheese?.name,
      vegetables,
    ]
      .filter(Boolean)
      .join(" • ");
  };

  // ===========================================================
  // LOADING
  // ===========================================================

  if (loading && cartItems.length === 0) {
    return (
      <div className="cart-loading">
        <div className="cart-spinner" />
        <h2>Loading your cart...</h2>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="cart-header">
        <span className="cart-eyebrow">Your Order</span>

        <h1>Your pizza cart.</h1>

        <p>Review your choices before heading to checkout.</p>
      </header>

      {cartItems.length === 0 ? (
        <section className="empty-cart">
          <div className="empty-cart-icon">🛒</div>

          <h2>Your cart is waiting.</h2>

          <p>
            Add one of our kitchen favourites or create something completely
            your own.
          </p>

          <div className="empty-cart-actions">
            <Link to="/menu" className="browse-menu-btn">
              Browse Menu
            </Link>

            <Link to="/builder" className="build-pizza-btn">
              Build Your Pizza
            </Link>
          </div>
        </section>
      ) : (
        <div className="cart-layout">
          {/* ==================================================
              ITEMS
          ================================================== */}

          <section className="cart-items-section">
            <div className="cart-section-title">
              <div>
                <span className="cart-eyebrow">Basket</span>

                <h2>
                  {getCartCount()} item
                  {getCartCount() !== 1 ? "s" : ""}
                </h2>
              </div>

              <button
                type="button"
                className="clear-cart-btn"
                onClick={clearCart}
              >
                Clear cart
              </button>
            </div>

            {cartItems.map((item) => {
              const catalogImage =
                item.itemType === "catalog"
                  ? getImageUrl(item.pizza?.image)
                  : "";

              return (
                <article key={item.id} className="cart-item">
                  <div className="cart-item-visual">
                    {catalogImage ? (
                      <img
                        src={catalogImage}
                        alt={getItemName(item)}
                        className="cart-image"
                      />
                    ) : (
                      <div className="cart-custom-image">🍕</div>
                    )}

                    <span className="cart-item-type">
                      {item.itemType === "catalog"
                        ? "Menu Pizza"
                        : "Custom Pizza"}
                    </span>
                  </div>

                  <div className="cart-details">
                    <div className="cart-item-heading">
                      <div>
                        <h3>{getItemName(item)}</h3>

                        <p>
                          {item.itemType === "catalog"
                            ? item.pizza?.description
                            : getCustomDescription(item)}
                        </p>
                      </div>

                      <strong className="cart-item-subtotal">
                        R {Number(item.subtotal).toFixed(2)}
                      </strong>
                    </div>

                    <div className="cart-item-footer">
                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.id)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-unit-price">
                        R {Number(item.unitPrice).toFixed(2)}
                        <span> each</span>
                      </div>

                      <button
                        type="button"
                        className="remove-link"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <aside className="order-summary">
            <span className="cart-eyebrow">Order Summary</span>

            <h2>Almost there.</h2>

            <div className="summary-row">
              <span>Items</span>
              <strong>{getCartCount()}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>R {getCartTotal().toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <strong className="free-delivery">FREE</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-row total">
              <span>Total</span>

              <strong>R {getCartTotal().toFixed(2)}</strong>
            </div>

            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout →
            </Link>

            <Link to="/menu" className="continue-shopping">
              ← Continue shopping
            </Link>

            <div className="cart-security-note">
              🔒 Prices are verified again by the kitchen before payment.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
