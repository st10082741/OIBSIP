// Import React's useContext hook
import { useContext } from "react";

// Import the shopping cart context
import { CartContext } from "../context/CartContext";

// Import the CSS file for styling the cart page
import "./Cart.css";
// Import the Link component from react-router-dom for navigation
import { Link } from "react-router-dom";

// Shopping Cart page
function Cart() {
  // Access the shared cart data and functions from the CartContext
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
  } = useContext(CartContext);

  return (
    <div className="cart-page">
      {/* ==========================
          PAGE TITLE
      ========================== */}
      {/* ==========================
    PAGE HEADER
========================== */}
      <div className="cart-header">
        <h1>Shopping Cart</h1>

        {cartItems.length > 0 && (
          <p>
            {getCartCount()} item{getCartCount() > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ======================================================
          IF THE CART IS EMPTY
          Show a friendly message.

          OTHERWISE
          Show the pizzas and the order summary.
      ====================================================== */}
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>🛒 Your cart is empty</h2>

          <p>Looks like you haven't added any delicious pizzas yet.</p>

          <Link to="/menu">
            <button className="browse-menu-btn">Browse Menu</button>
          </Link>
        </div>
      ) : (
        <>
          {/* ==========================================
              DISPLAY EVERY PIZZA INSIDE THE CART
          ========================================== */}
          {cartItems.map((pizza) => (
            <div key={pizza.id} className="cart-item">
              {/* Pizza Image */}
              <img src={pizza.image} alt={pizza.name} className="cart-image" />

              {/* Pizza Information */}
              <div className="cart-details">
                <h3>{pizza.name}</h3>

                <p>{pizza.description}</p>

                <h4>R {pizza.price}</h4>

                {/* Quantity controls */}
                <div className="cart-actions">
                  <div className="quantity-controls">
                    <button onClick={() => decreaseQuantity(pizza.id)}>
                      −
                    </button>

                    <span>{pizza.quantity}</span>

                    <button onClick={() => increaseQuantity(pizza.id)}>
                      +
                    </button>
                  </div>

                  {/* Remove item */}
                  <button
                    className="remove-link"
                    onClick={() => removeFromCart(pizza.id)}
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* ==========================================
              ORDER SUMMARY
          ========================================== */}
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Items</span>
              <span>{getCartCount()}</span>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>R {getCartTotal().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <span>FREE</span>
            </div>

            <hr />

            <div className="summary-row total">
              <span>Total</span>
              <span>R {getCartTotal().toFixed(2)}</span>
            </div>

            {/* Checkout button */}
            <Link to="/checkout">
              <button className="checkout-btn">Proceed to Checkout</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
