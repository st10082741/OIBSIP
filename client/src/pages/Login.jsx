// This is a React functional component.
// Every page in this application is a component.
function Login() {
  // The return statement tells React what to display on the screen.
  return (
    // Main container for the Login page.
    // I'll style this later using CSS.
    <div>
      {/* Main heading of the page */}
      <h1>Login</h1>

      {/* Small description for the user */}
      <p>Welcome back! Please sign in to continue.</p>
    </div>
  );
}

// Makes this component available to other files.
export default Login;
