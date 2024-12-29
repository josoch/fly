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

// Mount routes
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/receipts', receiptRoutes);

// Mount payment routes - ensure this is before the 404 handler
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dbName: mongoose.connection.name
  });
});

// Catch-all route for debugging 404s
app.use((req, res) => {
  console.error(`[Server] 404 Not Found: ${req.method} ${req.originalUrl}`);
  console.error('[Server] Available routes:');
  console.error('- /api/customers');
  console.error('- /api/suppliers');
  console.error('- /api/accounts');
  console.error('- /api/transactions');
  console.error('- /api/receipts');
  console.error('- /api/transactions/next-number');
  console.error('- /api/payments/next-number');
  console.error('- /api/payments');
  console.error('- /health');
  res.status(404).json({ 
    message: 'Route not found',
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Start server
const port = process.env.PORT || 5000;

// Connect to MongoDB first, then start the server
connectWithRetry().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Available routes:');
    console.log('- /api/customers');
    console.log('- /api/suppliers');
    console.log('- /api/accounts');
    console.log('- /api/transactions');
    console.log('- /api/receipts');
    console.log('- /api/transactions/next-number');
    console.log('- /api/payments/next-number');
    console.log('- /api/payments');
    console.log('- /health');
  });
}).catch(error => {
  console.error('Failed to start server:', error);
});

module.exports = app;
