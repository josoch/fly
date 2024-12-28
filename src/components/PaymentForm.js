import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = '/api';

const PaymentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    name: '',
    account: '',
    bank: '',
    description: '',
    paymentMethod: '',
    amount: '',
    paymentNumber: '',
    supplierId: '',
    supplierName: '',
    status: 'Draft'
  });

  useEffect(() => {
    fetchSuppliers();
    fetchAccounts();
    if (id) {
      fetchPayment();
    }
  }, [id]);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/suppliers`);
      // Ensure we're using the same supplier data structure as the Suppliers module
      const formattedSuppliers = response.data.map(supplier => ({
        _id: supplier._id,
        companyName: supplier.companyName,
        accountCode: supplier.accountCode,
        balance: supplier.balance
      }));
      setSuppliers(formattedSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts`);
      const allAccounts = response.data;
      
      // Filter bank accounts (assuming they have codes starting with 1001 for Cash in Bank)
      const banks = allAccounts.filter(acc => acc.code.startsWith('1001'));
      const regularAccounts = allAccounts.filter(acc => !acc.code.startsWith('1001'));
      
      setBankAccounts(banks);
      setAccounts(regularAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/payments/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'supplierId') {
      const selectedSupplier = suppliers.find(s => s._id === value);
      setFormData(prev => ({
        ...prev,
        supplierId: value,
        supplierName: selectedSupplier ? selectedSupplier.companyName : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await axios.put(`${API_BASE_URL}/payments/${id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/payments`, formData);
      }
      navigate('/payments');
    } catch (error) {
      console.error('Error saving payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    'Cash',
    'Bank Transfer',
    'Cheque',
    'Mobile Money',
    'Other'
  ];

  const statuses = [
    'Draft',
    'Pending',
    'Completed',
    'Cancelled'
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Payment' : 'New Payment'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Number"
                name="paymentNumber"
                value={formData.paymentNumber}
                onChange={handleChange}
                required
              />
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
                type="date"
                label="Date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Supplier"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
                helperText="Select a supplier from the list"
              >
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier._id} value={supplier._id}>
                    {supplier.companyName} ({supplier.accountCode})
                  </MenuItem>
                ))}
              </TextField>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₦</span>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Payment Method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/payments')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PaymentForm;
