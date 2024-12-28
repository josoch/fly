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

const ReceiptForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    customerName: '',
    description: '',
    amount: '',
    paymentMethod: '',
    reference: '',
    status: 'Draft'
  });

  useEffect(() => {
    fetchCustomers();
    if (id) {
      fetchReceipt();
    }
  }, [id]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers`);
      // Ensure we're using the same customer data structure as the Customers module
      const formattedCustomers = response.data.map(customer => ({
        _id: customer._id,
        companyName: customer.companyName,
        accountCode: customer.accountCode,
        balance: customer.balance
      }));
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/receipts/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customerId') {
      const selectedCustomer = customers.find(c => c._id === value);
      setFormData(prev => ({
        ...prev,
        customerId: value,
        customerName: selectedCustomer ? selectedCustomer.companyName : ''
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
        await axios.put(`${API_BASE_URL}/receipts/${id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/receipts`, formData);
      }
      navigate('/receipts');
    } catch (error) {
      console.error('Error saving receipt:', error);
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
        {id ? 'Edit Receipt' : 'New Receipt'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Receipt Number"
                name="receiptNumber"
                value={formData.receiptNumber}
                onChange={handleChange}
                required
              />
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
                label="Customer"
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
                helperText="Select a customer from the list"
              >
                {customers.map((customer) => (
                  <MenuItem key={customer._id} value={customer._id}>
                    {customer.companyName} ({customer.accountCode})
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
              onClick={() => navigate('/receipts')}
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

export default ReceiptForm;
