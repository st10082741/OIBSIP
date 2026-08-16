import Button from "../Button/Button";

import "./PizzaCard.css";

import { useContext } from "react";

import { CartContext } from "../../context/CartContext";

import { getImageUrl } from "../../utils/imageUrl";

function PizzaCard({
  _id,
  id,
  image,
  name,
  description,
  price,
  rating,
  popular,
  category,
  available = true,
}) {
  const { addToCart } = useContext(CartContext);

  const pizzaId = _id || id;

  const imageUrl = getImageUrl(image);

  return (
    <article className="pizza-card">
      <div className="pizza-image-container">
        {popular && <span className="popular-badge">🔥 Popular</span>}

        <span className="pizza-category-badge">{category}</span>

        {imageUrl ? (
          <img src={imageUrl} alt={name} className="pizza-image" />
        ) : (
          <div className="pizza-image-placeholder">
            <span>🍕</span>

            <small>Freshly prepared</small>
          </div>
        )}
      </div>

      <div className="pizza-content">
        <div className="pizza-title-row">
          <h3>{name}</h3>

          <span className="rating">⭐ {rating || "New"}</span>
        </div>

        <p className="pizza-description">{description}</p>

        <div className="card-footer">
          <div>
            <span className="price-label">From</span>

            <h4>R {Number(price).toFixed(2)}</h4>
          </div>

          <Button
            text={available ? "Add to Cart" : "Unavailable"}
            disabled={!available}
            onClick={() =>
              addToCart({
                id: pizzaId,
                _id: pizzaId,
                image,
                name,
                description,
                price,
                rating,
                popular,
                category,
                available,
              })
            }
          />
        </div>
      </div>
    </article>
  );
}

export default PizzaCard;
