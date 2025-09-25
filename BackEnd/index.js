const express = require("express");
const mongoose = require("mongoose");
const supplyRequestRouter = require("./Routes/AdminandSupplyRoutes/SupplyRequestRoutes");
const supplyProductsRouter = require("./Routes/AdminandSupplyRoutes/supplyProductsRoutes");
const userRouter = require("./Routes/AdminandSupplyRoutes/userRoutes");
const authRouter = require("./Routes/AuthRoutes");
const allFeedbackRouter = require("./Routes/AdminandSupplyRoutes/AllFeedbackRoutes");
const allEmployeeRouter = require("./Routes/AdminandSupplyRoutes/AllEmployeeRoutes");
const employeeRouter = require("./Routes/TechRoute/employeeRoutes");
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
app.use("/Uploads", express.static(uploadDir));
// ------------------- ROUTES -------------------
app.use("/supply-requests", supplyRequestRouter);
app.use("/supply-products", supplyProductsRouter);
app.use("/all-users", userRouter);
app.use("/auth", authRouter);
app.use("/all-feedback", allFeedbackRouter);
app.use("/all-employees", allEmployeeRouter);
app.use("/employees", employeeRouter);
// ------------------- DATABASE -------------------
mongoose
  .connect("mongodb+srv://admin:M8jreHLM0FG5ZEGi@cluster1.lmzaxue.mongodb.net/")
  .then(() => console.log("✅ Connected to MongoDB"))
  .then(() => {
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.log(err));