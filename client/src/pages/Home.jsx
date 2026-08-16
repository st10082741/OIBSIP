import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import PizzaCard from "../components/PizzaCard/PizzaCard";

import { getFeaturedPizzas, getPopularPizzas } from "../services/pizzaService";

import { getMyOrders } from "../services/orderService";

import { useAuth } from "../context/AuthContext";

import "./Home.css";

function Home() {
  const { user } = useAuth();

  const [featuredPizzas, setFeaturedPizzas] = useState([]);

  const [popularPizzas, setPopularPizzas] = useState([]);

  const [currentOrder, setCurrentOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ===========================================================
  // LOAD DASHBOARD DATA
  // ===========================================================

  useEffect(() => {
    let intervalId;

    const getLatestPaidOrder = async () => {
      const result = await getMyOrders();

      const paidOrders = (result.orders || []).filter(
        (order) => order.paymentStatus === "Paid",
      );

      return paidOrders[0] || null;
    };

    const refreshCurrentOrder = async () => {
      try {
        const latestPaidOrder = await getLatestPaidOrder();

        setCurrentOrder(latestPaidOrder);
      } catch {
        // Polling errors must not break the dashboard.
      }
    };

    const loadDashboard = async () => {
      try {
        setError("");

        const [featuredResult, popularResult, latestPaidOrder] =
          await Promise.all([
            getFeaturedPizzas(),
            getPopularPizzas(),
            getLatestPaidOrder(),
          ]);

        setFeaturedPizzas(featuredResult.pizzas || []);
        setPopularPizzas(popularResult.pizzas || []);
        setCurrentOrder(latestPaidOrder);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Some dashboard information could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    // Regular polling while dashboard is active.
    intervalId = setInterval(refreshCurrentOrder, 5000);

    /*
  Browsers may throttle timers in background tabs.

  Refresh immediately when the customer returns
  to the tab/window so no manual refresh is required.
  */
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCurrentOrder();
      }
    };

    window.addEventListener("focus", refreshCurrentOrder);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);

      window.removeEventListener("focus", refreshCurrentOrder);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Pizza lover";

  const statusSteps = ["Order Received", "In Kitchen", "Sent to Delivery"];

  const currentStatusIndex = currentOrder
    ? statusSteps.indexOf(currentOrder.status)
    : -1;

  return (
    <div className="home-dashboard">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="dashboard-eyebrow">Welcome back, {firstName}</span>

          <h1>
            Great pizza,
            <span> built around you.</span>
          </h1>

          <p>
            Choose one of our kitchen favourites or build your own pizza exactly
            the way you want it.
          </p>

          <div className="hero-actions">
            <Link to="/menu" className="hero-primary-action">
              Explore Menu
            </Link>

            <Link to="/builder" className="hero-secondary-action">
              Build Your Pizza
            </Link>
          </div>

          <div className="hero-benefits">
            <span>✓ Fresh ingredients</span>
            <span>✓ Live order tracking</span>
            <span>✓ Secure checkout</span>
          </div>
        </div>

        <div className="dashboard-hero-art">
          <div className="pizza-orbit pizza-orbit-one">🍅</div>

          <div className="pizza-orbit pizza-orbit-two">🧀</div>

          <div className="pizza-orbit pizza-orbit-three">🌿</div>

          <div className="hero-pizza">🍕</div>

          <span className="hero-art-label">Made fresh for you</span>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && <div className="dashboard-notice">{error}</div>}

      {/* =====================================================
          CURRENT ORDER TRACKER
      ===================================================== */}

      {currentOrder && currentOrder.paymentStatus === "Paid" && (
        <section className="current-order-card">
          <div className="current-order-header">
            <div>
              <span className="section-eyebrow">Live Order</span>

              <h2>Your pizza is on the move.</h2>

              <p>Order #{currentOrder._id.slice(-6).toUpperCase()}</p>
            </div>

            <Link to="/orders" className="view-order-link">
              View details →
            </Link>
          </div>

          <div className="order-status-track">
            {statusSteps.map((step, index) => {
              const completed = index <= currentStatusIndex;

              return (
                <div
                  key={step}
                  className={`status-step ${completed ? "completed" : ""}`}
                >
                  <div className="status-marker">{index + 1}</div>

                  <strong>{step}</strong>
                </div>
              );
            })}

            <div className="status-line" />
            <div
              className="status-line-progress"
              style={{
                width:
                  currentStatusIndex <= 0
                    ? "0%"
                    : currentStatusIndex === 1
                      ? "50%"
                      : "100%",
              }}
            />
          </div>

          <div className="order-summary-strip">
            <span>
              {currentOrder.totalQuantity} item
              {currentOrder.totalQuantity !== 1 ? "s" : ""}
            </span>

            <span>R {Number(currentOrder.totalAmount).toFixed(2)}</span>

            <strong>{currentOrder.status}</strong>
          </div>
        </section>
      )}

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="dashboard-actions">
        <Link to="/builder" className="dashboard-action-card action-builder">
          <span className="action-icon">🧑‍🍳</span>

          <div>
            <span className="section-eyebrow">Make it yours</span>

            <h3>Build Your Own Pizza</h3>

            <p>Pick your base, sauce, cheese and favourite vegetables.</p>
          </div>

          <span className="action-arrow">→</span>
        </Link>

        <Link to="/orders" className="dashboard-action-card">
          <span className="action-icon">📦</span>

          <div>
            <span className="section-eyebrow">Order history</span>

            <h3>Track Your Orders</h3>

            <p>Follow current deliveries and review previous purchases.</p>
          </div>

          <span className="action-arrow">→</span>
        </Link>
      </section>

      {/* =====================================================
          FEATURED PIZZAS
      ===================================================== */}

      <section className="dashboard-pizza-section">
        <div className="section-heading-row">
          <div>
            <span className="section-eyebrow">Kitchen favourites</span>

            <h2>Featured pizzas</h2>

            <p>Some of our most-loved choices, prepared fresh.</p>
          </div>

          <Link to="/menu">View full menu →</Link>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="dashboard-spinner" />
            Loading fresh pizzas...
          </div>
        ) : (
          <div className="dashboard-pizza-grid">
            {featuredPizzas.slice(0, 3).map((pizza) => (
              <PizzaCard key={pizza._id} {...pizza} />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          POPULAR PIZZAS
      ===================================================== */}

      {!loading && popularPizzas.length > 0 && (
        <section className="dashboard-pizza-section">
          <div className="section-heading-row">
            <div>
              <span className="section-eyebrow">Customer favourites</span>

              <h2>Popular right now</h2>

              <p>Tried, tested and loved by pizza fans.</p>
            </div>
          </div>

          <div className="dashboard-pizza-grid">
            {popularPizzas.slice(0, 3).map((pizza) => (
              <PizzaCard key={pizza._id} {...pizza} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
