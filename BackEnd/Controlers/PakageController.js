const Product = require("../Model/ProductModel");

// ------------------- ADD PRODUCT -------------------
const addProduct = async (req, res) => {
  const { product_name, price, description, created_by } = req.body;
  const photo = req.file ? `/Uploads/${req.file.filename}` : "";

  try {
    const lastProduct = await Product.findOne().sort({ product_id: -1 });
    const newProductId = lastProduct ? lastProduct.product_id + 1 : 1;

    const newProduct = new Product({
      product_id: newProductId,
      product_name,
      price: Number(price) || 0,
      description,
      photo,
      created_by: Number(created_by) || 0,
    });

    await newProduct.save();
    return res.status(201).json({ product: newProduct });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Validation error", error: err.message });
  }
};

// ------------------- UPDATE PRODUCT -------------------
const updateProduct = async (req, res) => {
  const id = req.params.id;
  const { product_name, price, description, created_by } = req.body;
  const photo = req.file ? `/Uploads/${req.file.filename}` : undefined;

  const updateData = {
    product_name,
    price: Number(price) || 0,
    description,
    created_by: Number(created_by) || 0,
  };
  if (photo !== undefined) updateData.photo = photo;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product: updatedProduct });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Validation error", error: err.message });
  }
};

// ------------------- GET ALL PRODUCTS -------------------
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------- GET PRODUCT BY ID -------------------
const getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------- DELETE PRODUCT -------------------
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Unable to delete product" });
    return res.status(200).json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------- EXPORT CONTROLLER FUNCTIONS -------------------
module.exports = {
  addProduct,
  updateProduct,
  getAllProducts,
  getById,
  deleteProduct,
};