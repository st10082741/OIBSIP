// Outlet is the placeholder where child pages will be displayed
import { Outlet } from "react-router-dom";

// Importing the CSS file for styling the authentication layout
import "./AuthLayout.css";

// Layout used for all authentication-related pages
function AuthLayout() {
  return (
    // the main container for authentication layout
    <div className="auth-layout">
      {/* 
                Any page inside this layout
                (Login, Register, Forgot Password)
                will appear here.
            */}
      <Outlet />
    </div>
  );
}

export default AuthLayout;
