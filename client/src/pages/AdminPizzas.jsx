import { useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import {
  createAdminPizza,
  deleteAdminPizza,
  getAdminPizzas,
  updateAdminPizza,
  uploadAdminPizzaImage,
} from "../services/adminPizzaService";

import { getAdminInventory } from "../services/adminInventoryService";

import { getImageUrl } from "../utils/imageUrl";

import "./AdminPizzas.css";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  rating: "0",
  featured: false,
  popular: false,
  available: true,

  base: "",
  sauce: "",
  cheese: "",
  vegetables: [],
};

function AdminPizzas() {
  const [pizzas, setPizzas] = useState([]);

  const [inventory, setInventory] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [selectedPizzaId, setSelectedPizzaId] = useState("");

  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ===========================================================
  // LOAD DATA
  // ===========================================================

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [pizzasResult, inventoryResult] = await Promise.all([
        getAdminPizzas(),
        getAdminInventory(),
      ]);

      setPizzas(pizzasResult.pizzas || []);
      setInventory(inventoryResult.inventory || null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Admin pizza data could not be loaded.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===========================================================
  // SUMMARY
  // ===========================================================

  const summary = useMemo(
    () => ({
      total: pizzas.length,

      available: pizzas.filter((pizza) => pizza.available).length,

      featured: pizzas.filter((pizza) => pizza.featured).length,

      popular: pizzas.filter((pizza) => pizza.popular).length,
    }),
    [pizzas],
  );

  // ===========================================================
  // FORM
  // ===========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleVegetable = (vegetableId) => {
    setFormData((current) => ({
      ...current,

      vegetables: current.vegetables.includes(vegetableId)
        ? current.vegetables.filter((id) => id !== vegetableId)
        : [...current.vegetables, vegetableId],
    }));
  };

  // ===========================================================
  // EDIT PIZZA
  // ===========================================================

  const startEditing = (pizza) => {
    setSelectedPizzaId(pizza._id);

    setImageFile(null);

    setFormData({
      name: pizza.name || "",
      description: pizza.description || "",
      price: pizza.price?.toString() || "",
      category: pizza.category || "",
      rating: pizza.rating?.toString() || "0",

      featured: Boolean(pizza.featured),

      popular: Boolean(pizza.popular),

      available: Boolean(pizza.available),

      base: pizza.recipe?.base || "",

      sauce: pizza.recipe?.sauce || "",

      cheese: pizza.recipe?.cheese || "",

      vegetables: pizza.recipe?.vegetables || [],
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const resetForm = () => {
    setSelectedPizzaId("");
    setFormData(emptyForm);
    setImageFile(null);
  };

  // ===========================================================
  // SAVE
  // ===========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.category.trim() ||
      formData.price === ""
    ) {
      toast.error("Name, description, price and category are required.");

      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),

        description: formData.description.trim(),

        price: Number(formData.price),

        category: formData.category.trim(),

        rating: Number(formData.rating),

        featured: formData.featured,

        popular: formData.popular,

        available: formData.available,

        recipe: {
          base: formData.base || null,

          sauce: formData.sauce || null,

          cheese: formData.cheese || null,

          vegetables: formData.vegetables,
        },
      };

      let pizzaId = selectedPizzaId;

      if (selectedPizzaId) {
        await updateAdminPizza(selectedPizzaId, payload);

        toast.success("Pizza updated successfully.");
      } else {
        const result = await createAdminPizza(payload);

        pizzaId = result.pizza._id;

        toast.success("Pizza created successfully.");
      }

      /*
      Image upload remains a separate request
      because the backend uses a dedicated
      Multer image endpoint.
      */
      if (imageFile && pizzaId) {
        await uploadAdminPizzaImage(pizzaId, imageFile);

        toast.success("Pizza image uploaded successfully.");
      }

      resetForm();

      await loadData();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Pizza could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ===========================================================
  // QUICK TOGGLES
  // ===========================================================

  const updateBoolean = async (pizza, field) => {
    try {
      await updateAdminPizza(pizza._id, {
        [field]: !pizza[field],
      });

      await loadData();

      toast.success(`${pizza.name} updated.`);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Pizza could not be updated.",
      );
    }
  };

  // ===========================================================
  // DELETE
  // ===========================================================

  const handleDelete = async (pizza) => {
    const confirmed = window.confirm(`Delete "${pizza.name}" permanently?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminPizza(pizza._id);

      toast.success("Pizza deleted successfully.");

      if (selectedPizzaId === pizza._id) {
        resetForm();
      }

      await loadData();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Pizza could not be deleted.",
      );
    }
  };

  if (loading) {
    return (
      <main className="admin-pizzas-page">
        <div className="admin-pizza-state">
          <div className="admin-pizza-spinner" />
          Loading pizza management...
        </div>
      </main>
    );
  }

  return (
    <main className="admin-pizzas-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-pizza-header">
        <div>
          <span className="admin-pizza-eyebrow">Menu Management</span>

          <h1>Build and control your menu.</h1>

          <p>
            Create pizzas, upload images, manage availability and map each menu
            pizza to kitchen inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={refreshing}
        >
          {refreshing ? "↻ Refreshing..." : "↻ Refresh menu"}
        </button>
      </header>

      {error && <div className="admin-pizza-error">{error}</div>}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="admin-pizza-summary">
        <div>
          <span>Total pizzas</span>
          <strong>{summary.total}</strong>
        </div>

        <div>
          <span>Available</span>
          <strong>{summary.available}</strong>
        </div>

        <div>
          <span>Featured</span>
          <strong>{summary.featured}</strong>
        </div>

        <div>
          <span>Popular</span>
          <strong>{summary.popular}</strong>
        </div>
      </section>

      {/* =====================================================
          CREATE / EDIT FORM
      ===================================================== */}

      <section className="pizza-editor">
        <div className="pizza-editor-heading">
          <div>
            <span className="admin-pizza-eyebrow">
              {selectedPizzaId ? "Edit Pizza" : "Create Pizza"}
            </span>

            <h2>{selectedPizzaId ? "Update menu pizza" : "Add a new pizza"}</h2>
          </div>

          {selectedPizzaId && (
            <button type="button" className="editor-cancel" onClick={resetForm}>
              Cancel editing
            </button>
          )}
        </div>

        <form className="pizza-editor-form" onSubmit={handleSubmit}>
          <div className="pizza-form-grid">
            <label>
              <span>Pizza name</span>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Spicy Chicken"
              />
            </label>

            <label>
              <span>Category</span>

              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Chicken"
              />
            </label>

            <label>
              <span>Price</span>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="149.99"
              />
            </label>

            <label>
              <span>Rating</span>

              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
              />
            </label>
          </div>

          <label className="pizza-description-field">
            <span>Description</span>

            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this pizza..."
            />
          </label>

          {/* =================================================
              RECIPE
          ================================================= */}

          <div className="recipe-panel">
            <div>
              <span className="admin-pizza-eyebrow">Inventory Recipe</span>

              <h3>Map pizza to ingredients</h3>

              <p>
                These selections determine what inventory is deducted after
                successful payment.
              </p>
            </div>

            <div className="pizza-form-grid">
              <label>
                <span>Pizza base</span>

                <select
                  name="base"
                  value={formData.base}
                  onChange={handleChange}
                >
                  <option value="">Select base</option>

                  {inventory?.pizzaBases?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Sauce</span>

                <select
                  name="sauce"
                  value={formData.sauce}
                  onChange={handleChange}
                >
                  <option value="">Select sauce</option>

                  {inventory?.sauces?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Cheese</span>

                <select
                  name="cheese"
                  value={formData.cheese}
                  onChange={handleChange}
                >
                  <option value="">Select cheese</option>

                  {inventory?.cheeses?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="vegetable-selector">
              <span>Vegetables</span>

              <div className="vegetable-options">
                {inventory?.vegetables?.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      formData.vegetables.includes(item.id) ? "selected" : ""
                    }
                    onClick={() => toggleVegetable(item.id)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* =================================================
              FLAGS
          ================================================= */}

          <div className="pizza-switches">
            <label>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />

              <span>Featured</span>
            </label>

            <label>
              <input
                type="checkbox"
                name="popular"
                checked={formData.popular}
                onChange={handleChange}
              />

              <span>Popular</span>
            </label>

            <label>
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />

              <span>Available</span>
            </label>
          </div>

          {/* =================================================
              IMAGE
          ================================================= */}

          <label className="pizza-image-upload">
            <span>Pizza image</span>

            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageFile(event.target.files?.[0] || null)
              }
            />

            <small>JPG, PNG or supported backend image format.</small>
          </label>

          <button type="submit" className="pizza-save-button" disabled={saving}>
            {saving
              ? "Saving..."
              : selectedPizzaId
                ? "Save Changes"
                : "Create Pizza"}
          </button>
        </form>
      </section>

      {/* =====================================================
          PIZZA LIST
      ===================================================== */}

      <section className="admin-menu-section">
        <div className="admin-menu-heading">
          <div>
            <span className="admin-pizza-eyebrow">Current Menu</span>

            <h2>Manage existing pizzas</h2>
          </div>

          <strong>{pizzas.length} pizzas</strong>
        </div>

        <div className="admin-pizza-grid">
          {pizzas.map((pizza) => {
            const image = getImageUrl(pizza.image);

            return (
              <article className="admin-pizza-card" key={pizza._id}>
                <div className="admin-pizza-image">
                  {image ? <img src={image} alt={pizza.name} /> : <div>🍕</div>}

                  <span
                    className={pizza.available ? "available" : "unavailable"}
                  >
                    {pizza.available ? "Available" : "Hidden"}
                  </span>
                </div>

                <div className="admin-pizza-content">
                  <div className="admin-pizza-title">
                    <div>
                      <h3>{pizza.name}</h3>

                      <span>{pizza.category}</span>
                    </div>

                    <strong>R {Number(pizza.price).toFixed(2)}</strong>
                  </div>

                  <p>{pizza.description}</p>

                  <div className="pizza-flags">
                    <button
                      type="button"
                      className={pizza.featured ? "active" : ""}
                      onClick={() => updateBoolean(pizza, "featured")}
                    >
                      ★ Featured
                    </button>

                    <button
                      type="button"
                      className={pizza.popular ? "active" : ""}
                      onClick={() => updateBoolean(pizza, "popular")}
                    >
                      🔥 Popular
                    </button>

                    <button
                      type="button"
                      className={pizza.available ? "active" : ""}
                      onClick={() => updateBoolean(pizza, "available")}
                    >
                      ✓ Available
                    </button>
                  </div>

                  <div className="admin-pizza-actions">
                    <button type="button" onClick={() => startEditing(pizza)}>
                      Edit Pizza
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() => handleDelete(pizza)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default AdminPizzas;
