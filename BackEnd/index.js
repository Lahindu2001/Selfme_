// 3) Updated index.js
const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./Routes/AuthRoutes");
//lahindu
const userRouter = require("./Routes/AdminandSupplyRoutes/userRoutes");
const allFeedbackRouter = require("./Routes/AdminandSupplyRoutes/AllFeedbackRoutes");
const allEmployeeRouter = require("./Routes/AdminandSupplyRoutes/AllEmployeeRoutes");
const viewSupplyAllRoute = require("./Routes/AdminandSupplyRoutes/ViewSupplyAllRoute");
//sulakshi
const employeeRouter = require("./Routes/TechRoute/employeeRoutes");
const assignmentRoutes = require("./Routes/TechRoute/assignmentRoutes");
//hasaranga
const itemRoutes = require("./Routes/item_routes/ItemRoutes");
const productRequestRoutes = require("./Routes/item_routes/productRequestRoutes");
const supplierRouter = require("./Routes/item_routes/supplierRoutes");
const orderRoutes = require("./Routes/item_routes/orderRoutes");
const stockOutRoutes = require ("./Routes/item_routes/stockOutRoutes");

const path = require("path");
const fs = require("fs");
const cors = require("cors");
const app = express();
// ------------------- MIDDLEWARE -------------------
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
// Serve static files
app.use("/images", express.static(path.join(__dirname, "item_images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Add this line
// Serve static files from uploads folder
app.use("/Uploads", express.static(uploadDir));
// ------------------- ROUTES -------------------
app.use("/auth", authRouter);
//lahindu
app.use("/all-users", userRouter);
app.use("/all-feedback", allFeedbackRouter);
app.use("/all-employees", allEmployeeRouter);
app.use("/all-suppliers", viewSupplyAllRoute);
//sulakshi
app.use("/employees", employeeRouter);
app.use("/assignments", assignmentRoutes);
//hasaranga
app.use("/products", itemRoutes);
app.use("/orders", orderRoutes);
app.use("/productRequests", productRequestRoutes);
app.use("/suppliers", supplierRouter);
app.use("/stockouts", stockOutRoutes);
// ------------------- DATABASE -------------------
mongoose
  .connect("mongodb+srv://admin:M8jreHLM0FG5ZEGi@cluster1.lmzaxue.mongodb.net/")
  .then(() => console.log("✅ Connected to MongoDB"))
  .then(() => {
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.log(err));