// Home page displayed when users first visit the website.

// Import the Hero component to display the hero section.
import Hero from "../components/Hero/Hero";
// Import the PizzaCard component
import PizzaCard from "../components/PizzaCard/PizzaCard";
import "./Home.css";
// Import the temporary pizza data
import pizzas from "../data/pizzas";
function Home() {
  return (
    // Container for the Home page.
    <div className="home">
      {/* Display the Hero section */}
      <Hero />
      {/* Featured pizzas section */}
      <section className="featured-pizzas">
        <h2>Featured Pizzas</h2>

        <div className="pizza-grid">
          {pizzas.map((pizza) => (
            <PizzaCard
              key={pizza.id}
              image={pizza.image}
              name={pizza.name}
              description={pizza.description}
              price={pizza.price}
              rating={pizza.rating}
              popular={pizza.popular}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// Make this component available to other files.
export default Home;
