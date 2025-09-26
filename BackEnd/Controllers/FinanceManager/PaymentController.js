const mongoose = require('mongoose');
const Payment = require('../../Model/UserModel/PaymentModel');
const User = require('../../Model/UserModel');
const Product = require('../../Model/FinanceManager/ItemModel');
// Conditionally import Invoice model
let Invoice;
try {
  Invoice = require('../../Model/InvoiceModel');
} catch (error) {
  console.warn('⚠️ Invoice model not found. Skipping invoice_id population.');
}

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    console.log('📥 Fetching all payments...');
    let query = Payment.find()
      .populate('userId', 'firstName lastName email')
      .populate('itemId', 'serial_number item_name');

    if (Invoice) {
      query = query.populate('invoice_id');
    }

    const payments = await query.lean();
    console.log('📦 Payments fetched:', payments.length);

    const paymentsWithCustomer = payments.map(payment => {
      if (!payment.userId) {
        console.warn(`⚠️ No user found for payment ${payment.payment_id}, userId: ${payment.userId}`);
        return {
          ...payment,
          customer_id: { firstName: 'Unknown', lastName: '', email: '' }
        };
      }
      return {
        ...payment,
        customer_id: {
          firstName: payment.userId.firstName || 'Unknown',
          lastName: payment.userId.lastName || '',
          email: payment.userId.email || ''
        }
      };
    });

    console.log('✅ Fetched all payments:', paymentsWithCustomer.length);
    res.json(paymentsWithCustomer);
  } catch (error) {
    console.error('❌ Error fetching payments:', error.message, error.stack);
    res.status(500).json({ message: 'Server error while fetching payments', error: error.message });
  }
};

// Update payment status (restricted to finance managers)
const updatePaymentStatus = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const { status } = req.body;
    console.log('📝 Updating payment status:', payment_id, status);

    if (!['Pending', 'Paid', 'Failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const payment = await Payment.findOneAndUpdate(
      { payment_id },
      { status },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    console.log('✅ Payment status updated:', payment_id, status);
    res.json({ message: 'Payment status updated', payment });
  } catch (error) {
    console.error('❌ Payment status update error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a payment (status always set to Pending)
const createPayment = async (req, res) => {
  let payment_id;
  try {
    const {
      payment_id: pid,
      invoice_id,
      userId,
      itemId,
      payment_method,
      amount,
      payment_date,
      reference_no
    } = req.body;

    payment_id = pid;
    console.log('📥 Creating payment:', payment_id, req.body);

    // Validate required fields
    if (!payment_id || !invoice_id || !userId || !payment_method || !amount) {
      return res.status(400).json({
        message: 'Missing required fields: payment_id, invoice_id, userId, payment_method, and amount are required'
      });
    }

    // Validate payment_method
    if (payment_method !== 'Bank Transfer') {
      return res.status(400).json({ message: 'Invalid payment_method. Must be "Bank Transfer"' });
    }

    // Validate ObjectId fields
    if (!mongoose.Types.ObjectId.isValid(invoice_id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid invoice_id or userId format' });
    }
    if (itemId && Array.isArray(itemId)) {
      for (const id of itemId) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: `Invalid itemId: ${id}` });
        }
      }
    }

    // Verify userId exists
    const user = await User.findById(userId).select('firstName lastName email').lean();
    if (!user) {
      console.warn(`⚠️ User not found for userId: ${userId}`);
      return res.status(400).json({ message: `User with ID ${userId} not found` });
    }

    // Create new payment with status always set to Pending
    const newPayment = new Payment({
      payment_id,
      invoice_id,
      userId,
      itemId: itemId || [],
      payment_method,
      amount,
      payment_date: payment_date || Date.now(),
      reference_no: reference_no || null,
      status: 'Pending'
    });

    // Save to database
    await newPayment.save();
    console.log('💾 Payment saved:', payment_id);

    // Populate references for response
    let populatedPaymentQuery = Payment.findOne({ payment_id })
      .populate('userId', 'firstName lastName email')
      .populate('itemId', 'serial_number item_name');

    if (Invoice) {
      populatedPaymentQuery = populatedPaymentQuery.populate('invoice_id');
    }

    const populatedPayment = await populatedPaymentQuery.lean();
    if (!populatedPayment.userId) {
      console.warn(`⚠️ Failed to populate userId for payment ${payment_id}`);
      populatedPayment.userId = { firstName: 'Unknown', lastName: '', email: '' };
    }

    // Add customer_id field to match getAllPayments
    const paymentWithCustomer = {
      ...populatedPayment,
      customer_id: {
        firstName: populatedPayment.userId.firstName || 'Unknown',
        lastName: populatedPayment.userId.lastName || '',
        email: populatedPayment.userId.email || ''
      }
    };

    console.log('✅ Payment created and populated:', payment_id);
    res.status(201).json({ message: 'Payment created successfully', payment: paymentWithCustomer });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[duplicateField];
      console.error('❌ Duplicate field:', duplicateField, 'value:', duplicateValue);
      return res.status(400).json({
        message: `Duplicate ${duplicateField}: ${duplicateValue} already exists`,
        error: error.message
      });
    }
    console.error('❌ Error creating payment:', error.message, error.stack);
    res.status(400).json({ message: 'Error creating payment', error: error.message });
  }
};

module.exports = { getAllPayments, updatePaymentStatus, createPayment };