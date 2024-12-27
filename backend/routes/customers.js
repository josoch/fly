const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const multer = require('multer');
const path = require('path');
const upload = require('../middleware/upload');
const { processFile, validateFields } = require('../utils/fileImport');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const uploadFile = multer({ storage: storage });

// Get all customers
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all customers');
    const customers = await Customer.find();
    console.log(`Found ${customers.length} customers`);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching customer by ID:', req.params.id);
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      console.log('Customer not found:', req.params.id);
      return res.status(404).json({ message: 'Customer not found' });
    }
    console.log('Found customer:', customer);
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    console.log('Received customer data:', req.body);

    // Validate required fields
    if (!req.body.accountCode || !req.body.companyName) {
      console.log('Validation failed: Account code and company name are required');
      return res.status(400).json({ message: 'Account code and company name are required' });
    }

    // Check for duplicate account code
    if (req.body.accountCode) {
      const existingCustomer = await Customer.findOne({ accountCode: req.body.accountCode });
      if (existingCustomer) {
        console.log('Duplicate account code found:', req.body.accountCode);
        return res.status(400).json({ message: 'Account code already exists' });
      }
    }

    const customer = new Customer(req.body);
    console.log('Created customer model:', customer);

    const savedCustomer = await customer.save();
    console.log('Successfully saved customer:', savedCustomer);

    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error('Error creating customer:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate key error',
        field: Object.keys(error.keyPattern)[0]
      });
    }

    res.status(500).json({ 
      message: 'Error creating customer',
      error: error.message
    });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating customer:', req.params.id);
    console.log('Update data:', req.body);

    if (!req.body.accountCode || !req.body.companyName) {
      console.log('Validation failed: Account code and company name are required');
      return res.status(400).json({ message: 'Account code and company name are required' });
    }

    // Check for duplicate account code, excluding current customer
    if (req.body.accountCode) {
      const existingCustomer = await Customer.findOne({ 
        accountCode: req.body.accountCode,
        _id: { $ne: req.params.id }
      });
      if (existingCustomer) {
        console.log('Duplicate account code found:', req.body.accountCode);
        return res.status(400).json({ message: 'Account code already exists' });
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      console.log('Customer not found for update:', req.params.id);
      return res.status(404).json({ message: 'Customer not found' });
    }

    console.log('Successfully updated customer:', customer);
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting customer:', req.params.id);
    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      console.log('Customer not found for deletion:', req.params.id);
      return res.status(404).json({ message: 'Customer not found' });
    }

    console.log('Successfully deleted customer:', customer);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
});

// Add note to customer
router.post('/:id/notes', async (req, res) => {
  try {
    console.log('Adding note to customer:', req.params.id);
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      console.log('Customer not found:', req.params.id);
      return res.status(404).json({ message: 'Customer not found' });
    }
    customer.notes.push(req.body);
    const updatedCustomer = await customer.save();
    console.log('Successfully added note to customer:', updatedCustomer);
    res.status(201).json(updatedCustomer);
  } catch (error) {
    console.error('Error adding note to customer:', error);
    res.status(400).json({ message: 'Error adding note to customer', error: error.message });
  }
});

// Upload file for customer
router.post('/:id/files', uploadFile.single('file'), async (req, res) => {
  try {
    console.log('Uploading file for customer:', req.params.id);
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      console.log('Customer not found:', req.params.id);
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const file = {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      path: req.file.path
    };
    
    customer.files.push(file);
    const updatedCustomer = await customer.save();
    console.log('Successfully uploaded file for customer:', updatedCustomer);
    res.status(201).json(updatedCustomer);
  } catch (error) {
    console.error('Error uploading file for customer:', error);
    res.status(400).json({ message: 'Error uploading file for customer', error: error.message });
  }
});

// Import customers from file
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Processing import file:', req.file.originalname);
    const fileType = req.file.originalname.split('.').pop().toLowerCase();
    if (!['csv', 'xls', 'xlsx'].includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type. Only CSV and Excel files are allowed.' });
    }

    // Process the file
    const data = await processFile(req.file.path, fileType);
    console.log('Processed data:', data);

    // Validate required fields
    const requiredFields = ['accountCode', 'companyName'];
    const validationErrors = validateFields(data, requiredFields);
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({
        message: 'Validation errors in imported data',
        errors: validationErrors
      });
    }

    // Check for duplicate account codes and import data
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const item of data) {
      try {
        // Skip empty rows
        if (!item.accountCode && !item.companyName) {
          continue;
        }

        // Validate required fields for this row
        if (!item.accountCode || !item.companyName) {
          results.failed++;
          results.errors.push(`Missing required fields for row: ${JSON.stringify(item)}`);
          continue;
        }

        const existingCustomer = await Customer.findOne({ 
          accountCode: item.accountCode.toString().trim() 
        });
        
        if (existingCustomer) {
          results.failed++;
          results.errors.push(`Account code ${item.accountCode} already exists`);
          continue;
        }

        const customer = new Customer({
          ...item,
          accountCode: item.accountCode.toString().trim(),
          companyName: item.companyName.toString().trim()
        });

        await customer.save();
        results.success++;
      } catch (error) {
        console.error('Error saving customer:', error);
        results.failed++;
        results.errors.push(`Error saving customer with account code ${item.accountCode}: ${error.message}`);
      }
    }

    console.log('Import results:', results);
    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Error processing import:', error);
    res.status(500).json({
      message: 'Error processing import',
      error: error.message
    });
  }
});

module.exports = router;
