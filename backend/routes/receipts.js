const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ storage: multer.memoryStorage() });
const Transaction = require('../models/Transaction'); // Assuming Transaction model is defined in this file

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Receipts Route] ${req.method} ${req.path}`);
  next();
});

// Generate next receipt number
router.get('/next-number', async (req, res) => {
  console.log('[Receipts Route] Generating next receipt number');
  try {
    // Find the last receipt with any voucher number
    const lastReceipt = await Receipt.findOne()
      .sort({ voucherNumber: -1 });

    let nextNumber = 1;
    if (lastReceipt && lastReceipt.voucherNumber) {
      // Extract the number from the voucher number (assuming format RCP0001)
      const match = lastReceipt.voucherNumber.match(/RCP(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // Keep trying until we find an unused number
    let voucherNumber;
    let isUnique = false;
    while (!isUnique) {
      voucherNumber = `RCP${nextNumber.toString().padStart(4, '0')}`;
      // Check if this number is already in use
      const existing = await Receipt.findOne({ voucherNumber });
      if (!existing) {
        isUnique = true;
      } else {
        nextNumber++;
      }
    }

    console.log(`[Receipts Route] Generated unique voucher number: ${voucherNumber}`);
    res.json({ voucherNumber });
  } catch (error) {
    console.error('[Receipts Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all receipts with optional filters
router.get('/', async (req, res) => {
  console.log('[Receipts Route] Retrieving receipts');
  try {
    const {
      startDate,
      endDate,
      status,
      customerId,
      search
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { voucherNumber: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    const receipts = await Receipt.find(query)
      .sort({ date: -1, voucherNumber: -1 })
      .populate('customerId')
      .populate('account')
      .populate('bank');

    res.json(receipts);
  } catch (error) {
    console.error('[Receipts Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single receipt
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
  console.log(`[Receipts Route] Retrieving receipt ${req.params.id}`);
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('customerId')
      .populate('account')
      .populate('bank');

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(receipt);
  } catch (error) {
    console.error('[Receipts Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create receipt
router.post('/', async (req, res) => {
  console.log('[Receipts Route] Creating receipt');
  try {
    let { transactionNumber, voucherNumber } = req.body;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 1000;

    while (!isUnique && attempts < maxAttempts) {
      // Check for duplicates in both collections
      const [existingReceipt, existingTransaction] = await Promise.all([
        Receipt.findOne({ 
          $or: [
            { transactionNumber },
            { voucherNumber }
          ]
        }),
        Transaction.findOne({ transactionNumber })
      ]);

      if (!existingReceipt && !existingTransaction) {
        isUnique = true;
        console.log('[Receipts Route] Numbers are unique:', { transactionNumber, voucherNumber });
      } else {
        console.log('[Receipts Route] Duplicate found, generating new numbers...');
        
        // Generate new transaction number
        const [lastReceipt, lastTransaction] = await Promise.all([
          Receipt.findOne().sort({ transactionNumber: -1 }),
          Transaction.findOne().sort({ transactionNumber: -1 })
        ]);

        const extractNumber = (str) => {
          const match = str && str.match(/TXN(\d+)/);
          return match ? parseInt(match[1]) : 0;
        };

        // Get highest number from either collection
        const lastReceiptNum = extractNumber(lastReceipt?.transactionNumber);
        const lastTransactionNum = extractNumber(lastTransaction?.transactionNumber);
        let nextNumber = Math.max(lastReceiptNum, lastTransactionNum) + 1;
        transactionNumber = `TXN${nextNumber.toString().padStart(4, '0')}`;

        // Generate new voucher number if needed
        if (existingReceipt?.voucherNumber === voucherNumber) {
          const lastReceiptWithVoucher = await Receipt.findOne()
            .sort({ voucherNumber: -1 });
          
          let nextVoucherNumber = 1;
          if (lastReceiptWithVoucher?.voucherNumber) {
            const match = lastReceiptWithVoucher.voucherNumber.match(/RCP(\d+)/);
            if (match) {
              nextVoucherNumber = parseInt(match[1]) + 1;
            }
          }
          voucherNumber = `RCP${nextVoucherNumber.toString().padStart(4, '0')}`;
        }

        console.log('[Receipts Route] Generated new numbers:', { 
          transactionNumber, 
          voucherNumber 
        });
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Could not generate unique numbers after maximum attempts');
    }

    // Create the receipt with potentially new numbers
    const receipt = new Receipt({
      ...req.body,
      transactionNumber,
      voucherNumber
    });

    const newReceipt = await receipt.save();
    console.log(`[Receipts Route] Created receipt ${newReceipt._id} with numbers:`, {
      transactionNumber: newReceipt.transactionNumber,
      voucherNumber: newReceipt.voucherNumber
    });
    res.status(201).json(newReceipt);
  } catch (error) {
    console.error('[Receipts Route] Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update receipt
router.put('/:id([0-9a-fA-F]{24})', async (req, res) => {
  console.log(`[Receipts Route] Updating receipt ${req.params.id}`);
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    Object.assign(receipt, req.body);
    const updatedReceipt = await receipt.save();
    console.log(`[Receipts Route] Updated receipt ${updatedReceipt._id}`);
    res.json(updatedReceipt);
  } catch (error) {
    console.error('[Receipts Route] Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete receipt
router.delete('/:id([0-9a-fA-F]{24})', async (req, res) => {
  console.log(`[Receipts Route] Deleting receipt ${req.params.id}`);
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    console.log(`[Receipts Route] Deleted receipt ${req.params.id}`);
    res.json({ message: 'Receipt deleted' });
  } catch (error) {
    console.error('[Receipts Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
