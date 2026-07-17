// Import styles for the Footer component
import "./Footer.css";

// Reusable footer displayed across the application
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Company name */}
        <h3>Pizza Delivery</h3>

        {/* Copyright */}
        <p>© {new Date().getFullYear()} Pizza Delivery. All rights reserved.</p>
      </div>
    </footer>
  );
}

// Export the component
export default Footer;
