// Import the CSS file that styles this Button component
import "./Button.css";

// Define the reusable Button component that takes in text and an onClick handler as props
function Button({ text, onClick }) {
  return (
    // Render a button element with the provided text and onClick handler
    <button
      // Apply the CSS class for styling
      className="button"
      // Attach the onClick handler passed as a prop to the button
      onClick={onClick}
    >
      {text}
    </button>
  );
}

// Export the component so other files can use it
export default Button;
