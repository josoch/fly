const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  accountCode: {
    type: String,
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  companyRegNumber: String,
  balance: {
    type: Number,
    default: 0
  },
  inactive: {
    type: Boolean,
    default: false
  },
  street1: String,
  street2: String,
  town: String,
  county: String,
  postCode: String,
  country: {
    type: String,
    default: 'Nigeria'
  },
  vatNumber: String,
  contactName: String,
  tradeContact: String,
  telephone: String,
  mobile: String,
  website: String,
  twitter: String,
  facebook: String,
  email1: String,
  email2: String,
  sendViaEmail: {
    type: Boolean,
    default: false
  },
  notes: [{
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', SupplierSchema);
