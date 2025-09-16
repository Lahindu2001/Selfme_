const SupplyProduct = require("../../Model/AdminandSupplyModel/supplyProductsModel");
const Supplier = require("../../Model/AdminandSupplyModel/SupplyRequestModel");
// ------------------- ADD SUPPLY PRODUCT -------------------
const addSupplyProduct = async (req, res) => {
  const { serial_number, supplier_name, product_item, quantity, unit_price } = req.body;
  const product_image = req.file ? `/Uploads/${req.file.filename}` : "";
  try {
    const lastProduct = await SupplyProduct.findOne().sort({ pid: -1 });
    const newPid = lastProduct ? lastProduct.pid + 1 : 1;
    // Verify supplier exists
    const supplier = await Supplier.findById(supplier_name);
    if (!supplier) {
      return res.status(400).json({ message: "Invalid supplier ID" });
    }
    const newSupplyProduct = new SupplyProduct({
      pid: newPid,
      serial_number,
      supplier_name, // Now an ObjectId referencing Supplier
      product_item,
      quantity: Number(quantity) || 0,
      product_image,
      unit_price: Number(unit_price) || 0,
    });
    await newSupplyProduct.save();
    return res.status(201).json({ supplyProduct: newSupplyProduct });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Validation error", error: err.message });
  }
};
// ------------------- UPDATE SUPPLY PRODUCT -------------------
const updateSupplyProduct = async (req, res) => {
  const id = req.params.id;
  const { serial_number, supplier_name, product_item, quantity, unit_price } = req.body;
  const product_image = req.file ? `/Uploads/${req.file.filename}` : undefined;
  const updateData = {
    serial_number,
    supplier_name, // Now an ObjectId referencing Supplier
    product_item,
    quantity: Number(quantity) || 0,
    unit_price: Number(unit_price) || 0,
  };
  if (product_image !== undefined) updateData.product_image = product_image;
  try {
    // Verify supplier exists
    if (supplier_name) {
      const supplier = await Supplier.findById(supplier_name);
      if (!supplier) {
        return res.status(400).json({ message: "Invalid supplier ID" });
      }
    }
    const updatedSupplyProduct = await SupplyProduct.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedSupplyProduct) return res.status(404).json({ message: "Supply product not found" });
    return res.status(200).json({ supplyProduct: updatedSupplyProduct });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Validation error", error: err.message });
  }
};
// ------------------- GET ALL SUPPLY PRODUCTS -------------------
const getAllSupplyProducts = async (req, res) => {
  try {
    const supplyProducts = await SupplyProduct.find().populate('supplier_name', 'supplier_brandname');
    return res.status(200).json({ supplyProducts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
// ------------------- GET SUPPLY PRODUCT BY ID -------------------
const getSupplyProductById = async (req, res) => {
  try {
    const supplyProduct = await SupplyProduct.findById(req.params.id).populate('supplier_name', 'supplier_brandname');
    if (!supplyProduct) return res.status(404).json({ message: "Supply product not found" });
    return res.status(200).json({ supplyProduct });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
// ------------------- DELETE SUPPLY PRODUCT -------------------
const deleteSupplyProduct = async (req, res) => {
  try {
    const supplyProduct = await SupplyProduct.findByIdAndDelete(req.params.id);
    if (!supplyProduct) return res.status(404).json({ message: "Unable to delete supply product" });
    return res.status(200).json({ supplyProduct });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
// ------------------- EXPORT CONTROLLER FUNCTIONS -------------------
module.exports = {
  addSupplyProduct,
  updateSupplyProduct,
  getAllSupplyProducts,
  getSupplyProductById,
  deleteSupplyProduct,
};