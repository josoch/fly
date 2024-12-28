import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  InputAdornment,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function InvoiceForm() {
  const navigate = useNavigate();
  const [items, setItems] = useState([{ title: '', description: '', price: '0.00', qty: '0' }]);
  const [tasks, setTasks] = useState([{ title: '', description: '', rate: '0.00', hours: '0' }]);
  const [formData, setFormData] = useState({
    customer: '',
    title: '',
    invoiceNumber: '',
    poNumber: '',
    account: '',
    bank: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: ''
  });

  const [accounts, setAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  const calculateSubtotal = () => {
    const itemTotal = items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseFloat(item.qty || 0)), 0);
    const taskTotal = tasks.reduce((sum, task) => sum + (parseFloat(task.rate || 0) * parseFloat(task.hours || 0)), 0);
    return itemTotal + taskTotal;
  };

  const addItem = (type) => {
    if (type === 'task') {
      setTasks([...tasks, { title: '', description: '', rate: '0.00', hours: '0' }]);
    } else {
      setItems([...items, { title: '', description: '', price: '0.00', qty: '0' }]);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    // Fetch accounts
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('/api/accounts');
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
    fetchAccounts();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button onClick={() => navigate('/invoices')}>← Invoices</Button>
        <Box>
          <Button variant="contained" sx={{ mr: 1 }}>Save</Button>
          <Button variant="contained" color="secondary" sx={{ mr: 1 }}>Add Payment</Button>
          <Button variant="contained">Finalize for sending</Button>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} sm={8}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
            <Box sx={{ 
              height: 200, 
              border: '2px dashed #ccc',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              cursor: 'pointer'
            }}>
              <Typography color="textSecondary">Drop to upload image</Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 1 }}>BILL TO</Typography>
            <TextField
              fullWidth
              placeholder="Customer"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              sx={{ mb: { xs: 2, sm: 3 }, bgcolor: '#fdfde7' }}
            />

            <TextField
              fullWidth
              placeholder="Title (optional)"
              name="title"
              value={formData.title}
              onChange={handleChange}
              sx={{ mb: { xs: 2, sm: 3 }, bgcolor: '#fdfde7' }}
            />

            <Grid container spacing={{ xs: 2, sm: 3 }}>
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
            </Grid>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Invoice #"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  sx={{ bgcolor: '#fdfde7' }}
                />
                <TextField
                  fullWidth
                  label="PO #"
                  name="poNumber"
                  value={formData.poNumber}
                  onChange={handleChange}
                  sx={{ mt: { xs: 2, sm: 3 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  sx={{ bgcolor: '#fdfde7' }}
                />
                <TextField
                  fullWidth
                  label="Due"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  type="date"
                  sx={{ mt: { xs: 2, sm: 3 }, bgcolor: '#fdfde7' }}
                />
              </Grid>
            </Grid>

            {/* Tasks Section */}
            <Box sx={{ mt: 4 }}>
              <Grid container sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography>Task</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography>Rate</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography>Hours</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography>Total</Typography>
                </Grid>
              </Grid>

              {tasks.map((task, index) => (
                <Grid container spacing={{ xs: 2, sm: 3 }} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      placeholder="Title"
                      sx={{ mb: { xs: 2, sm: 3 }, bgcolor: '#fdfde7' }}
                    />
                    <TextField
                      fullWidth
                      placeholder="Description"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      label="Rate"
                      value={task.rate}
                      onChange={(e) => handleTaskChange(index, 'rate', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                      }}
                      sx={{ bgcolor: '#fdfde7' }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      type="number"
                      value={task.hours}
                      sx={{ bgcolor: '#fdfde7' }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>₦{(task.rate * task.hours).toFixed(2)}</Typography>
                      <IconButton size="small"><FileCopyIcon /></IconButton>
                      <IconButton size="small"><DeleteIcon /></IconButton>
                    </Box>
                  </Grid>
                </Grid>
              ))}

              <Button
                variant="contained"
                color="secondary"
                onClick={() => addItem('task')}
                sx={{ mt: { xs: 2, sm: 3 } }}
              >
                + Task
              </Button>
            </Box>

            {/* Items Section */}
            <Box sx={{ mt: 4 }}>
              <Grid container sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography>Item</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography>Price</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography>Qty</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography>Total</Typography>
                </Grid>
              </Grid>

              {items.map((item, index) => (
                <Grid container spacing={{ xs: 2, sm: 3 }} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      placeholder="Title"
                      sx={{ mb: { xs: 2, sm: 3 }, bgcolor: '#fdfde7' }}
                    />
                    <TextField
                      fullWidth
                      placeholder="Description"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      label="Price"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                      }}
                      sx={{ bgcolor: '#fdfde7' }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      type="number"
                      value={item.qty}
                      sx={{ bgcolor: '#fdfde7' }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>₦{(item.price * item.qty).toFixed(2)}</Typography>
                      <IconButton size="small"><FileCopyIcon /></IconButton>
                      <IconButton size="small"><DeleteIcon /></IconButton>
                    </Box>
                  </Grid>
                </Grid>
              ))}

              <Button
                variant="contained"
                color="secondary"
                onClick={() => addItem('item')}
                sx={{ mt: { xs: 2, sm: 3 } }}
              >
                + Item
              </Button>
            </Box>

            {/* Terms and Notes */}
            <Box sx={{ mt: 4 }}>
              <TextField
                fullWidth
                label="Terms"
                multiline
                rows={2}
                sx={{ mb: { xs: 2, sm: 3 }, bgcolor: '#fdfde7' }}
              />
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                sx={{ bgcolor: '#fdfde7' }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Options</Typography>
            <FormControlLabel
              control={<Switch />}
              label="Accept Credit Cards"
            />
            <Box sx={{ mt: { xs: 2, sm: 3 } }}>
              <img src="/credit-cards.png" alt="Accepted credit cards" style={{ maxWidth: '100%' }} />
            </Box>
          </Paper>

          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Invoice Quality Score</Typography>
            <Typography variant="h2" color="error" sx={{ textAlign: 'center' }}>
              28
              <Typography component="span" variant="h6" color="textSecondary">
                / 100
              </Typography>
            </Typography>
          </Paper>

          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>Recent invoices</Typography>
            <Typography color="textSecondary">
              Choose a customer to see their recent invoices.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Totals */}
      <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'flex-end' }}>
        <Typography>Subtotal: ₦{calculateSubtotal().toFixed(2)}</Typography>
        <Typography>Discount (0.00%): ₦{(0).toFixed(2)}</Typography>
        <Divider sx={{ my: { xs: 2, sm: 3 } }} />
        <Typography>Total: ₦{calculateSubtotal().toFixed(2)}</Typography>
        <Typography>Paid: ₦0.00</Typography>
        <Typography variant="h6" sx={{ mt: { xs: 2, sm: 3 } }}>
          Amount Due (NGN): ₦{calculateSubtotal().toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
}

export default InvoiceForm;
