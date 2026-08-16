import { useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";

import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../services/adminOrderService";

import "./AdminDashboard.css";

function AdminDashboard() {
  const { admin } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  // ===========================================================
  // LOAD ORDERS
  // ===========================================================

  const loadOrders = async () => {
    try {
      setError("");

      const result = await getAdminOrders();

      setOrders(result.orders || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load customer orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    /*
    Refresh incoming orders automatically.

    This also lets the admin dashboard stay current
    while customers place new orders.
    */
    const intervalId = setInterval(loadOrders, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // ===========================================================
  // SUMMARY
  // ===========================================================

  const summary = useMemo(() => {
    return {
      total: orders.length,

      paid: orders.filter((order) => order.paymentStatus === "Paid").length,

      kitchen: orders.filter((order) => order.status === "In Kitchen").length,

      delivery: orders.filter((order) => order.status === "Sent to Delivery")
        .length,
    };
  }, [orders]);

  // ===========================================================
  // UPDATE STATUS
  // ===========================================================

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingId(orderId);

      const result = await updateAdminOrderStatus(orderId, status);

      setOrders((current) =>
        current.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: result.order.status,
                updatedAt: result.order.updatedAt,
              }
            : order,
        ),
      );

      toast.success(`Order updated to ${status}.`);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Order status could not be updated.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  const formatMoney = (value) => `R ${Number(value || 0).toFixed(2)}`;

  const formatDate = (value) =>
    new Date(value).toLocaleString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main className="admin-dashboard">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Operations Dashboard</span>

          <h1>Good to see you, {admin?.name?.split(" ")[0] || "Admin"}.</h1>

          <p>
            Manage incoming orders and move pizzas from the kitchen to delivery.
          </p>
        </div>
      </header>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="admin-summary-grid">
        <div className="admin-stat-card">
          <span>📦</span>

          <div>
            <small>Total Orders</small>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <span>💳</span>

          <div>
            <small>Paid Orders</small>
            <strong>{summary.paid}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <span>👨‍🍳</span>

          <div>
            <small>In Kitchen</small>
            <strong>{summary.kitchen}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <span>🛵</span>

          <div>
            <small>Out for Delivery</small>
            <strong>{summary.delivery}</strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          ORDER MANAGEMENT
      ===================================================== */}

      <section className="admin-orders-panel">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">Live Operations</span>

            <h2>Incoming Orders</h2>

            <p>
              Paid orders can be moved through the required delivery workflow.
            </p>
          </div>

          <button type="button" className="admin-refresh" onClick={loadOrders}>
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="admin-state">
            <div className="admin-spinner" />
            Loading orders...
          </div>
        )}

        {!loading && error && <div className="admin-error">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="admin-state">
            <span>🍕</span>
            <h3>No incoming orders yet.</h3>
          </div>
        )}

        {!loading &&
          !error &&
          orders.map((order) => (
            <article className="admin-order-card" key={order._id}>
              <div className="admin-order-top">
                <div>
                  <span className="admin-order-id">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>

                  <h3>{order.user?.name || "Customer"}</h3>

                  <p>{order.user?.email}</p>
                </div>

                <div className="admin-order-price">
                  <span
                    className={`admin-payment-badge ${order.paymentStatus.toLowerCase()}`}
                  >
                    {order.paymentStatus}
                  </span>

                  <strong>{formatMoney(order.totalAmount)}</strong>
                </div>
              </div>

              <div className="admin-order-meta">
                <div>
                  <span>Placed</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>

                <div>
                  <span>Quantity</span>
                  <strong>
                    {order.totalQuantity} item
                    {order.totalQuantity !== 1 ? "s" : ""}
                  </strong>
                </div>

                <div>
                  <span>Current Status</span>
                  <strong>{order.status}</strong>
                </div>
              </div>

              <div className="admin-order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="admin-order-item">
                    <span>{item.itemType === "catalog" ? "🍕" : "🧑‍🍳"}</span>

                    <div>
                      <strong>
                        {item.itemType === "catalog"
                          ? item.pizza?.name
                          : "Custom Pizza"}
                      </strong>

                      <small>
                        Qty {item.quantity} · {formatMoney(item.subtotal)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-order-bottom">
                <div>
                  <span>Deliver to</span>

                  <strong>
                    {order.deliveryAddress?.street},{" "}
                    {order.deliveryAddress?.city}
                  </strong>
                </div>

                <select
                  value={order.status}
                  disabled={
                    order.paymentStatus !== "Paid" || updatingId === order._id
                  }
                  onChange={(event) =>
                    handleStatusChange(order._id, event.target.value)
                  }
                >
                  <option value="Order Received">Order Received</option>

                  <option value="In Kitchen">In Kitchen</option>

                  <option value="Sent to Delivery">Sent to Delivery</option>
                </select>
              </div>
            </article>
          ))}
      </section>
    </main>
  );
}

export default AdminDashboard;
