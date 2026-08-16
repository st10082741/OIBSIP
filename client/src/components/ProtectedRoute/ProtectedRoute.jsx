import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

/*
==============================================================
                  CUSTOMER PROTECTED ROUTE
==============================================================

Prevents unauthenticated visitors from accessing customer
application pages.

If the customer is not logged in:
→ Redirect to /login

After successful login:
→ Return them to the page they originally requested.
==============================================================
*/

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
