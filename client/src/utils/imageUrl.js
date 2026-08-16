/*
==============================================================
                  IMAGE URL UTILITY
==============================================================

MongoDB stores image paths such as:

/uploads/pizzas/pizza-example.jpg

React needs the complete backend URL:

http://localhost:5000/uploads/...
==============================================================
*/

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  // External image URL.
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `${SERVER_URL}${imagePath}`;
};
