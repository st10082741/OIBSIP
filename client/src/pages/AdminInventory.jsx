import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  adjustInventoryStock,
  getAdminInventory,
  updateInventoryItem,
} from "../services/adminInventoryService";

import "./AdminInventory.css";

const categoryMap = {
  "Pizza Base": "pizza-base",
  Sauce: "sauce",
  Cheese: "cheese",
  Vegetable: "vegetable",
};

function AdminInventory() {
  const [inventory, setInventory] = useState(null);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  /*
  Stores temporary editable values for each inventory item.

  Example:

  {
    "item-id-1": {
      stock: "25",
      lowStockThreshold: "10"
    }
  }
  */
  const [editableValues, setEditableValues] = useState({});

  // ===========================================================
  // LOAD INVENTORY
  // ===========================================================

  const loadInventory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const result = await getAdminInventory();

      setInventory(result.inventory);
      setSummary(result.summary);

      const allItems = [
        ...(result.inventory?.pizzaBases || []),
        ...(result.inventory?.sauces || []),
        ...(result.inventory?.cheeses || []),
        ...(result.inventory?.vegetables || []),
      ];

      const nextEditableValues = {};

      allItems.forEach((item) => {
        nextEditableValues[item.id] = {
          stock: String(item.stock),
          lowStockThreshold: String(item.lowStockThreshold),
        };
      });

      setEditableValues(nextEditableValues);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Inventory could not be loaded.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // ===========================================================
  // QUICK STOCK ADJUSTMENT
  // ===========================================================

  const adjustStock = async (item, amount) => {
    try {
      setUpdatingId(item.id);

      await adjustInventoryStock(categoryMap[item.category], item.id, amount);

      await loadInventory();

      toast.success(`${item.name} stock updated successfully.`);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Stock could not be updated.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  // ===========================================================
  // AVAILABILITY
  // ===========================================================

  const toggleAvailability = async (item) => {
    try {
      setUpdatingId(item.id);

      await updateInventoryItem(categoryMap[item.category], item.id, {
        available: !item.available,
      });

      await loadInventory();

      toast.success(`${item.name} availability updated.`);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Availability could not be updated.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  // ===========================================================
  // EDITABLE INPUT
  // ===========================================================

  const handleEditableChange = (itemId, field, value) => {
    setEditableValues((current) => ({
      ...current,

      [itemId]: {
        ...current[itemId],

        [field]: value,
      },
    }));
  };

  // ===========================================================
  // SAVE EXACT STOCK + LOW-STOCK THRESHOLD
  // ===========================================================

  const saveInventorySettings = async (item) => {
    const values = editableValues[item.id];

    if (!values) {
      return;
    }

    const stock = Number(values.stock);

    const lowStockThreshold = Number(values.lowStockThreshold);

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      toast.error(
        "Stock must be a whole number greater than or equal to zero.",
      );

      return;
    }

    if (
      !Number.isFinite(lowStockThreshold) ||
      lowStockThreshold < 0 ||
      !Number.isInteger(lowStockThreshold)
    ) {
      toast.error(
        "Low-stock threshold must be a whole number greater than or equal to zero.",
      );

      return;
    }

    try {
      setUpdatingId(item.id);

      await updateInventoryItem(categoryMap[item.category], item.id, {
        stock,
        lowStockThreshold,
      });

      await loadInventory();

      toast.success(`${item.name} inventory settings saved.`);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Inventory settings could not be saved.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  // ===========================================================
  // CATEGORY RENDERER
  // ===========================================================

  const renderItems = (title, items = []) => (
    <section className="inventory-section">
      <div className="inventory-section-heading">
        <div>
          <span>Inventory category</span>

          <h2>{title}</h2>
        </div>

        <strong>
          {items.length} item
          {items.length !== 1 ? "s" : ""}
        </strong>
      </div>

      <div className="inventory-grid">
        {items.map((item) => {
          const editable = editableValues[item.id] || {
            stock: String(item.stock),
            lowStockThreshold: String(item.lowStockThreshold),
          };

          return (
            <article
              className={`inventory-card ${item.isLowStock ? "low-stock" : ""}`}
              key={item.id}
            >
              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="inventory-card-top">
                <div>
                  <h3>{item.name}</h3>

                  <span>{item.available ? "Available" : "Unavailable"}</span>
                </div>

                {item.isLowStock && (
                  <div className="low-stock-badge">⚠ Low Stock</div>
                )}
              </div>

              {/* =================================================
                  CURRENT STOCK
              ================================================= */}

              <div className="inventory-stock">
                <strong>{item.stock}</strong>

                <span>{item.unit}</span>
              </div>

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="inventory-details">
                <div>
                  <span>Price</span>

                  <strong>R {Number(item.price).toFixed(2)}</strong>
                </div>

                <div>
                  <span>Alert below</span>

                  <strong>
                    {item.lowStockThreshold} {item.unit}
                  </strong>
                </div>
              </div>

              {/* =================================================
                  QUICK STOCK BUTTONS
              ================================================= */}

              <div className="inventory-actions">
                <button
                  type="button"
                  disabled={updatingId === item.id}
                  onClick={() => adjustStock(item, -1)}
                >
                  −1
                </button>

                <button
                  type="button"
                  disabled={updatingId === item.id}
                  onClick={() => adjustStock(item, 10)}
                >
                  +10
                </button>

                <button
                  type="button"
                  disabled={updatingId === item.id}
                  onClick={() => adjustStock(item, 20)}
                >
                  +20
                </button>
              </div>

              {/* =================================================
                  EXACT STOCK + CONFIGURABLE THRESHOLD
              ================================================= */}

              <div className="inventory-settings">
                <div className="inventory-setting-field">
                  <label htmlFor={`stock-${item.id}`}>Exact stock</label>

                  <input
                    id={`stock-${item.id}`}
                    type="number"
                    min="0"
                    step="1"
                    value={editable.stock}
                    disabled={updatingId === item.id}
                    onChange={(event) =>
                      handleEditableChange(item.id, "stock", event.target.value)
                    }
                  />
                </div>

                <div className="inventory-setting-field">
                  <label htmlFor={`threshold-${item.id}`}>
                    Low-stock alert
                  </label>

                  <input
                    id={`threshold-${item.id}`}
                    type="number"
                    min="0"
                    step="1"
                    value={editable.lowStockThreshold}
                    disabled={updatingId === item.id}
                    onChange={(event) =>
                      handleEditableChange(
                        item.id,
                        "lowStockThreshold",
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <button
                type="button"
                className="inventory-save-settings"
                disabled={updatingId === item.id}
                onClick={() => saveInventorySettings(item)}
              >
                {updatingId === item.id ? "Saving..." : "Save stock settings"}
              </button>

              {/* =================================================
                  AVAILABILITY
              ================================================= */}

              <button
                type="button"
                className={`inventory-availability ${
                  item.available ? "" : "enable"
                }`}
                disabled={updatingId === item.id}
                onClick={() => toggleAvailability(item)}
              >
                {item.available ? "Disable ingredient" : "Enable ingredient"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );

  // ===========================================================
  // LOADING
  // ===========================================================

  if (loading) {
    return (
      <main className="admin-inventory-page">
        <div className="inventory-state">
          <div className="inventory-spinner" />
          Loading inventory...
        </div>
      </main>
    );
  }

  // ===========================================================
  // PAGE
  // ===========================================================

  return (
    <main className="admin-inventory-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="inventory-header">
        <div>
          <span className="inventory-eyebrow">Kitchen Inventory</span>

          <h1>Know exactly what’s in stock.</h1>

          <p>
            Monitor ingredients, update exact quantities, configure low-stock
            alerts and control ingredient availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadInventory(true)}
          disabled={refreshing}
        >
          {refreshing ? "↻ Refreshing..." : "↻ Refresh inventory"}
        </button>
      </header>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && <div className="inventory-error">{error}</div>}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      {summary && (
        <section className="inventory-summary">
          <div>
            <span>Total ingredients</span>

            <strong>{summary.totalItems}</strong>
          </div>

          <div>
            <span>Low-stock alerts</span>

            <strong className="danger">{summary.lowStockItems}</strong>
          </div>

          <div>
            <span>Pizza bases</span>

            <strong>{summary.totalPizzaBases}</strong>
          </div>

          <div>
            <span>Vegetables</span>

            <strong>{summary.totalVegetables}</strong>
          </div>
        </section>
      )}

      {/* =====================================================
          INVENTORY CATEGORIES
      ===================================================== */}

      {inventory && (
        <>
          {renderItems("Pizza Bases", inventory.pizzaBases)}

          {renderItems("Sauces", inventory.sauces)}

          {renderItems("Cheeses", inventory.cheeses)}

          {renderItems("Vegetables", inventory.vegetables)}
        </>
      )}
    </main>
  );
}

export default AdminInventory;
