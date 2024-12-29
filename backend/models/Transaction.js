const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Receipt', 'Payment', 'Invoice', 'Bill'],
    trim: true
  },
  transactionNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  voucherNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  reference: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Check', 'Credit Card', 'Other'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Posted', 'Void'],
    default: 'Draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // For soft delete
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update timestamps before saving
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for common queries
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ voucherNumber: 1 }, { unique: true });
transactionSchema.index({ account: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionNumber: 1 }, { unique: true });

// Virtual field for formatted date
transactionSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Method to generate next voucher number
transactionSchema.statics.generateVoucherNumber = async function(type) {
  const prefix = type.charAt(0); // R for Receipt, P for Payment, etc.
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  // Find the last voucher number for this type and month
  const lastTransaction = await this.findOne({
    type: type,
    voucherNumber: new RegExp(`^${prefix}${currentYear}${currentMonth}`)
  }).sort({ voucherNumber: -1 });

  let sequence = '0001';
  if (lastTransaction) {
    const lastSequence = parseInt(lastTransaction.voucherNumber.slice(-4));
    sequence = (lastSequence + 1).toString().padStart(4, '0');
  }

  return `${prefix}${currentYear}${currentMonth}${sequence}`;
};

// Method to generate next transaction number
transactionSchema.statics.generateTransactionNumber = async function() {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  // Find the last transaction number for this month
  const lastTransaction = await this.findOne({
    transactionNumber: new RegExp(`^TXN${currentYear}${currentMonth}`)
  }).sort({ transactionNumber: -1 });

  let sequence = '0001';
  if (lastTransaction) {
    const lastSequence = parseInt(lastTransaction.transactionNumber.slice(-4));
    sequence = (lastSequence + 1).toString().padStart(4, '0');
  }

  return `TXN${currentYear}${currentMonth}${sequence}`;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
