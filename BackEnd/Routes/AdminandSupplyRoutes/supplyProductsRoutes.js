const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
// Import Controller
const SupplyProductController = require("../../Controllers/AdminandSupplyControllers/supplyProductsController");
// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
// Routes
router.get("/", SupplyProductController.getAllSupplyProducts);
router.post("/", upload.single("product_image"), SupplyProductController.addSupplyProduct);
router.get("/:id", SupplyProductController.getSupplyProductById);
router.put("/:id", upload.single("product_image"), SupplyProductController.updateSupplyProduct);
router.delete("/:id", SupplyProductController.deleteSupplyProduct);
module.exports = router;