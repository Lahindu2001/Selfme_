const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Import Package Controller
const ProductController = require("../Controlers/PakageController");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Uploads/"); // folder to save images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage });

// Routes
router.get("/", ProductController.getAllProducts); // Get all products
router.post("/", upload.single("photo"), ProductController.addProduct); // Add product with photo
router.get("/:id", ProductController.getById); // Get product by ID
router.put("/:id", upload.single("photo"), ProductController.updateProduct); // Update product with photo
router.delete("/:id", ProductController.deleteProduct); // Delete product

module.exports = router;