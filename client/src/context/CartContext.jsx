// Import functions used to create and manage React Context
//React Context is a way to share data across components without passing props down manually at every level.
import { createContext, useState, useEffect } from "react";

// Create a new Context object.
// Other components will use this to access the shopping cart.
export const CartContext = createContext();

// Create a Provider component.
// This component will wrap our application and share the cart data.
function CartProvider({ children }) {
  // Store all cart items in state.
  // It starts as an empty array because the cart is initially empty.
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");

    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save the cart every time it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add a pizza to the shopping cart
  // This function takes a pizza object as an argument and updates the cart state.
  function addToCart(pizza) {
    setCartItems((previousItems) => {
      // Check if this pizza already exists
      const existingPizza = previousItems.find((item) => item.id === pizza.id);

      // If it exists, increase its quantity
      if (existingPizza) {
        return previousItems.map((item) =>
          item.id === pizza.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      // Otherwise add it with quantity 1
      return [...previousItems, { ...pizza, quantity: 1 }];
    });
  }

  // Increase the quantity of a pizza
  function increaseQuantity(id) {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  // Decrease the quantity of a pizza
  function decreaseQuantity(id) {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  // Remove a pizza completely from the cart
  function removeFromCart(id) {
    setCartItems((previousItems) =>
      previousItems.filter((item) => item.id !== id),
    );
  }
  // Calculate the total price of all pizzas in the cart
  function getCartTotal() {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }

  // Calculate the total number of pizzas in the cart
  function getCartCount() {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }
  // Everything placed inside "value" becomes available
  // to every component wrapped by this Provider.
  const value = {
    cartItems,
    setCartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {/* Render every component inside the Provider */}
      {children}
    </CartContext.Provider>
  );
}

// Export the Provider so App.jsx can use it.
export default CartProvider;
