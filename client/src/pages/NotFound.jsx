// Displays the 404 Not Found page.

function NotFound() {
  return (
    // Container for the not found page.
    <div className="not-found">
      {/* Main heading of the page */}
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
}

// Makes this component available to other files.
export default NotFound;
