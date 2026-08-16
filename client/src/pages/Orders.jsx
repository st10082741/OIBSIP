import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyOrders } from "../services/orderService";
import "./Orders.css";

import { toast } from "react-toastify";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD CUSTOMER ORDERS
  // ============================================================

  useEffect(() => {
    let intervalId;

    const loadOrders = async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const result = await getMyOrders();
        const latestOrders = result.orders || [];

        setOrders((previousOrders) => {
          /*
        Compare the previous status with the newly fetched status.

        If an existing order changed status, notify the customer.
        */

          previousOrders.forEach((previousOrder) => {
            const updatedOrder = latestOrders.find(
              (order) => order._id === previousOrder._id,
            );

            if (
              updatedOrder &&
              previousOrder.status !== updatedOrder.status &&
              updatedOrder.paymentStatus === "Paid"
            ) {
              if (updatedOrder.status === "In Kitchen") {
                toast.info(
                  `🍕 Order #${updatedOrder._id
                    .slice(-6)
                    .toUpperCase()} is now In Kitchen.`,
                );
              }

              if (updatedOrder.status === "Sent to Delivery") {
                toast.success(
                  `🛵 Order #${updatedOrder._id
                    .slice(-6)
                    .toUpperCase()} has been sent to delivery.`,
                );
              }
            }
          });

          return latestOrders;
        });
      } catch (requestError) {
        /*
      Only show the full error during the initial load.

      A temporary polling failure should not destroy
      the existing Orders page.
      */

        if (showLoader) {
          setError(
            requestError.response?.data?.message ||
              "Your orders could not be loaded.",
          );
        }
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    };

    // Initial page load.
    loadOrders(true);

    // Refresh order statuses every 5 seconds.
    intervalId = setInterval(() => {
      loadOrders(false);
    }, 5000);

    /*
  Refresh immediately when the customer returns to this tab.

  Browsers may throttle timers while tabs are in the background.
  */
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadOrders(false);
      }
    };

    const handleFocus = () => {
      loadOrders(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatPrice = (amount) => {
    return `R ${Number(amount || 0).toFixed(2)}`;
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================================
  // ORDER PROGRESS
  // ============================================================

  const getStatusStep = (status) => {
    if (status === "Sent to Delivery") return 3;
    if (status === "In Kitchen") return 2;

    return 1;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="orders-page">
        <div className="orders-loading">
          <div className="orders-spinner"></div>
          <h2>Loading your orders...</h2>
          <p>We're getting your pizza history ready.</p>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <main className="orders-page">
        <div className="orders-state-card">
          <span className="orders-state-icon">!</span>

          <h2>We couldn't load your orders.</h2>

          <p>{error}</p>

          <button
            type="button"
            className="orders-primary-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // ============================================================
  // EMPTY ORDER HISTORY
  // ============================================================

  if (orders.length === 0) {
    return (
      <main className="orders-page">
        <div className="orders-state-card">
          <div className="orders-empty-icon">🍕</div>

          <span className="orders-eyebrow">Your orders</span>

          <h1>No pizza orders yet.</h1>

          <p>
            Your future orders will appear here together with their payment and
            delivery progress.
          </p>

          <Link to="/menu" className="orders-primary-button">
            Explore the Menu →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <section className="orders-header">
        <div>
          <span className="orders-eyebrow">Order history</span>

          <h1>Your pizza journey.</h1>

          <p>
            Track active orders and revisit everything you've ordered before.
          </p>
        </div>

        <div className="orders-count">
          <strong>{orders.length}</strong>
          <span>{orders.length === 1 ? "Order" : "Orders"}</span>
        </div>
      </section>

      {/* ======================================================
          ORDER LIST
      ====================================================== */}

      <section className="orders-list">
        {orders.map((order) => {
          const statusStep = getStatusStep(order.status);

          return (
            <article className="order-card" key={order._id}>
              {/* =================================================
                  ORDER TOP
              ================================================= */}

              <div className="order-card-header">
                <div>
                  <span className="order-number-label">ORDER</span>

                  <h2>#{order._id.slice(-6).toUpperCase()}</h2>

                  <p>{formatDate(order.createdAt)}</p>
                </div>

                <div className="order-header-right">
                  <span
                    className={`payment-badge ${order.paymentStatus.toLowerCase()}`}
                  >
                    {order.paymentStatus}
                  </span>

                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>
              </div>

              {/* =================================================
                  TRACKING
              ================================================= */}

              {order.paymentStatus === "Paid" && (
                <div className="order-tracking">
                  <div
                    className={`tracking-step ${
                      statusStep >= 1 ? "active" : ""
                    }`}
                  >
                    <div className="tracking-circle">✓</div>

                    <span>Order Received</span>
                  </div>

                  <div
                    className={`tracking-line ${
                      statusStep >= 2 ? "active" : ""
                    }`}
                  ></div>

                  <div
                    className={`tracking-step ${
                      statusStep >= 2 ? "active" : ""
                    }`}
                  >
                    <div className="tracking-circle">
                      {statusStep >= 2 ? "✓" : "2"}
                    </div>

                    <span>In Kitchen</span>
                  </div>

                  <div
                    className={`tracking-line ${
                      statusStep >= 3 ? "active" : ""
                    }`}
                  ></div>

                  <div
                    className={`tracking-step ${
                      statusStep >= 3 ? "active" : ""
                    }`}
                  >
                    <div className="tracking-circle">
                      {statusStep >= 3 ? "✓" : "3"}
                    </div>

                    <span>Sent to Delivery</span>
                  </div>
                </div>
              )}

              {/* =================================================
                  ORDER ITEMS
              ================================================= */}

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={`${order._id}-${index}`}>
                    <div className="order-item-icon">
                      {item.itemType === "custom" ? "🧑‍🍳" : "🍕"}
                    </div>

                    <div className="order-item-information">
                      <strong>
                        {item.itemType === "catalog"
                          ? item.pizza?.name || "Pizza"
                          : "Your Custom Pizza"}
                      </strong>

                      {item.itemType === "custom" && item.customPizza && (
                        <p>
                          {[
                            item.customPizza.base?.name,
                            item.customPizza.sauce?.name,
                            item.customPizza.cheese?.name,
                            ...(item.customPizza.vegetables || []).map(
                              (vegetable) => vegetable.name,
                            ),
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}

                      <span>
                        Qty {item.quantity} × {formatPrice(item.unitPrice)}
                      </span>
                    </div>

                    <strong className="order-item-subtotal">
                      {formatPrice(item.subtotal)}
                    </strong>
                  </div>
                ))}
              </div>

              {/* =================================================
                  ORDER FOOTER
              ================================================= */}

              <div className="order-card-footer">
                <div>
                  <span>Delivering to</span>

                  <strong>
                    {order.deliveryAddress?.street},{" "}
                    {order.deliveryAddress?.city}
                  </strong>
                </div>

                <div className="order-total">
                  <span>Order total</span>

                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default Orders;
