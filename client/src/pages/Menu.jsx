import { useEffect, useMemo, useState } from "react";

import PizzaCard from "../components/PizzaCard/PizzaCard";

import { getPizzas } from "../services/pizzaService";

import "./Menu.css";

function Menu() {
  const [pizzas, setPizzas] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [sortOption, setSortOption] = useState("default");

  // ===========================================================
  // LOAD REAL MONGODB PIZZAS
  // ===========================================================

  useEffect(() => {
    const loadPizzas = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getPizzas();

        setPizzas(result.pizzas || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "We could not load the menu.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPizzas();
  }, []);

  // ===========================================================
  // CATEGORIES
  // ===========================================================

  const categories = useMemo(() => {
    const databaseCategories = pizzas
      .map((pizza) => pizza.category)
      .filter(Boolean);

    return ["All", ...new Set(databaseCategories)];
  }, [pizzas]);

  // ===========================================================
  // FILTER + SORT
  // ===========================================================

  const visiblePizzas = useMemo(() => {
    const filtered = pizzas.filter((pizza) => {
      const matchesSearch = pizza.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory = category === "All" || pizza.category === category;

      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered];

    switch (sortOption) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;

      case "name-az":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "name-za":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;

      default:
        break;
    }

    return sorted;
  }, [pizzas, search, category, sortOption]);

  return (
    <div className="menu-page">
      <section className="menu-hero">
        <span className="menu-eyebrow">Our Menu</span>

        <h1>Find your next favourite pizza.</h1>

        <p>Freshly prepared favourites powered by our live kitchen menu.</p>
      </section>

      <section className="menu-control-card">
        <div className="menu-toolbar">
          <input
            type="search"
            placeholder="Search pizzas..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="search-bar"
          />

          <select
            className="sort-dropdown"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="default">Sort menu</option>

            <option value="price-low">Price: Low → High</option>

            <option value="price-high">Price: High → Low</option>

            <option value="name-az">Name: A → Z</option>

            <option value="name-za">Name: Z → A</option>

            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <div className="category-buttons">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="menu-state">
          <div className="menu-loader" />
          <h3>Preparing the menu...</h3>
        </div>
      )}

      {!loading && error && (
        <div className="menu-state error">
          <span>🍕</span>
          <h3>Menu unavailable</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && visiblePizzas.length === 0 && (
        <div className="menu-state">
          <span>🔎</span>
          <h3>No pizzas found</h3>
          <p>Try another search or category.</p>
        </div>
      )}

      {!loading && !error && visiblePizzas.length > 0 && (
        <>
          <div className="menu-results">
            <span>
              {visiblePizzas.length} pizza
              {visiblePizzas.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="pizza-grid">
            {visiblePizzas.map((pizza) => (
              <PizzaCard key={pizza._id} {...pizza} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Menu;
