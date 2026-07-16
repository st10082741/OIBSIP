// Outlet displays whichever dashboard page is currently active
import { Outlet } from "react-router-dom";

// Shared layout for the main application
function DashboardLayout() {
  return (
    // The main container for the dashboard layout
    <div className="dashboard-layout">
      {/* Header section */}
      <header>
        <h2>Pizza Delivery</h2>
      </header>

      {/* Main content area */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
