import React from 'react';
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
} from '@mui/material';

const SupplierForm = ({ open, handleClose, handleSubmit, supplier, setSupplier, mode }) => {
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setSupplier(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
              value={supplier.accountCode || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={supplier.companyName || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Registration Number"
              name="companyRegNumber"
              value={supplier.companyRegNumber || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="VAT Number"
              name="vatNumber"
              value={supplier.vatNumber || ''}
              onChange={handleChange}
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
              value={supplier.street1 || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Street Address 2"
              name="street2"
              value={supplier.street2 || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Town"
              name="town"
              value={supplier.town || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="County"
              name="county"
              value={supplier.county || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Post Code"
              name="postCode"
              value={supplier.postCode || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={supplier.country || ''}
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
              value={supplier.contactName || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Trade Contact"
              name="tradeContact"
              value={supplier.tradeContact || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telephone"
              name="telephone"
              value={supplier.telephone || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mobile"
              name="mobile"
              value={supplier.mobile || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email 1"
              name="email1"
              type="email"
              value={supplier.email1 || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email 2"
              name="email2"
              type="email"
              value={supplier.email2 || ''}
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
              value={supplier.website || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Twitter"
              name="twitter"
              value={supplier.twitter || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Facebook"
              name="facebook"
              value={supplier.facebook || ''}
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
                  checked={supplier.inactive || false}
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
                  checked={supplier.sendViaEmail || false}
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {mode === 'add' ? 'Add Supplier' : 'Update Supplier'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SupplierForm;
