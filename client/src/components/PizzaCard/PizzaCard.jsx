// Import the reusable Button component
import Button from "../Button/Button";

// Import the component styles
import "./PizzaCard.css";

// Reusable card used to display a pizza
function PizzaCard({ image, name, description, price, rating, popular }) {
  return (
    <div className="pizza-card">
      {/* Pizza image container */}
      <div className="pizza-image-container">
        {/* Show badge only if pizza is popular */}
        {popular && <span className="popular-badge">🔥 Popular</span>}
        {/* Favourite button */}
        <button className="favorite-btn">❤️</button>
        {/* Pizza image */}
        <img src={image} alt={name} className="pizza-image" />
      </div>

      {/* Pizza information */}
      <div className="pizza-content">
        <h3>{name}</h3>
        <p className="rating">⭐ {rating}</p>
        <p>{description}</p>

        {/* Card footer with price and add to cart button */}
        <div className="card-footer">
          <h4>R {price}</h4>

          <Button
            text="Add to Cart"
            onClick={() => alert(`${name} added to cart!`)}
          />
        </div>
      </div>
    </div>
  );
}

export default PizzaCard;
