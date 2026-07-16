// Import React so we can build components
import React from "react";

// ReactDOM connects our React application to the web page
import ReactDOM from "react-dom/client";

// Import the application's root component
import App from "./App";

// Import global styles used across the application
import "./index.css";

// Render the React application into the HTML page
ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode helps identify potential issues during development
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
