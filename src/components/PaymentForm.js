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

const PaymentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
    name: '', // This will store the supplier name
    amount: '',
    paymentMethod: '',
    account: '',
    bank: '',
    description: '',
    reference: '',
    voucherNumber: '',
    transactionNumber: '',
    type: 'Payment', // Fixed type for Payment voucher
  });

  // UI state
  const [suppliers, setSuppliers] = useState([]);
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
        const [suppliersRes, accountsRes, voucherRes] = await Promise.all([
          axios.get('/api/suppliers'),
          axios.get('/api/accounts'),
          axios.get('/api/payments/next-number')
        ]);

        // Set suppliers
        if (Array.isArray(suppliersRes.data)) {
          setSuppliers(suppliersRes.data);
        } else {
          throw new Error('Invalid suppliers data received');
        }

        // Set accounts
        if (Array.isArray(accountsRes.data)) {
          const allAccounts = accountsRes.data;
          setBankAccounts(allAccounts.filter(acc => acc.code.startsWith('1001')));
          setAccounts(allAccounts.filter(acc => !acc.code.startsWith('1001')));
        } else {
          throw new Error('Invalid accounts data received');
        }

        // Set initial voucher number
        if (voucherRes.data && voucherRes.data.voucherNumber) {
          setFormData(prev => ({
            ...prev,
            voucherNumber: voucherRes.data.voucherNumber
          }));
        }

        // If editing, load existing data
        if (id) {
          const paymentRes = await axios.get(`/api/payments/${id}`);
          if (paymentRes.data) {
            setFormData(paymentRes.data);
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle supplier selection
  const handleSupplierChange = (event) => {
    const selectedSupplierId = event.target.value;
    const selectedSupplier = suppliers.find(s => s._id === selectedSupplierId);
    
    setFormData(prev => ({
      ...prev,
      supplierId: selectedSupplierId,
      name: selectedSupplier ? selectedSupplier.companyName : ''
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

      const response = await axios.post('/api/payments', formData);
      setSuccess(true);
      
      // Redirect to /invoice after successful submission
      setTimeout(() => {
        navigate('/invoice');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving the payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success">
            Payment saved successfully!
          </Alert>
        </Snackbar>

        <Typography variant="h6" gutterBottom>
          {id ? 'Edit Payment' : 'New Payment'}
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
              label="Supplier"
              name="supplierId"
              value={formData.supplierId || ''}
              onChange={handleSupplierChange}
              required
              error={!formData.supplierId}
              helperText={!formData.supplierId ? 'Supplier is required' : ''}
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier._id} value={supplier._id}>
                  {supplier.companyName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              error={!formData.amount}
              helperText={!formData.amount ? 'Amount is required' : ''}
              inputProps={{ step: "0.01" }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod || ''}
              onChange={handleInputChange}
              required
              error={!formData.paymentMethod}
              helperText={!formData.paymentMethod ? 'Payment method is required' : ''}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
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
              helperText={!formData.account ? 'Account is required' : ''}
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
              helperText={!formData.bank ? 'Bank is required' : ''}
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
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reference"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (id ? 'Update Payment' : 'Save Payment')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PaymentForm;