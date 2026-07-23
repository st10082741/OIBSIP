// Import the application's routing configuration
import AppRoutes from "./routes/AppRoutes";
// Import the Cart Provider
import CartProvider from "./context/CartContext";
// The App component is the root component of our application.
// It acts as a wrapper around the entire app.
//
// As the project grows, this is where we can add:
// - Authentication providers
// - Theme providers
// - Shopping cart providers
// - Notifications
// - Other global features
function App() {
  return (
    // Share the shopping cart with the entire application
    <CartProvider>
      {/* Display all application routes */}
      <AppRoutes />
    </CartProvider>
  );
}
// Make the App component available to other files
export default App;
