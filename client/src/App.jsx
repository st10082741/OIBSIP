// Import application routing.
import AppRoutes from "./routes/AppRoutes";

// Global customer/admin authentication.
import AuthProvider from "./context/AuthContext";

// Shopping cart provider.
import CartProvider from "./context/CartContext";

// Toast notifications.
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/*
==============================================================
                        ROOT APP
==============================================================

Global providers are placed here so authentication,
cart functionality and notifications are available
throughout the application.
==============================================================
*/

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />

        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
