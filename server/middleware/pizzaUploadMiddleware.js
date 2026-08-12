/*
==============================================================
                PIZZA IMAGE UPLOAD MIDDLEWARE
==============================================================

Purpose:
• Handle administrator pizza image uploads.
• Accept image files only.
• Limit uploaded file size.
• Generate unique file names.
• Store development uploads inside uploads/pizzas.

Later, the storage implementation can be replaced with
cloud storage without changing the Pizza model.

==============================================================
*/

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =============================================================
// UPLOAD DIRECTORY
// =============================================================

const uploadDirectory = path.join(__dirname, "../uploads/pizzas");

/*
Create the directory automatically if it does not exist.

recursive: true means parent folders are also created
when necessary.
*/
fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

// =============================================================
// STORAGE CONFIGURATION
// =============================================================

const storage = multer.diskStorage({
  // Store pizza images inside uploads/pizzas.
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  /*
  Generate a unique filename.

  Example:

  pizza-1754920000000-348291.jpg

  This reduces filename collisions when different pizzas
  upload files with the same original name.
  */
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName = `pizza-${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${extension}`;

    cb(null, uniqueName);
  },
});

// =============================================================
// IMAGE FILE FILTER
// =============================================================

const fileFilter = (req, file, cb) => {
  /*
  Only allow common image MIME types.

  This prevents PDFs, executables and unrelated files
  from being accepted by this upload endpoint.
  */

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG and WEBP images are allowed."), false);
  }

  cb(null, true);
};

// =============================================================
// MULTER INSTANCE
// =============================================================

const pizzaUpload = multer({
  storage,
  fileFilter,

  // Maximum file size: 5 MB.
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = pizzaUpload;
