const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
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
  }],
  files: [{
    name: String,
    size: Number,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    path: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  modifiedAt: {
    type: Date,
    default: Date.now
  }
});

// Update modifiedAt on every save
CustomerSchema.pre('save', function(next) {
  this.modifiedAt = new Date();
  next();
});

module.exports = mongoose.model('Customer', CustomerSchema);
