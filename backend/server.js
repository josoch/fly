const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const customerRoutes = require('./routes/customers');
const supplierRoutes = require('./routes/suppliers');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, 
    req.method === 'POST' || req.method === 'PUT' ? req.body : ''
  );
  next();
});

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dbName: mongoose.connection.name
  });
});

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Please check:');
      console.error('1. Your network connection');
      console.error('2. MongoDB Atlas username and password');
      console.error('3. IP whitelist settings in MongoDB Atlas');
    }
    console.log('Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Initial connection
connectWithRetry();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
