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
  Snackbar,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const TransactionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    voucherNumber: '',
    type: 'Receipt',
    reference: '',
    amount: '',
    description: '',
    name: '',
    paymentMethod: '',
    account: '',
    bank: ''
  });

  // Data states
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [accountsRes, customersRes, suppliersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/accounts`),
          axios.get(`${API_BASE_URL}/customers`),
          axios.get(`${API_BASE_URL}/suppliers`)
        ]);

        console.log('Customers Data Structure:', customersRes.data[0]);
        console.log('Suppliers Data Structure:', suppliersRes.data[0]);
        console.log('Number of Customers:', customersRes.data.length);
        console.log('Number of Suppliers:', suppliersRes.data.length);

        if (accountsRes.data) setAccounts(accountsRes.data);
        if (customersRes.data) setCustomers(customersRes.data);
        if (suppliersRes.data) setSuppliers(suppliersRes.data);

        // If editing existing transaction
        if (id) {
          const transactionRes = await axios.get(`${API_BASE_URL}/transactions/${id}`);
          if (transactionRes.data) {
            setFormData(transactionRes.data);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load form data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter banks (accounts of type Asset)
  const banks = accounts.filter(acc => acc.type === 'Asset');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!formData.date || !formData.amount || !formData.paymentMethod || 
          !formData.account || !formData.bank) {
        throw new Error('Please fill in all required fields');
      }

      const receiptData = {
        ...formData,
        type: 'Receipt'
      };

      if (id) {
        await axios.put(`${API_BASE_URL}/transactions/${id}`, receiptData);
      } else {
        await axios.post(`${API_BASE_URL}/transactions`, receiptData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);

    } catch (error) {
      console.error('Error saving receipt:', error);
      setError(error.response?.data?.message || 'Failed to save receipt. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 4,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                mb: 0.5,
                fontWeight: 600,
                color: 'primary.main'
              }}
            >
              {id ? 'Edit Transaction' : 'New Transaction'}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 0 }}
            >
              {formData.type === 'Payment' ? 'Record money going out' : 'Record money coming in'}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.default',
            borderRadius: 2,
            p: 1,
            boxShadow: 1
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: formData.type !== 'Payment' ? 'primary.main' : 'text.secondary',
                fontWeight: formData.type !== 'Payment' ? 600 : 400,
                mr: 1
              }}
            >
              Receipt
            </Typography>
            <Switch
              checked={formData.type === 'Payment'}
              onChange={(e) => setFormData({...formData, type: e.target.checked ? 'Payment' : 'Receipt'})}
              sx={{ 
                width: 60,
                height: 34,
                '& .MuiSwitch-switchBase': {
                  m: 0.5,
                  p: 0,
                  '&.Mui-checked': {
                    transform: 'translateX(26px)',
                    color: '#fff',
                    '& + .MuiSwitch-track': {
                      opacity: 1,
                      backgroundColor: 'primary.main',
                    },
                  },
                },
                '& .MuiSwitch-thumb': {
                  width: 26,
                  height: 26,
                  boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
                },
                '& .MuiSwitch-track': {
                  borderRadius: 17,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  opacity: 1,
                  transition: 'background-color 0.3s',
                },
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: formData.type === 'Payment' ? 'primary.main' : 'text.secondary',
                fontWeight: formData.type === 'Payment' ? 600 : 400,
                ml: 1
              }}
            >
              Payment
            </Typography>
          </Box>
        </Box>

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
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              required
              label={formData.type === 'Payment' ? 'Supplier Name' : 'Customer Name'}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            >
              {formData.type === 'Payment' ? (
                suppliers && suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <MenuItem key={supplier._id} value={supplier.companyName || supplier.name}>
                      {supplier.companyName || supplier.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No suppliers available</MenuItem>
                )
              ) : (
                customers && customers.length > 0 ? (
                  customers.map((customer) => (
                    <MenuItem key={customer._id} value={customer.companyName || customer.name}>
                      {customer.companyName || customer.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No customers available</MenuItem>
                )
              )}
            </TextField>
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              required
              fullWidth
              name="paymentMethod"
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={handleInputChange}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Mobile Money">Mobile Money</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              required
              fullWidth
              name="bank"
              label="Bank"
              value={formData.bank}
              onChange={handleInputChange}
            >
              {banks.map((bank) => (
                <MenuItem key={bank._id} value={bank.name}>
                  {bank.name} ({bank.code})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              required
              fullWidth
              name="account"
              label="Account"
              value={formData.account}
              onChange={handleInputChange}
            >
              {accounts.map((account) => (
                <MenuItem key={account._id} value={account.name}>
                  {account.name} ({account.code})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            onClick={() => navigate('/transactions')}
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

export default TransactionForm;