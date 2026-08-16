import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

/*
==============================================================
                    ADMIN PROTECTED ROUTE
==============================================================

Only authenticated administrators may access routes
inside /admin.

Customer authentication does NOT grant access.
==============================================================
*/

function AdminRoute() {
  const { isAdminAuthenticated, admin } = useAuth();

  if (!isAdminAuthenticated || admin?.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
