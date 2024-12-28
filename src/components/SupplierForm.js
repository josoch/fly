import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  Typography,
  InputAdornment
} from '@mui/material';

const SupplierForm = ({ open, onClose, onSubmit, supplier, mode }) => {
  const [formData, setFormData] = useState({
    accountCode: '',
    companyName: '',
    companyRegNumber: '',
    balance: 0,
    creditLimit: 0,
    inactive: false,
    street1: '',
    street2: '',
    town: '',
    LGA: '',
    postCode: '',
    country: '',
    vatNumber: '',
    contactName: '',
    tradeContact: '',
    telephone: '',
    mobile: '',
    website: '',
    twitter: '',
    facebook: '',
    email1: '',
    email2: '',
    sendViaEmail: false
  });

  useEffect(() => {
    if (supplier) {
      setFormData(supplier);
    } else {
      setFormData({
        accountCode: '',
        companyName: '',
        companyRegNumber: '',
        balance: 0,
        creditLimit: 0,
        inactive: false,
        street1: '',
        street2: '',
        town: '',
        LGA: '',
        postCode: '',
        country: '',
        vatNumber: '',
        contactName: '',
        tradeContact: '',
        telephone: '',
        mobile: '',
        website: '',
        twitter: '',
        facebook: '',
        email1: '',
        email2: '',
        sendViaEmail: false
      });
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
              (name === 'balance' || name === 'creditLimit') ? parseFloat(value) || 0 :
              value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Basic Information</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Code"
              name="accountCode"
              value={formData.accountCode || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={formData.companyName || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Registration Number"
              name="companyRegNumber"
              value={formData.companyRegNumber || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="VAT Number"
              name="vatNumber"
              value={formData.vatNumber || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Credit Limit"
              name="creditLimit"
              type="number"
              value={formData.creditLimit || 0}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">₦</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Balance"
              name="balance"
              type="number"
              value={formData.balance || 0}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">₦</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Address Information</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Street Address 1"
              name="street1"
              value={formData.street1 || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Street Address 2"
              name="street2"
              value={formData.street2 || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Town"
              name="town"
              value={formData.town || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="LGA"
              name="LGA"
              value={formData.LGA || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Post Code"
              name="postCode"
              value={formData.postCode || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Contact Information</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Name"
              name="contactName"
              value={formData.contactName || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Trade Contact"
              name="tradeContact"
              value={formData.tradeContact || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telephone"
              name="telephone"
              value={formData.telephone || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mobile"
              name="mobile"
              value={formData.mobile || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email 1"
              name="email1"
              type="email"
              value={formData.email1 || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email 2"
              name="email2"
              type="email"
              value={formData.email2 || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Online Presence</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Twitter"
              name="twitter"
              value={formData.twitter || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Facebook"
              name="facebook"
              value={formData.facebook || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Additional Settings</Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.inactive || false}
                  onChange={handleChange}
                  name="inactive"
                />
              }
              label="Inactive"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.sendViaEmail || false}
                  onChange={handleChange}
                  name="sendViaEmail"
                />
              }
              label="Send via Email"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {mode === 'add' ? 'Add Supplier' : 'Update Supplier'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SupplierForm;
