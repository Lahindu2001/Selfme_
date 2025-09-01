const Inventory = require("../Model/InventoryModel");

// ------------------- GET ALL ITEMS -------------------
const getAllItems = async (req, res, next) => {
    let items;
    try {
        items = await Inventory.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching items" });
    }

    if (!items || items.length === 0) {
        return res.status(404).json({ message: "No items found" });
    }

    return res.status(200).json({ items });
};

// ------------------- ADD ITEM -------------------
const addItem = async (req, res, next) => {
    // Destructure body from frontend
    const {
        productName,
        category,
        description,
        stockQuantity,
        reorderLevel,
        reorderQuantity,
        stockLocation,
        purchasePrice,
        sellingPrice,
        supplier,
        warrantyPeriod,
        powerRating,
        manufacturer,
        modelNumber,
        itemStatus
    } = req.body;

    // Convert number fields to ensure Mongoose validation passes
    const newItem = new Inventory({
        productName,
        category,
        description,
        stockQuantity: Number(stockQuantity) || 0,
        reorderLevel: Number(reorderLevel) || 0,
        reorderQuantity: Number(reorderQuantity) || 0,
        stockLocation,
        purchasePrice: Number(purchasePrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        supplier,
        warrantyPeriod,
        powerRating,
        manufacturer,
        modelNumber,
        itemStatus
    });

    try {
        await newItem.save();
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Validation error", error: err.message });
    }

    return res.status(201).json({ item: newItem });
};

// ------------------- GET ITEM BY ID -------------------
const getById = async (req, res, next) => {
    const id = req.params.id;
    let item;

    try {
        item = await Inventory.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching item" });
    }

    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({ item });
};

// ------------------- UPDATE ITEM -------------------
const updateItem = async (req, res, next) => {
    const id = req.params.id;
    const {
        productName,
        category,
        description,
        stockQuantity,
        reorderLevel,
        reorderQuantity,
        stockLocation,
        purchasePrice,
        sellingPrice,
        supplier,
        warrantyPeriod,
        powerRating,
        manufacturer,
        modelNumber,
        itemStatus
    } = req.body;

    let updatedItem;

    try {
        updatedItem = await Inventory.findByIdAndUpdate(
            id,
            {
                productName,
                category,
                description,
                stockQuantity: Number(stockQuantity) || 0,
                reorderLevel: Number(reorderLevel) || 0,
                reorderQuantity: Number(reorderQuantity) || 0,
                stockLocation,
                purchasePrice: Number(purchasePrice) || 0,
                sellingPrice: Number(sellingPrice) || 0,
                supplier,
                warrantyPeriod,
                powerRating,
                manufacturer,
                modelNumber,
                itemStatus
            },
            { new: true, runValidators: true } // return updated item and enforce schema validation
        );
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Validation error", error: err.message });
    }

    if (!updatedItem) {
        return res.status(404).json({ message: "Unable to update item" });
    }

    return res.status(200).json({ item: updatedItem });
};

// ------------------- DELETE ITEM -------------------
const deleteItem = async (req, res, next) => {
    const id = req.params.id;
    let item;

    try {
        item = await Inventory.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while deleting item" });
    }

    if (!item) {
        return res.status(404).json({ message: "Unable to delete item" });
    }

    return res.status(200).json({ item });
};

// ------------------- EXPORT FUNCTIONS -------------------
exports.getAllItems = getAllItems;
exports.addItem = addItem;
exports.getById = getById;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
