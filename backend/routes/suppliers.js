const express = require('express');
const router = express.Router();
const Supplier = require('../models/supplier');
const upload = require('../middleware/upload');
const { processFile, validateFields } = require('../utils/fileImport');

// Error handler middleware
const handleError = (res, error, defaultMessage) => {
  console.error(defaultMessage, error);
  const statusCode = error.name === 'ValidationError' ? 400 : 500;
  const message = error.name === 'ValidationError' 
    ? Object.values(error.errors).map(err => err.message)
    : error.message;
  
  res.status(statusCode).json({
    message: defaultMessage,
    error: message
  });
};

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all suppliers');
    const suppliers = await Supplier.find();
    console.log(`Found ${suppliers.length} suppliers`);
    res.json(suppliers);
  } catch (error) {
    handleError(res, error, 'Error fetching suppliers');
  }
});

// Get single supplier
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching supplier by ID:', req.params.id);
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      console.log('Supplier not found:', req.params.id);
      return res.status(404).json({ message: 'Supplier not found' });
    }
    console.log('Found supplier:', supplier);
    res.json(supplier);
  } catch (error) {
    handleError(res, error, 'Error fetching supplier');
  }
});

// Create supplier
router.post('/', async (req, res) => {
  try {
    console.log('Received supplier data:', req.body);

    // Validate required fields
    if (!req.body.accountCode || !req.body.companyName) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Account code and company name are required'
      });
    }

    // Check for duplicate account code
    const existingSupplier = await Supplier.findOne({ accountCode: req.body.accountCode });
    if (existingSupplier) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Account code must be unique'
      });
    }

    const supplier = new Supplier(req.body);
    console.log('Created supplier model:', supplier);

    const savedSupplier = await supplier.save();
    console.log('Successfully saved supplier:', savedSupplier);

    res.status(201).json(savedSupplier);
  } catch (error) {
    console.error('Error creating supplier:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      message: 'Error creating supplier',
      error: error.message
    });
  }
});

// Import suppliers from file
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

        const existingSupplier = await Supplier.findOne({ 
          accountCode: item.accountCode.toString().trim() 
        });
        
        if (existingSupplier) {
          results.failed++;
          results.errors.push(`Account code ${item.accountCode} already exists`);
          continue;
        }

        const supplier = new Supplier({
          ...item,
          accountCode: item.accountCode.toString().trim(),
          companyName: item.companyName.toString().trim()
        });

        await supplier.save();
        results.success++;
      } catch (error) {
        console.error('Error saving supplier:', error);
        results.failed++;
        results.errors.push(`Error saving supplier with account code ${item.accountCode}: ${error.message}`);
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

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating supplier:', req.params.id);

    // Validate required fields
    if (!req.body.accountCode || !req.body.companyName) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Account code and company name are required'
      });
    }

    // Check for duplicate account code, excluding current supplier
    if (req.body.accountCode) {
      const existingSupplier = await Supplier.findOne({ 
        accountCode: req.body.accountCode,
        _id: { $ne: req.params.id }
      });
      if (existingSupplier) {
        return res.status(400).json({
          message: 'Validation error',
          error: 'Account code must be unique'
        });
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      console.log('Supplier not found for update:', req.params.id);
      return res.status(404).json({ message: 'Supplier not found' });
    }

    console.log('Successfully updated supplier:', supplier);
    res.json(supplier);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({ message: 'Error updating supplier', error: error.message });
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting supplier:', req.params.id);
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Error deleting supplier');
  }
});

module.exports = router;
