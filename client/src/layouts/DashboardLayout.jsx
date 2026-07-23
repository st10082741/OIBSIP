// Outlet displays whichever dashboard page is currently active
import { Outlet } from "react-router-dom";

// Import the Navbar component used across the application
import Navbar from "../components/Navbar/Navbar";

// import footer component for consistent footer across pages
import Footer from "../components/Footer/Footer";
// Shared layout for all protected pages
function DashboardLayout() {
  return (
    // Main container for the dashboard pages
    <div className="dashboard-layout">
      {/* Display the navigation bar */}
      <Navbar />

      {/* Render the page that matches the current route */}
      <main className="main-content">
        {/* Outlet is a placeholder for the active page component */}
        <Outlet />
      </main>
      {/* Display the footer */}
      <Footer />
    </div>
  );
}

export default DashboardLayout;
