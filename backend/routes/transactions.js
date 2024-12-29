const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ storage: multer.memoryStorage() });
const Receipt = require('../models/Receipt'); // Assuming Receipt model is defined in this file

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Transactions Route] ${req.method} ${req.path}`);
  next();
});

// Generate next transaction number - must be before any :id routes
router.get('/next-number', async (req, res) => {
  console.log('[Transactions Route] Generating next transaction number');
  try {
    // Find the highest transaction number from both collections
    const [lastTransaction, lastReceipt] = await Promise.all([
      Transaction.findOne().sort({ transactionNumber: -1 }),
      Receipt.findOne().sort({ transactionNumber: -1 })
    ]);

    let nextNumber = 1;
    const extractNumber = (str) => {
      const match = str && str.match(/TXN(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    // Get the highest number from either collection
    const lastTransactionNum = extractNumber(lastTransaction?.transactionNumber);
    const lastReceiptNum = extractNumber(lastReceipt?.transactionNumber);
    nextNumber = Math.max(lastTransactionNum, lastReceiptNum) + 1;

    // Keep trying until we find an unused number
    let transactionNumber;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops

    while (!isUnique && attempts < maxAttempts) {
      transactionNumber = `TXN${nextNumber.toString().padStart(4, '0')}`;
      console.log(`[Transactions Route] Trying transaction number: ${transactionNumber}`);
      
      // Check both collections for this number
      const [existingTransaction, existingReceipt] = await Promise.all([
        Transaction.findOne({ transactionNumber }),
        Receipt.findOne({ transactionNumber })
      ]);

      if (!existingTransaction && !existingReceipt) {
        isUnique = true;
        console.log(`[Transactions Route] Found unique transaction number: ${transactionNumber}`);
      } else {
        nextNumber++;
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Could not generate unique transaction number after maximum attempts');
    }

    res.json({ transactionNumber });
  } catch (error) {
    console.error('[Transactions Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all transactions with optional filters
router.get('/', async (req, res) => {
  console.log('[Transactions Route] Retrieving transactions');
  try {
    const {
      type,
      startDate,
      endDate,
      status,
      account,
      search
    } = req.query;

    // Build query for transactions
    const transactionQuery = { isActive: true };
    const receiptQuery = {};

    if (type) {
      transactionQuery.type = type;
      if (type === 'Receipt') {
        // Only fetch receipts if type is Receipt or not specified
        receiptQuery.type = type;
      } else {
        // If another type is specified, don't fetch receipts
        receiptQuery.type = 'none';
      }
    }
    
    if (status) {
      transactionQuery.status = status;
      receiptQuery.status = status;
    }
    if (account) {
      transactionQuery.account = account;
      receiptQuery.account = account;
    }

    if (startDate || endDate) {
      transactionQuery.date = {};
      receiptQuery.date = {};
      if (startDate) {
        transactionQuery.date.$gte = new Date(startDate);
        receiptQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        transactionQuery.date.$lte = new Date(endDate);
        receiptQuery.date.$lte = new Date(endDate);
      }
    }

    if (search) {
      transactionQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { transactionNumber: { $regex: search, $options: 'i' } },
        { voucherNumber: { $regex: search, $options: 'i' } }
      ];
      receiptQuery.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { transactionNumber: { $regex: search, $options: 'i' } },
        { voucherNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch both transactions and receipts
    const [transactions, receipts] = await Promise.all([
      Transaction.find(transactionQuery)
        .sort({ date: -1, transactionNumber: -1 })
        .populate('account')
        .populate('bank'),
      Receipt.find(receiptQuery)
        .sort({ date: -1, transactionNumber: -1 })
        .populate('account')
        .populate('bank')
    ]);

    // Transform receipts to match transaction format
    const transformedReceipts = receipts.map(receipt => ({
      _id: receipt._id,
      type: receipt.type,
      transactionNumber: receipt.transactionNumber,
      voucherNumber: receipt.voucherNumber,
      date: receipt.date,
      reference: receipt.reference,
      name: receipt.customerName,
      account: receipt.account,
      bank: receipt.bank,
      description: receipt.description,
      paymentMethod: receipt.paymentMethod,
      amount: receipt.amount,
      status: receipt.status,
      isActive: true
    }));

    // Combine and sort all transactions
    const allTransactions = [...transactions, ...transformedReceipts].sort((a, b) => 
      new Date(b.date) - new Date(a.date) || 
      b.transactionNumber.localeCompare(a.transactionNumber)
    );

    res.json(allTransactions);
  } catch (error) {
    console.error('[Transactions Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single transaction
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
  console.log(`[Transactions Route] Retrieving transaction ${req.params.id}`);
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('account')
      .populate('bank');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('[Transactions Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create transaction
router.post('/', async (req, res) => {
  console.log('[Transactions Route] Creating transaction');
  try {
    // Ensure unique transaction number
    let { transactionNumber } = req.body;
    const existingTransaction = await Transaction.findOne({ transactionNumber });
    if (existingTransaction) {
      // Generate a new unique number
      const lastTransaction = await Transaction.findOne()
        .sort({ transactionNumber: -1 });

      let nextNumber = 1;
      if (lastTransaction && lastTransaction.transactionNumber) {
        const match = lastTransaction.transactionNumber.match(/TXN(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      transactionNumber = `TXN${nextNumber.toString().padStart(4, '0')}`;
    }

    const transaction = new Transaction({
      ...req.body,
      transactionNumber
    });

    const newTransaction = await transaction.save();
    console.log(`[Transactions Route] Created transaction ${newTransaction._id}`);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('[Transactions Route] Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update transaction
router.put('/:id([0-9a-fA-F]{24})', async (req, res) => {
  console.log(`[Transactions Route] Updating transaction ${req.params.id}`);
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    Object.assign(transaction, req.body);
    const updatedTransaction = await transaction.save();
    console.log(`[Transactions Route] Updated transaction ${updatedTransaction._id}`);
    res.json(updatedTransaction);
  } catch (error) {
    console.error('[Transactions Route] Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete transaction (soft delete)
router.delete('/:id([0-9a-fA-F]{24})', async (req, res) => {
  console.log(`[Transactions Route] Deleting transaction ${req.params.id}`);
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.isActive = false;
    await transaction.save();
    console.log(`[Transactions Route] Soft deleted transaction ${req.params.id}`);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('[Transactions Route] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Post transaction
router.post('/:id([0-9a-fA-F]{24})/post', async (req, res) => {
  console.log(`[Transactions Route] Posting transaction ${req.params.id}`);
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      console.log(`[Transactions Route] Transaction ${req.params.id} not found`);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'Draft') {
      console.log(`[Transactions Route] Transaction ${req.params.id} is not in draft status`);
      return res.status(400).json({ message: 'Only draft transactions can be posted' });
    }

    transaction.status = 'Posted';
    const postedTransaction = await transaction.save();
    console.log(`[Transactions Route] Posted transaction ${req.params.id}`);
    res.json(postedTransaction);
  } catch (error) {
    console.error('[Transactions Route] Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Void transaction
router.post('/:id([0-9a-fA-F]{24})/void', async (req, res) => {
  console.log(`[Transactions Route] Voiding transaction ${req.params.id}`);
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      console.log(`[Transactions Route] Transaction ${req.params.id} not found`);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status === 'Void') {
      console.log(`[Transactions Route] Transaction ${req.params.id} is already voided`);
      return res.status(400).json({ message: 'Transaction is already voided' });
    }

    transaction.status = 'Void';
    const voidedTransaction = await transaction.save();
    console.log(`[Transactions Route] Voided transaction ${req.params.id}`);
    res.json(voidedTransaction);
  } catch (error) {
    console.error('[Transactions Route] Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Import transactions from file
router.post('/import', upload.single('file'), async (req, res) => {
  console.log('[Transactions Route] Importing transactions from file');
  try {
    if (!req.file) {
      console.log('[Transactions Route] No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const importedTransactions = [];

    for (const row of data) {
      // Generate transaction and voucher numbers
      const transactionNumber = await Transaction.generateTransactionNumber();
      const voucherNumber = await Transaction.generateVoucherNumber(row.type);

      console.log(`[Transactions Route] Generated transaction number: ${transactionNumber}`);
      console.log(`[Transactions Route] Generated voucher number: ${voucherNumber}`);

      // Create transaction
      const transaction = new Transaction({
        transactionNumber,
        voucherNumber,
        type: row.type,
        date: row.date ? new Date(row.date) : new Date(),
        reference: row.reference,
        name: row.name,
        account: row.account,
        bank: row.bank,
        description: row.description,
        paymentMethod: row.paymentMethod,
        amount: row.amount,
        status: 'Draft'
      });

      const savedTransaction = await transaction.save();
      importedTransactions.push(savedTransaction);
    }

    console.log(`[Transactions Route] Imported ${importedTransactions.length} transactions`);
    res.status(201).json({
      message: `Successfully imported ${importedTransactions.length} transactions`,
      transactions: importedTransactions
    });
  } catch (error) {
    console.error('[Transactions Route] Error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
