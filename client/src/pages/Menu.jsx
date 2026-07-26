// Import React state
import { useState } from "react";

// Import pizza data
import pizzas from "../data/pizzas";

// Import Pizza Card
import PizzaCard from "../components/PizzaCard/PizzaCard";

// Import page styling
import "./Menu.css";

// Menu Page
function Menu() {
  // Stores the search text entered by the user
  const [search, setSearch] = useState("");

  // Stores the selected pizza category
  const [category, setCategory] = useState("All");

  // Stores the selected sorting option
  const [sortOption, setSortOption] = useState("default");

  // Filter pizzas by search text and category
  const filteredPizzas = pizzas.filter((pizza) => {
    const matchesSearch = pizza.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory = category === "All" || pizza.category === category;

    return matchesSearch && matchesCategory;
  });

  // Create a copy before sorting
  const sortedPizzas = [...filteredPizzas];

  // Sort pizzas based on selected option
  switch (sortOption) {
    case "price-low":
      sortedPizzas.sort((a, b) => a.price - b.price);
      break;

    case "price-high":
      sortedPizzas.sort((a, b) => b.price - a.price);
      break;

    case "name-az":
      sortedPizzas.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case "name-za":
      sortedPizzas.sort((a, b) => b.name.localeCompare(a.name));
      break;

    case "rating":
      sortedPizzas.sort((a, b) => b.rating - a.rating);
      break;

    default:
      break;
  }

  return (
    <div className="menu-page">
      {/* ==========================
          PAGE HEADER
      ========================== */}
      <h1>Pizza Menu</h1>

      <p>Choose from our delicious selection.</p>

      {/* ==========================
    SEARCH + SORT TOOLBAR
========================== */}
      <div className="menu-toolbar">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search pizzas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />

        {/* Sort Dropdown */}
        <select
          className="sort-dropdown"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Sort By</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="name-az">Name: A → Z</option>
          <option value="name-za">Name: Z → A</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* ==========================
          CATEGORY FILTERS
      ========================== */}
      <div className="category-buttons">
        <button onClick={() => setCategory("All")}>All</button>

        <button onClick={() => setCategory("Beef")}>Beef</button>

        <button onClick={() => setCategory("Pork")}>Pork</button>

        <button onClick={() => setCategory("Chicken")}>Chicken</button>

        <button onClick={() => setCategory("Vegetarian")}>Vegetarian</button>

        <button onClick={() => setCategory("Seafood")}>Seafood</button>
      </div>

      {/* ==========================
          PIZZA GRID
      ========================== */}
      <div className="pizza-grid">
        {sortedPizzas.map((pizza) => (
          <PizzaCard key={pizza.id} {...pizza} />
        ))}
      </div>
    </div>
  );
}

export default Menu;
