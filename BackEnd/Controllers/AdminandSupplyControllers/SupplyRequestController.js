const SupplyRequest = require("../../Model/AdminandSupplyModel/SupplyRequestModel");

// Get all supply requests
const getAllSupplyRequests = async (req, res, next) => {
    let supplyRequests;
    try {
        supplyRequests = await SupplyRequest.find();
    } catch (err) {
        console.log(err);
    }
    if (!supplyRequests) return res.status(404).json({ message: "Supply requests not found" });
    return res.status(200).json({ supplyRequests });
};

// Insert supply request
const addSupplyRequest = async (req, res, next) => {
    const { supplier_id, supplier_name, supplier_contact, supplier_brandname, status } = req.body;
    let supplyRequest;
    try {
        supplyRequest = new SupplyRequest({ supplier_id, supplier_name, supplier_contact, supplier_brandname, status });
        await supplyRequest.save();
    } catch (err) {
        console.log(err);
    }
    if (!supplyRequest) return res.status(404).json({ message: "Unable to add supply request" });
    return res.status(200).json({ supplyRequest });
};

// Get supply request by ID
const getbyId = async (req, res, next) => {
    const id = req.params.id;
    let supplyRequest;
    try {
        supplyRequest = await SupplyRequest.findById(id);
    } catch (err) {
        console.log(err);
    }
    if (!supplyRequest) return res.status(404).json({ message: "Supply request not found" });
    return res.status(200).json({ supplyRequest });
};

// Update supply request
const updateSupplyRequest = async (req, res, next) => {
    const id = req.params.id;
    const { supplier_id, supplier_name, supplier_contact, supplier_brandname, status } = req.body;
    let supplyRequest;
    try {
        supplyRequest = await SupplyRequest.findByIdAndUpdate(
            id,
            { supplier_id, supplier_name, supplier_contact, supplier_brandname, status },
            { new: true }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while updating supply request" });
    }
    if (!supplyRequest) return res.status(404).json({ message: "Unable to update supply request" });
    return res.status(200).json({ supplyRequest });
};

// Delete supply request
const deleteSupplyRequest = async (req, res, next) => {
    const id = req.params.id;
    let supplyRequest;
    try {
        supplyRequest = await SupplyRequest.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }
    if (!supplyRequest) return res.status(404).json({ message: "Unable to delete supply request" });
    return res.status(200).json({ supplyRequest });
};

exports.getAllSupplyRequests = getAllSupplyRequests;
exports.addSupplyRequest = addSupplyRequest;
exports.getbyId = getbyId;
exports.updateSupplyRequest = updateSupplyRequest;
exports.deleteSupplyRequest = deleteSupplyRequest;