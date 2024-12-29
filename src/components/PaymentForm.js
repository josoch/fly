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

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    voucherNumber: '',
    transactionNumber: '',
    reference: '',
    supplierId: '',
    supplierName: '',
    account: '',
    bank: '',
    description: '',
    paymentMethod: '',
    amount: '',
    type: 'Payment'
  });

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
        const [suppliersRes, accountsRes] = await Promise.all([
          axios.get('/api/suppliers'),
          axios.get('/api/accounts')
        ]);

        const validSuppliers = (suppliersRes.data || []).filter(supplier => 
          supplier && typeof supplier === 'object' && supplier.companyName && supplier._id
        );
        setSuppliers(validSuppliers);

        const allAccounts = accountsRes.data || [];
        const validAccounts = allAccounts.filter(acc => acc && typeof acc === 'object' && typeof acc.code === 'string');
        setBankAccounts(validAccounts.filter(acc => acc.code.startsWith('1001')));
        setAccounts(validAccounts.filter(acc => !acc.code.startsWith('1001')));

        if (id) {
          const paymentRes = await axios.get(`/api/payments/${id}`);
          if (paymentRes.data) {
            // Format date for the input
            const payment = {
              ...paymentRes.data,
              date: new Date(paymentRes.data.date).toISOString().split('T')[0]
            };
            setFormData(payment);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      if (name === 'supplierId') {
        const supplier = suppliers.find(s => s._id === value);
        if (supplier) {
          newData.supplierName = supplier.companyName;
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);

      const requiredFields = ['date', 'supplierId', 'amount', 'paymentMethod', 'account', 'bank'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      const selectedSupplier = suppliers.find(s => s._id === formData.supplierId);
      if (!selectedSupplier) {
        throw new Error('Selected supplier not found');
      }

      // Get transaction number first
      const transactionRes = await axios.get('/api/transactions/next-number');
      if (!transactionRes.data || !transactionRes.data.transactionNumber) {
        throw new Error('Failed to get transaction number');
      }
      const transactionNumber = transactionRes.data.transactionNumber;
      console.log('Got transaction number:', transactionNumber);

      // Then get payment number
      const voucherRes = await axios.get('/api/payments/next-number');
      if (!voucherRes.data || !voucherRes.data.voucherNumber) {
        throw new Error('Failed to get payment number');
      }
      const voucherNumber = voucherRes.data.voucherNumber;
      console.log('Got payment number:', voucherNumber);

      const paymentData = {
        ...formData,
        supplierName: selectedSupplier.companyName,
        voucherNumber,
        transactionNumber,
        type: 'Payment'
      };

      // Create payment record
      const savedPayment = await axios.post('/api/payments', paymentData);
      console.log('Payment saved:', savedPayment.data);

      // Create transaction record
      const transactionData = {
        date: paymentData.date,
        transactionNumber: paymentData.transactionNumber,
        voucherNumber: paymentData.voucherNumber,
        type: 'Payment',
        description: paymentData.description || '',
        amount: paymentData.amount,
        name: selectedSupplier.companyName,
        account: paymentData.account,
        bank: paymentData.bank,
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference || '',
        isActive: true,
      };

      const savedTransaction = await axios.post('/api/transactions', transactionData);
      console.log('Transaction saved:', savedTransaction.data);

      setSuccess(true);
      setTimeout(() => navigate('/payments'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {id ? 'Edit Payment' : 'New Payment'}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Supplier"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              required
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
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              {['Cash', 'Bank Transfer', 'Cheque', 'Mobile Money', 'Other'].map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Account"
              name="account"
              value={formData.account}
              onChange={handleChange}
              required
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
              label="Bank Account"
              name="bank"
              value={formData.bank}
              onChange={handleChange}
              required
            >
              {bankAccounts.map((account) => (
                <MenuItem key={account._id} value={account._id}>
                  {account.code} - {account.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reference"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/payments')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Payment'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Payment saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentForm;
