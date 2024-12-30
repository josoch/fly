const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Import routes
const customerRoutes = require('./routes/customers');
const supplierRoutes = require('./routes/suppliers');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const receiptRoutes = require('./routes/receipts');
const paymentRoutes = require('./routes/payments');

// Import models
const Transaction = require('./models/Transaction');
const Payment = require('./models/Payment');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log ALL requests
app.use((req, res, next) => {
  console.log('-------------------------');
  console.log(`[Server] ${req.method} ${req.originalUrl}`);
  console.log('[Server] Headers:', req.headers);
  console.log('[Server] Body:', req.body);
  console.log('-------------------------');
  next();
});

// Health check endpoint (must be before /api routes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount routes
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  console.error('[Server] Route not found:', {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query
  });
  res.status(404).json({ 
    message: 'Route not found',
    requestedUrl: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/health',
      '/api/health',
      '/api/customers',
      '/api/suppliers',
      '/api/accounts',
      '/api/transactions',
      '/api/receipts',
      '/api/payments',
      '/api/payments/next-number',
      '/api/transactions/next-number'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB
const connectWithRetry = async () => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fly');
      console.log('MongoDB connected successfully');
      break;
    } catch (error) {
      console.error(`Failed to connect to MongoDB (attempt ${retries + 1}/${maxRetries}):`, error);
      retries++;
      if (retries === maxRetries) {
        console.error('Max retries reached. Could not connect to MongoDB');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Connect to MongoDB with retry logic
connectWithRetry();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- /health');
  console.log('- /api/health');
  console.log('- /api/customers');
  console.log('- /api/suppliers');
  console.log('- /api/accounts');
  console.log('- /api/transactions');
  console.log('- /api/receipts');
  console.log('- /api/payments');
  console.log('- /api/payments/next-number');
  console.log('- /api/transactions/next-number');
});

module.exports = app;
