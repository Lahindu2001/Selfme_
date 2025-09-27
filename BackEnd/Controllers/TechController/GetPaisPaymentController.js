const Payment = require("../../Model/UserModel/PaymentModel");

// Get all paid payments
const getAllPaidPayments = async (req, res, next) => {
    let payments;
    try {
        payments = await Payment.find({ status: 'Paid' })
            .populate('invoice_id', 'invoice_number')
            .populate('userId', 'firstName lastName')
            .populate('itemId', 'name price');
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching paid payments" });
    }
    if (!payments || payments.length === 0) {
        return res.status(404).json({ message: "No paid payments found" });
    }
    return res.status(200).json({ payments });
};

// Get paid payment by ID
const getById = async (req, res, next) => {
    const id = req.params.id;
    let payment;
    try {
        payment = await Payment.findOne({ _id: id, status: 'Paid' })
            .populate('invoice_id', 'invoice_number')
            .populate('userId', 'firstName lastName')
            .populate('itemId', 'name price');
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching payment" });
    }
    if (!payment) {
        return res.status(404).json({ message: "Paid payment not found" });
    }
    return res.status(200).json({ payment });
};

exports.getAllPaidPayments = getAllPaidPayments;
exports.getById = getById;