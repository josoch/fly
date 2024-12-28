const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// Get all transactions with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      type,
      startDate,
      endDate,
      status,
      account,
      search
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (account) query.account = account;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { voucherNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query)
      .populate('account', 'code name')
      .sort({ date: -1, voucherNumber: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('account', 'code name');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    // Generate voucher number
    const voucherNumber = await Transaction.generateVoucherNumber(req.body.type);
    
    // Validate account exists
    const account = await Account.findById(req.body.account);
    if (!account) {
      return res.status(400).json({ message: 'Invalid account' });
    }

    const transaction = new Transaction({
      ...req.body,
      voucherNumber
    });

    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Don't allow changing voucher number or type
    delete req.body.voucherNumber;
    delete req.body.type;

    // If account is being changed, validate new account
    if (req.body.account && req.body.account !== transaction.account.toString()) {
      const account = await Account.findById(req.body.account);
      if (!account) {
        return res.status(400).json({ message: 'Invalid account' });
      }
    }

    // Update allowed fields
    Object.keys(req.body).forEach(key => {
      transaction[key] = req.body[key];
    });

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete transaction (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.isActive = false;
    await transaction.save();
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post transaction
router.post('/:id/post', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft transactions can be posted' });
    }

    transaction.status = 'Posted';
    const postedTransaction = await transaction.save();
    res.json(postedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Void transaction
router.post('/:id/void', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status === 'Void') {
      return res.status(400).json({ message: 'Transaction is already voided' });
    }

    transaction.status = 'Void';
    const voidedTransaction = await transaction.save();
    res.json(voidedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
