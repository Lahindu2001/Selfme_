const SupplyProduct = require('../../Model/AdminandSupplyModel/supplyProductsModel');
const Supplier = require('../../Model/AdminandSupplyModel/SupplyRequestModel');

// Get all supply products
const getAllSupplyProducts = async (req, res, next) => {
    let supplyProducts;
    try {
        supplyProducts = await SupplyProduct.find();
        if (!supplyProducts || supplyProducts.length === 0) {
            return res.status(404).json({ message: "No supply products found" });
        }
        return res.status(200).json({ supplyProducts });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching supply products", error: err.message });
    }
};

// Get supplier brand names for dropdown
const getSupplierBrandNames = async (req, res, next) => {
    let suppliers;
    try {
        suppliers = await Supplier.find({}, 'supplier_brandname');
        if (!suppliers || suppliers.length === 0) {
            return res.status(404).json({ message: "No suppliers found" });
        }
        const brandNames = suppliers.map(supplier => supplier.supplier_brandname);
        return res.status(200).json({ brandNames });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching supplier brand names", error: err.message });
    }
};

// Create a new supply product
const addSupplyProduct = async (req, res, next) => {
    const { serial_number, supplier_name, product_item, quantity, unit_price } = req.body;
    let supplyProduct;
    try {
        // Validate inputs
        if (!serial_number || !serial_number.trim()) {
            return res.status(400).json({ message: "Serial number is required" });
        }
        if (!supplier_name || !/^[a-zA-Z\s]*$/.test(supplier_name)) {
            return res.status(400).json({ message: "Invalid supplier name" });
        }
        if (!product_item || !product_item.trim()) {
            return res.status(400).json({ message: "Product item is required" });
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be a positive integer" });
        }
        if (typeof unit_price !== 'number' || unit_price < 0) {
            return res.status(400).json({ message: "Unit price must be a non-negative number" });
        }

        // Verify supplier_name exists in Suppliers collection
        const supplierExists = await Supplier.findOne({ supplier_brandname: supplier_name });
        if (!supplierExists) {
            return res.status(400).json({ message: "Supplier name does not exist in Suppliers collection" });
        }

        supplyProduct = new SupplyProduct({
            serial_number,
            supplier_name,
            product_item,
            quantity,
            unit_price
        });
        await supplyProduct.save();
        return res.status(201).json({ supplyProduct });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Unable to add supply product", error: err.message });
    }
};

// Get supply product by ID
const getSupplyProductById = async (req, res, next) => {
    const id = req.params.id;
    let supplyProduct;
    try {
        supplyProduct = await SupplyProduct.findById(id);
        if (!supplyProduct) {
            return res.status(404).json({ message: "Supply product not found" });
        }
        return res.status(200).json({ supplyProduct });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching supply product", error: err.message });
    }
};

// Update a supply product
const updateSupplyProduct = async (req, res, next) => {
    const id = req.params.id;
    const { serial_number, supplier_name, product_item, quantity, unit_price } = req.body;
    let supplyProduct;
    try {
        // Validate inputs
        if (!serial_number || !serial_number.trim()) {
            return res.status(400).json({ message: "Serial number is required" });
        }
        if (!supplier_name || !/^[a-zA-Z\s]*$/.test(supplier_name)) {
            return res.status(400).json({ message: "Invalid supplier name" });
        }
        if (!product_item || !product_item.trim()) {
            return res.status(400).json({ message: "Product item is required" });
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be a positive integer" });
        }
        if (typeof unit_price !== 'number' || unit_price < 0) {
            return res.status(400).json({ message: "Unit price must be a non-negative number" });
        }

        // Verify supplier_name exists in Suppliers collection
        const supplierExists = await Supplier.findOne({ supplier_brandname: supplier_name });
        if (!supplierExists) {
            return res.status(400).json({ message: "Supplier name does not exist in Suppliers collection" });
        }

        supplyProduct = await SupplyProduct.findByIdAndUpdate(
            id,
            { serial_number, supplier_name, product_item, quantity, unit_price, updated_at: Date.now() },
            { new: true, runValidators: true }
        );
        if (!supplyProduct) {
            return res.status(404).json({ message: "Unable to update supply product" });
        }
        return res.status(200).json({ supplyProduct });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Unable to update supply product", error: err.message });
    }
};

// Delete a supply product
const deleteSupplyProduct = async (req, res, next) => {
    const id = req.params.id;
    let supplyProduct;
    try {
        supplyProduct = await SupplyProduct.findByIdAndDelete(id);
        if (!supplyProduct) {
            return res.status(404).json({ message: "Unable to delete supply product" });
        }
        return res.status(200).json({ supplyProduct, message: "Supply product deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while deleting supply product", error: err.message });
    }
};

exports.getAllSupplyProducts = getAllSupplyProducts;
exports.getSupplierBrandNames = getSupplierBrandNames;
exports.addSupplyProduct = addSupplyProduct;
exports.getSupplyProductById = getSupplyProductById;
exports.updateSupplyProduct = updateSupplyProduct;
exports.deleteSupplyProduct = deleteSupplyProduct;