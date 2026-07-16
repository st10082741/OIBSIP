// Import React so we can build components
import React from "react";

// ReactDOM connects our React application to the web page
import ReactDOM from "react-dom/client";

// Import global styles used across the application
import "./index.css";

// Import our application's routing configuration
import AppRoutes from "./routes/AppRoutes";

// Render the application into the HTML page
ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode helps identify potential issues while developing
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
);
