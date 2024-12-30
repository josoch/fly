const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Payments Route] ${req.method} ${req.path}`);
  console.log('[Payments Route] Request body:', req.body);
  next();
});

// Generate next payment number
router.get('/next-number', async (req, res) => {
  console.log('[Payments Route] Generating next payment number');
  try {
    const lastPayment = await Payment.findOne()
      .sort({ voucherNumber: -1 })
      .select('voucherNumber');
    
    let nextNumber = 1;
    if (lastPayment && lastPayment.voucherNumber) {
      const match = lastPayment.voucherNumber.match(/PV(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const voucherNumber = `PV${nextNumber.toString().padStart(4, '0')}`;
    console.log(`[Payments Route] Generated payment number: ${voucherNumber}`);
    res.json({ voucherNumber });
  } catch (error) {
    console.error('[Payments Route] Error generating payment number:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all payments
router.get('/', async (req, res) => {
  console.log('[Payments Route] Retrieving payments');
  try {
    const {
      startDate,
      endDate,
      supplierId,
      search
    } = req.query;

    // Build query
    const query = {};

    if (supplierId) query.supplierId = supplierId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { supplierName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { voucherNumber: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(query)
      .sort({ date: -1, voucherNumber: -1 })
      .populate('supplierId')
      .populate('account')
      .populate('bank');

    res.json(payments);
  } catch (error) {
    console.error('[Payments Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single payment
router.get('/:id', async (req, res) => {
  console.log(`[Payments Route] Retrieving payment ${req.params.id}`);
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('supplierId')
      .populate('account')
      .populate('bank');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('[Payments Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create payment
router.post('/', async (req, res) => {
  console.log('[Payments Route] Creating new payment');
  try {
    const payment = new Payment(req.body);
    const savedPayment = await payment.save();
    console.log(`[Payments Route] Created payment: ${savedPayment._id}`);
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('[Payments Route] Error creating payment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  console.log(`[Payments Route] Updating payment ${req.params.id}`);
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    Object.assign(payment, req.body);
    const updatedPayment = await payment.save();
    console.log(`[Payments Route] Updated payment ${updatedPayment._id}`);
    res.json(updatedPayment);
  } catch (error) {
    console.error('[Payments Route] Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  console.log(`[Payments Route] Deleting payment ${req.params.id}`);
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    console.log(`[Payments Route] Deleted payment ${payment._id}`);
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('[Payments Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
