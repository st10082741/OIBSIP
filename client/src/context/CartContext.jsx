import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "react-toastify";

import { useAuth } from "./AuthContext";

import {
  getCart,
  addCatalogPizza,
  addCustomPizza as addCustomPizzaRequest,
  updateCartItem,
  removeCartItem,
  clearCustomerCart,
} from "../services/cartService";

export const CartContext = createContext(null);

function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState({
    id: null,
    items: [],
    totalQuantity: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(false);

  // ===========================================================
  // RESET LOCAL CART STATE
  // ===========================================================

  const resetCartState = useCallback(() => {
    setCart({
      id: null,
      items: [],
      totalQuantity: 0,
      total: 0,
    });
  }, []);

  // ===========================================================
  // LOAD REAL MONGODB CART
  // ===========================================================

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      resetCartState();
      return;
    }

    try {
      setLoading(true);

      const result = await getCart();

      setCart(result.cart);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load your cart.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, resetCartState]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // ===========================================================
  // ADD CATALOG PIZZA
  // ===========================================================

  const addToCart = async (pizza) => {
    try {
      const pizzaId = pizza?._id || pizza?.id;

      if (!pizzaId) {
        throw new Error("Pizza ID is missing.");
      }

      await addCatalogPizza(pizzaId, 1);

      /*
      Reload after mutation so every catalog/custom reference
      is fully populated exactly as GET /api/cart returns it.
      */
      await refreshCart();

      toast.success(`🍕 ${pizza.name} added to cart!`);

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Could not add pizza to cart.",
      );

      return false;
    }
  };

  // ===========================================================
  // ADD CUSTOM PIZZA
  // ===========================================================

  const addCustomPizza = async ({
    baseId,
    sauceId,
    cheeseId,
    vegetableIds,
    quantity = 1,
  }) => {
    try {
      await addCustomPizzaRequest({
        baseId,
        sauceId,
        cheeseId,
        vegetableIds,
        quantity,
      });

      await refreshCart();

      toast.success("🍕 Your custom pizza was added to the cart!");

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not add your custom pizza.",
      );

      return false;
    }
  };

  // ===========================================================
  // CHANGE QUANTITY
  // ===========================================================

  const setQuantity = async (itemId, quantity) => {
    try {
      if (quantity < 1) {
        return;
      }

      await updateCartItem(itemId, quantity);

      await refreshCart();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not update quantity.",
      );
    }
  };

  const increaseQuantity = async (itemId) => {
    const item = cart.items.find((cartItem) => cartItem.id === itemId);

    if (!item) return;

    await setQuantity(itemId, item.quantity + 1);
  };

  const decreaseQuantity = async (itemId) => {
    const item = cart.items.find((cartItem) => cartItem.id === itemId);

    if (!item) return;

    if (item.quantity === 1) {
      return;
    }

    await setQuantity(itemId, item.quantity - 1);
  };

  // ===========================================================
  // REMOVE ITEM
  // ===========================================================

  const removeFromCart = async (itemId) => {
    try {
      await removeCartItem(itemId);

      await refreshCart();

      toast.success("Item removed from cart.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not remove the cart item.",
      );
    }
  };

  // ===========================================================
  // CLEAR CART
  // ===========================================================

  const clearCart = async () => {
    try {
      await clearCustomerCart();

      await refreshCart();

      toast.success("Cart cleared.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not clear the cart.");
    }
  };

  // ===========================================================
  // COMPATIBILITY HELPERS
  // ===========================================================

  const getCartCount = () => cart.totalQuantity || 0;

  const getCartTotal = () => Number(cart.total || 0);

  const value = useMemo(
    () => ({
      cart,
      cartItems: cart.items,
      loading,

      refreshCart,

      addToCart,
      addCustomPizza,

      increaseQuantity,
      decreaseQuantity,
      setQuantity,

      removeFromCart,
      clearCart,

      getCartCount,
      getCartTotal,
    }),
    [cart, loading, refreshCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}

export default CartProvider;
