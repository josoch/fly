const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  voucherNumber: {
    type: String,
    required: true,
    unique: true
  },
  transactionNumber: {
    type: String,
    required: true,
    unique: true
  },
  reference: String,
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true
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
  description: String,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Money', 'Other']
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Draft', 'Pending', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  type: {
    type: String,
    default: 'Receipt'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Receipt', receiptSchema);
