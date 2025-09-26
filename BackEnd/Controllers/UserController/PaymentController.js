const mongoose = require('mongoose');
const Payment = require('../../Model/UserModel/PaymentModel');
const Cart = require('../../Model/UserModel/CartModel');
const Product = require('../../Model/UserModel/PaymentModel');
const Invoice = require('../../Model/UserModel/InvoiceModel');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const createPayment = async (req, res) => {
  try {
    const { amount, payment_method, payment_date, status } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, "your_jwt_secret_key_here");
    const userId = decoded.userId;

    // Validate cart items
    const cartItems = await Cart.find({ userId, receipt: null }).populate({
      path: 'itemId',
      select: 'item_name selling_price item_image',
    });
    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total from cart
    const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const taxAmount = Math.round(totalAmount * 0.085);
    const expectedTotal = totalAmount + taxAmount;

    if (Number(amount) !== expectedTotal) {
      return res.status(400).json({ message: "Payment amount does not match cart total" });
    }

    // Create invoice
    const invoice = new Invoice({
      userId,
      items: cartItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })),
      total: totalAmount,
      tax: taxAmount,
      grandTotal: expectedTotal,
    });
    await invoice.save();

    let reference_no = null;
    if (payment_method === "Bank Transfer" && !req.file) {
      throw new Error("Bank transfer slip is required");
    }
    if (req.file) {
      reference_no = `/uploads/${req.file.filename}`;
    }

    const payment = new Payment({
      payment_id: uuidv4(),
      invoice_id: invoice._id,
      userId,
      itemId: cartItems.map(item => item.itemId._id), // Add itemIds from cart
      payment_method,
      amount,
      payment_date: payment_date ? new Date(payment_date) : new Date(),
      reference_no,
      status,
    });

    console.log("Saving payment:", {
      payment_id: payment.payment_id,
      invoice_id: invoice._id.toString(),
      itemId: payment.itemId.map(id => id.toString()),
      amount,
      payment_method,
      status,
      userId: userId.toString(),
    });

    await payment.save();

    // Update cart items to associate with this invoice
    await Cart.updateMany({ userId, receipt: null }, { receipt: invoice._id });

    console.log("✅ Payment created:", payment.payment_id);
    res.status(201).json({ message: "Payment created successfully", payment });
  } catch (error) {
    console.error("❌ Payment creation error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
    });
    if (error.code === 11000) {
      return res.status(400).json({ message: "Payment ID already exists" });
    }
    res.status(400).json({ message: "Error creating payment", error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const { status } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { payment_id },
      { status },
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    console.log("✅ Payment status updated:", payment_id, status);
    res.json({ message: "Payment status updated", payment });
  } catch (error) {
    console.error("❌ Payment status update error:", error);
    res.status(400).json({ message: "Error updating payment status", error: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, "your_jwt_secret_key_here");
    const userId = decoded.userId;

    const payments = await Payment.find({ userId })
      .populate({
        path: 'invoice_id',
        populate: {
          path: 'items.itemId',
          model: 'Product',
          select: 'item_name item_image',
        },
      })
      .populate({
        path: 'itemId',
        model: 'Product',
        select: 'item_name item_image',
      });
    res.json(payments);
  } catch (error) {
    console.error("❌ Get payments error:", error);
    res.status(400).json({ message: "Error fetching payments", error: error.message });
  }
};

module.exports = { createPayment, updatePaymentStatus, getPayments };