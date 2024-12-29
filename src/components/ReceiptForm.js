import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

const ReceiptForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    customerName: '',
    amount: '',
    paymentMethod: '',
    account: '',
    bank: '',
    description: '',
    reference: '',
    type: 'Receipt', // Fixed type for Receipt voucher
  });

  // UI state
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch customers and accounts
        const [customersRes, accountsRes] = await Promise.all([
          axios.get('/api/customers'),
          axios.get('/api/accounts')
        ]);

        // Set customers with validation
        const validCustomers = (customersRes.data || []).filter(customer => 
          customer && typeof customer === 'object' && customer.companyName && customer._id
        );
        setCustomers(validCustomers);

        // Split accounts into regular and bank accounts
        const allAccounts = accountsRes.data || [];
        // Ensure accounts have valid code property
        const validAccounts = allAccounts.filter(acc => acc && typeof acc === 'object' && typeof acc.code === 'string');
        setBankAccounts(validAccounts.filter(acc => acc.code.startsWith('1001')));
        setAccounts(validAccounts.filter(acc => !acc.code.startsWith('1001')));

        // If editing, load receipt data
        if (id) {
          const receiptRes = await axios.get(`/api/receipts/${id}`);
          setFormData(receiptRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Update customerName when customerId changes
      if (name === 'customerId') {
        const customer = customers.find(c => c._id === value);
        if (customer) {
          newData.customerName = customer.companyName;
        }
      }
      
      return newData;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);

      // Validate required fields
      const requiredFields = ['date', 'customerId', 'amount', 'paymentMethod', 'account', 'bank'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Get customer name for the selected customer
      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      if (!selectedCustomer) {
        throw new Error('Selected customer not found');
      }

      // First, get a fresh transaction number
      console.log('Fetching fresh transaction number...');
      const transactionRes = await axios.get('/api/transactions/next-number');
      const transactionNumber = transactionRes.data.transactionNumber;
      console.log('Got transaction number:', transactionNumber);

      // Then, get a fresh receipt number
      console.log('Fetching fresh receipt number...');
      const voucherRes = await axios.get('/api/receipts/next-number');
      const voucherNumber = voucherRes.data.voucherNumber;
      console.log('Got receipt number:', voucherNumber);

      // Prepare receipt data
      const receiptData = {
        ...formData,
        customerName: selectedCustomer.companyName,
        voucherNumber,
        transactionNumber,
        type: 'Receipt'
      };

      console.log('Saving receipt with data:', receiptData);

      // Save receipt first
      const savedReceipt = await axios.post('/api/receipts', receiptData);
      console.log('Receipt saved:', savedReceipt.data);

      // Create corresponding transaction
      const transactionData = {
        date: receiptData.date,
        transactionNumber: receiptData.transactionNumber,
        voucherNumber: receiptData.voucherNumber,
        type: 'Receipt',
        description: receiptData.description || '',
        amount: receiptData.amount,
        name: selectedCustomer.companyName, // Map customerName to name
        account: receiptData.account,
        bank: receiptData.bank,
        paymentMethod: receiptData.paymentMethod,
        reference: receiptData.reference || '',
        isActive: true
      };

      console.log('Creating transaction with data:', transactionData);
      const savedTransaction = await axios.post('/api/transactions', transactionData);
      console.log('Transaction created:', savedTransaction.data);

      setSuccess(true);
      setTimeout(() => navigate('/receipts'), 1500);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {id ? 'Edit Receipt' : 'New Receipt'}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="date"
              name="date"
              label="Date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              select
              name="customerId"
              label="Customer"
              value={formData.customerId}
              onChange={handleChange}
            >
              {customers.map((customer) => (
                <MenuItem key={customer._id} value={customer._id}>
                  {customer.companyName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="number"
              name="amount"
              label="Amount"
              value={formData.amount}
              onChange={handleChange}
              inputProps={{ step: "0.01" }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              select
              name="paymentMethod"
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Check">Check</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              select
              name="account"
              label="Account"
              value={formData.account}
              onChange={handleChange}
            >
              {accounts.map((account) => (
                <MenuItem key={account._id} value={account._id}>
                  {account.name} ({account.code})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              select
              name="bank"
              label="Bank"
              value={formData.bank}
              onChange={handleChange}
            >
              {bankAccounts.map((bank) => (
                <MenuItem key={bank._id} value={bank._id}>
                  {bank.name} ({bank.code})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="reference"
              label="Reference"
              value={formData.reference}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            onClick={() => navigate('/receipts')}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update' : 'Save')}
          </Button>
        </Box>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={success} 
        autoHideDuration={1500} 
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">
          Receipt {id ? 'updated' : 'created'} successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReceiptForm;