const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
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
  type: {
    type: String,
    default: 'Payment'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
