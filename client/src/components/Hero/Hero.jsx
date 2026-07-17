// Import the reusable Button component
import Button from "../Button/Button";

// Import styles for this component
import "./Hero.css";

// Hero section displayed on the Home page
function Hero() {
  return (
    <section className="hero">
      {/* Left side of the hero section */}
      <div className="hero-content">
        <h1>Delicious Pizza Delivered Fresh</h1>

        <p>
          Order your favourite pizza anytime and have it delivered straight to
          your doorstep.
        </p>

        {/* Call-to-action button */}
        <Button text="Order Now" onClick={() => alert("Opening menu...")} />
      </div>
    </section>
  );
}

// Export the Hero component
export default Hero;
