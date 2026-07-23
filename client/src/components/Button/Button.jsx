// Import the CSS file that styles this Button component
import "./Button.css";

// Reusable Button Component
function Button({
  text,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
}) {
  return (
    <button
      type={type}
      className={`button ${variant} ${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

// Export the component
export default Button;
