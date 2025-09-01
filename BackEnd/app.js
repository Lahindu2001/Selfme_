const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./Routes/UserRoutes");
const inventoryRouter = require("./Routes/InventoryRoutes");
const productRouter = require("./Routes/ProductRoutes");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();

// ------------------- MIDDLEWARE -------------------
app.use(express.json());
app.use(cors());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files from uploads folder
app.use("/uploads", express.static(uploadDir));

// ------------------- ROUTES -------------------
app.use("/users", userRouter);
app.use("/inventory", inventoryRouter);
app.use("/products", productRouter);

// ------------------- DATABASE -------------------
mongoose
  .connect("mongodb+srv://admin:5ujIqBeOwJYjq1hM@cluster1.lmzaxue.mongodb.net/")
  .then(() => console.log("✅ Connected to MongoDB"))
  .then(() => {
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.log(err));