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
    name: '', // This will store the customer name
    amount: '',
    paymentMethod: '',
    account: '',
    bank: '',
    description: '',
    reference: '',
    voucherNumber: '',
    transactionNumber: '',
    type: 'Receipt', // Fixed type for Receipt voucher
  });

  // UI state
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all required data
        const [customersRes, accountsRes] = await Promise.all([
          axios.get('/api/customer'),
          axios.get('/api/account')
        ]);

        // Set customers
        if (Array.isArray(customersRes.data)) {
          setCustomers(customersRes.data);
        } else {
          throw new Error('Invalid customers data received');
        }

        // Set accounts
        if (Array.isArray(accountsRes.data)) {
          const allAccounts = accountsRes.data;
          setBankAccounts(allAccounts.filter(acc => acc.code.startsWith('1001')));
          setAccounts(allAccounts.filter(acc => !acc.code.startsWith('1001')));
        } else {
          throw new Error('Invalid accounts data received');
        }

        // Set initial voucher number if editing
        if (id) {
          const receiptRes = await axios.get(`/api/receipt/${id}`);
          if (receiptRes.data) {
            setFormData(receiptRes.data);
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle customer selection
  const handleCustomerChange = (event) => {
    const selectedCustomerId = event.target.value;
    const selectedCustomer = customers.find(c => c._id === selectedCustomerId);
    
    setFormData(prev => ({
      ...prev,
      customerId: selectedCustomerId,
      name: selectedCustomer ? selectedCustomer.companyName : ''
    }));
  };

  // Handle account selection
  const handleAccountChange = (event) => {
    const selectedAccountId = event.target.value;
    const selectedAccount = accounts.find(a => a._id === selectedAccountId);
    
    setFormData(prev => ({
      ...prev,
      account: selectedAccountId,
      accountName: selectedAccount ? selectedAccount.name : ''
    }));
  };

  // Handle bank selection
  const handleBankChange = (event) => {
    const selectedBankId = event.target.value;
    const selectedBank = bankAccounts.find(b => b._id === selectedBankId);
    
    setFormData(prev => ({
      ...prev,
      bank: selectedBankId,
      bankName: selectedBank ? selectedBank.name : ''
    }));
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.date || !formData.customerId || !formData.amount || 
          !formData.paymentMethod || !formData.account || !formData.bank) {
        throw new Error('Please fill in all required fields');
      }

      // Get the selected customer name
      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      if (!selectedCustomer) {
        throw new Error('Invalid customer selected');
      }

      // Prepare the receipt data
      const receiptData = {
        ...formData,
        name: selectedCustomer.companyName,
        type: 'Receipt'
      };

      // Submit the receipt
      if (id) {
        await axios.put(`/api/receipt/${id}`, receiptData);
      } else {
        await axios.post('/api/receipt', receiptData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/invoice');
      }, 1500);

    } catch (error) {
      console.error('Error saving receipt:', error);
      setError(error.response?.data?.message || 'Failed to save receipt');
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

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Voucher Number"
              name="voucherNumber"
              value={formData.voucherNumber}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Customer"
              name="customerId"
              value={formData.customerId || ''}
              onChange={handleCustomerChange}
              required
              error={!formData.customerId}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              select
              fullWidth
              label="Account"
              name="account"
              value={formData.account || ''}
              onChange={handleAccountChange}
              required
              error={!formData.account}
            >
              {accounts.map((account) => (
                <MenuItem key={account._id} value={account._id}>
                  {account.code} - {account.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Bank"
              name="bank"
              value={formData.bank || ''}
              onChange={handleBankChange}
              required
              error={!formData.bank}
            >
              {bankAccounts.map((bank) => (
                <MenuItem key={bank._id} value={bank._id}>
                  {bank.code} - {bank.name}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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