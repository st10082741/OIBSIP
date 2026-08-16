import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCart } from "../context/CartContext";

import {
  getPizzaBases,
  getSauces,
  getCheeses,
  getVegetables,
  buildCustomPizza,
} from "../services/builderService";

import "./PizzaBuilder.css";

function PizzaBuilder() {
  const navigate = useNavigate();

  const { addCustomPizza } = useCart();

  const [step, setStep] = useState(1);

  const [pizzaBases, setPizzaBases] = useState([]);
  const [sauces, setSauces] = useState([]);
  const [cheeses, setCheeses] = useState([]);
  const [vegetables, setVegetables] = useState([]);

  const [baseId, setBaseId] = useState("");
  const [sauceId, setSauceId] = useState("");
  const [cheeseId, setCheeseId] = useState("");
  const [vegetableIds, setVegetableIds] = useState([]);

  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");

  // ===========================================================
  // LOAD BUILDER OPTIONS
  // ===========================================================

  useEffect(() => {
    const loadBuilderOptions = async () => {
      try {
        setLoading(true);
        setError("");

        const [basesResult, saucesResult, cheesesResult, vegetablesResult] =
          await Promise.all([
            getPizzaBases(),
            getSauces(),
            getCheeses(),
            getVegetables(),
          ]);

        setPizzaBases(basesResult.bases || []);
        setSauces(saucesResult.sauces || []);
        setCheeses(cheesesResult.cheeses || []);
        setVegetables(vegetablesResult.vegetables || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "We could not load the pizza builder options.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadBuilderOptions();
  }, []);

  // ===========================================================
  // HELPERS
  // ===========================================================

  const selectedBase = useMemo(
    () => pizzaBases.find((item) => item._id === baseId),
    [pizzaBases, baseId],
  );

  const selectedSauce = useMemo(
    () => sauces.find((item) => item._id === sauceId),
    [sauces, sauceId],
  );

  const selectedCheese = useMemo(
    () => cheeses.find((item) => item._id === cheeseId),
    [cheeses, cheeseId],
  );

  const selectedVegetables = useMemo(
    () => vegetables.filter((item) => vegetableIds.includes(item._id)),
    [vegetables, vegetableIds],
  );

  const estimatedTotal = useMemo(() => {
    const basePrice = selectedBase?.price || 0;
    const saucePrice = selectedSauce?.price || 0;
    const cheesePrice = selectedCheese?.price || 0;

    const vegetablePrice = selectedVegetables.reduce(
      (total, item) => total + Number(item.price || 0),
      0,
    );

    return (
      Number(basePrice) +
      Number(saucePrice) +
      Number(cheesePrice) +
      vegetablePrice
    );
  }, [selectedBase, selectedSauce, selectedCheese, selectedVegetables]);

  const canContinue = () => {
    if (step === 1) return Boolean(baseId);
    if (step === 2) return Boolean(sauceId);
    if (step === 3) return Boolean(cheeseId);

    return true;
  };

  const nextStep = () => {
    if (!canContinue()) {
      toast.error("Please make a selection before continuing.");
      return;
    }

    setStep((current) => Math.min(current + 1, 4));
  };

  const previousStep = () => {
    setSummary(null);
    setStep((current) => Math.max(current - 1, 1));
  };

  const toggleVegetable = (id) => {
    setSummary(null);

    setVegetableIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // ===========================================================
  // BUILD TRUSTED SUMMARY
  // ===========================================================

  const handleBuildPizza = async () => {
    try {
      setBuilding(true);
      setError("");

      const result = await buildCustomPizza({
        baseId,
        sauceId,
        cheeseId,
        vegetableIds,
      });

      setSummary(result.orderSummary);

      toast.success("Your custom pizza is ready!");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We could not build your pizza.",
      );
    } finally {
      setBuilding(false);
    }
  };

  const steps = [
    {
      number: 1,
      label: "Base",
      description: "Choose your foundation",
    },
    {
      number: 2,
      label: "Sauce",
      description: "Pick your flavour",
    },
    {
      number: 3,
      label: "Cheese",
      description: "Choose the perfect melt",
    },
    {
      number: 4,
      label: "Vegetables",
      description: "Add your favourites",
    },
  ];

  // ===========================================================
  // LOADING / ERROR
  // ===========================================================

  if (loading) {
    return (
      <div className="builder-state">
        <div className="builder-spinner" />

        <h2>Preparing your pizza station...</h2>
        <p>Loading fresh ingredients from the kitchen.</p>
      </div>
    );
  }

  if (error && pizzaBases.length === 0) {
    return (
      <div className="builder-state">
        <span>🍕</span>
        <h2>Builder unavailable</h2>
        <p>{error}</p>
      </div>
    );
  }

  // ===========================================================
  // UI
  // ===========================================================

  return (
    <div className="builder-page">
      <section className="builder-hero">
        <div>
          <span className="builder-eyebrow">Build Your Own</span>

          <h1>Create a pizza that is completely yours.</h1>

          <p>
            Four simple steps. Fresh ingredients. One pizza built exactly around
            your taste.
          </p>
        </div>

        <div className="builder-hero-badge">
          <span>🍕</span>
          <strong>Custom Kitchen</strong>
          <small>Made to order</small>
        </div>
      </section>

      <section className="builder-shell">
        {/* =====================================================
            PROGRESS
        ===================================================== */}

        <div className="builder-progress">
          {steps.map((item) => {
            const active = item.number === step;
            const completed = item.number < step;

            return (
              <div
                key={item.number}
                className={`builder-step ${
                  active ? "active" : ""
                } ${completed ? "completed" : ""}`}
              >
                <div className="builder-step-number">
                  {completed ? "✓" : item.number}
                </div>

                <div>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="builder-content-grid">
          {/* ===================================================
              MAIN SELECTOR
          =================================================== */}

          <div className="builder-main-card">
            {error && <div className="builder-error">{error}</div>}

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div className="builder-section-header">
                  <span>Step 1 of 4</span>
                  <h2>Choose your pizza base</h2>
                  <p>Start with the crust that fits your style.</p>
                </div>

                <div className="ingredient-grid">
                  {pizzaBases.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      className={`ingredient-card ${
                        baseId === item._id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setBaseId(item._id);
                        setSummary(null);
                      }}
                    >
                      <div className="ingredient-icon">🍞</div>

                      <div>
                        <h3>{item.name}</h3>
                        <p>Freshly prepared base</p>
                      </div>

                      <strong>+ R {Number(item.price).toFixed(2)}</strong>

                      <span className="selection-check">✓</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div className="builder-section-header">
                  <span>Step 2 of 4</span>
                  <h2>Choose your sauce</h2>
                  <p>Pick the flavour that brings everything together.</p>
                </div>

                <div className="ingredient-grid">
                  {sauces.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      className={`ingredient-card ${
                        sauceId === item._id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSauceId(item._id);
                        setSummary(null);
                      }}
                    >
                      <div className="ingredient-icon">🍅</div>

                      <div>
                        <h3>{item.name}</h3>
                        <p>Kitchen-made sauce</p>
                      </div>

                      <strong>+ R {Number(item.price).toFixed(2)}</strong>

                      <span className="selection-check">✓</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className="builder-section-header">
                  <span>Step 3 of 4</span>
                  <h2>Choose your cheese</h2>
                  <p>Because every great pizza deserves the perfect melt.</p>
                </div>

                <div className="ingredient-grid">
                  {cheeses.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      className={`ingredient-card ${
                        cheeseId === item._id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setCheeseId(item._id);
                        setSummary(null);
                      }}
                    >
                      <div className="ingredient-icon">🧀</div>

                      <div>
                        <h3>{item.name}</h3>
                        <p>Rich and melty</p>
                      </div>

                      <strong>+ R {Number(item.price).toFixed(2)}</strong>

                      <span className="selection-check">✓</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <>
                <div className="builder-section-header">
                  <span>Step 4 of 4</span>
                  <h2>Add your vegetables</h2>
                  <p>Select as many as you like — or keep it simple.</p>
                </div>

                <div className="ingredient-grid">
                  {vegetables.map((item) => {
                    const selected = vegetableIds.includes(item._id);

                    return (
                      <button
                        key={item._id}
                        type="button"
                        className={`ingredient-card ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() => toggleVegetable(item._id)}
                      >
                        <div className="ingredient-icon">🥬</div>

                        <div>
                          <h3>{item.name}</h3>
                          <p>Fresh vegetable topping</p>
                        </div>

                        <strong>+ R {Number(item.price).toFixed(2)}</strong>

                        <span className="selection-check">✓</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* =================================================
                NAVIGATION
            ================================================= */}

            <div className="builder-navigation">
              <button
                type="button"
                className="builder-back-btn"
                onClick={previousStep}
                disabled={step === 1}
              >
                ← Back
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  className="builder-next-btn"
                  onClick={nextStep}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  className="builder-next-btn"
                  onClick={handleBuildPizza}
                  disabled={building}
                >
                  {building ? "Building..." : "Review My Pizza →"}
                </button>
              )}
            </div>
          </div>

          {/* ===================================================
              LIVE SUMMARY
          =================================================== */}

          <aside className="builder-summary-card">
            <div className="summary-pizza-visual">🍕</div>

            <span className="builder-eyebrow">Your Creation</span>

            <h2>Pizza summary</h2>

            <div className="builder-summary-list">
              <div>
                <span>Base</span>
                <strong>{selectedBase?.name || "Not selected"}</strong>
              </div>

              <div>
                <span>Sauce</span>
                <strong>{selectedSauce?.name || "Not selected"}</strong>
              </div>

              <div>
                <span>Cheese</span>
                <strong>{selectedCheese?.name || "Not selected"}</strong>
              </div>

              <div>
                <span>Vegetables</span>

                <strong>
                  {selectedVegetables.length > 0
                    ? selectedVegetables.map((item) => item.name).join(", ")
                    : "None"}
                </strong>
              </div>
            </div>

            <div className="builder-price-preview">
              <span>{summary ? "Confirmed total" : "Estimated total"}</span>

              <strong>
                R {Number(summary?.pricing?.total ?? estimatedTotal).toFixed(2)}
              </strong>
            </div>

            {summary && (
              <div className="builder-confirmed">
                <div>
                  <span>✓</span>

                  <div>
                    <strong>Pizza confirmed</strong>

                    <p>Price verified by the kitchen.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const added = await addCustomPizza({
                      baseId,
                      sauceId,
                      cheeseId,
                      vegetableIds,
                      quantity: 1,
                    });

                    if (added) {
                      navigate("/cart");
                    }
                  }}
                >
                  Add to Cart →
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

export default PizzaBuilder;
