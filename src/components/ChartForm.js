import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';

const accountTypes = [
  'Income',
  'Expense',
  'Fixed Asset',
  'Bank',
  'Capital',
  'Debtor',
  'Creditor',
  'Other Asset',
  'Other Current Asset',
  'Other Current Liability',
  'Long Term Liability',
  'Cost of Goods Sold',
  'Other Income',
  'Other Expense'
];

const ChartForm = ({ open, onClose, onSubmit, account, mode }) => {
  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: '',
    balance: 0,
  });

  useEffect(() => {
    if (account) {
      setFormData(account);
    } else {
      setFormData({
        accountCode: '',
        accountName: '',
        accountType: '',
        balance: 0,
      });
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'add' ? 'Add New Account' : 'Edit Account'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Account Code"
              name="accountCode"
              value={formData.accountCode}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Account Name"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Account Type"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              required
            >
              {accountTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Balance"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {mode === 'add' ? 'Add Account' : 'Update Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChartForm;
