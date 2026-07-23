// Import the reusable Button component
import Button from "../components/Button/Button";

// Import the CSS for the Checkout page
import "./Checkout.css";

// Checkout page
function Checkout() {
  return (
    <div className="checkout-page">
      {/* ==========================================
          PAGE HEADER
      ========================================== */}
      <div className="checkout-header">
        <h1>Checkout</h1>

        <p>Complete your delicious pizza order.</p>
      </div>

      {/* ==========================================
          DELIVERY INFORMATION
      ========================================== */}
      <section className="checkout-card">
        <h2>Delivery Information</h2>

        <input type="text" placeholder="Full Name" />

        <input type="tel" placeholder="Phone Number" />

        <textarea placeholder="Delivery Address" rows="4"></textarea>
      </section>

      {/* ==========================================
          PAYMENT METHOD
      ========================================== */}
      <section className="checkout-card">
        <h2>Payment Method</h2>

        <label>
          <input type="radio" name="payment" defaultChecked />
          Cash on Delivery
        </label>

        <label>
          <input type="radio" name="payment" />
          Credit / Debit Card
        </label>
      </section>

      {/* ==========================================
          PLACE ORDER BUTTON
      ========================================== */}
      <Button text="🍕 Place Order" size="large" />
    </div>
  );
}

export default Checkout;
