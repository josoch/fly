import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GoogleIcon from '@mui/icons-material/Public';
import LinkIcon from '@mui/icons-material/Link';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function CustomerForm({ open, onClose, customer, onSave }) {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    accountCode: '',
    companyName: '',
    companyRegNumber: '',
    balance: '0.00',
    inactive: false,
    street1: '',
    street2: '',
    town: '',
    county: '',
    postCode: '',
    country: 'Nigeria',
    vatNumber: '',
    contactName: '',
    tradeContact: '',
    telephone: '',
    mobile: '',
    website: '',
    twitter: '',
    linkedin: '',
    facebook: '',
    email1: '',
    email2: '',
    sendViaEmail: false,
  });
  const [notes, setNotes] = useState(() => {
    if (customer?.id) {
      const savedNotes = localStorage.getItem(`customer_notes_${customer.id}`);
      return savedNotes ? JSON.parse(savedNotes) : [{ id: 1, text: '', date: new Date().toISOString() }];
    }
    return [{ id: 1, text: '', date: new Date().toISOString() }];
  });
  const [files, setFiles] = useState(() => {
    if (customer?.id) {
      const savedFiles = localStorage.getItem(`customer_files_${customer.id}`);
      return savedFiles ? JSON.parse(savedFiles) : [];
    }
    return [];
  });
  
  // File input ref
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        accountCode: customer.accountCode || '',
        companyName: customer.companyName || '',
        companyRegNumber: customer.companyRegNumber || '',
        balance: customer.balance || '0.00',
        creditLimit: customer.creditLimit || '0.00',
        inactive: customer.inactive || false,
        street1: customer.street1 || '',
        street2: customer.street2 || '',
        town: customer.town || '',
        county: customer.county || '',
        postCode: customer.postCode || '',
        country: customer.country || 'Nigeria',
        vatNumber: customer.vatNumber || '',
        contactName: customer.contactName || '',
        tradeContact: customer.tradeContact || '',
        telephone: customer.telephone || '',
        mobile: customer.mobile || '',
        website: customer.website || '',
        twitter: customer.twitter || '',
        linkedin: customer.linkedin || '',
        facebook: customer.facebook || '',
        email1: customer.email1 || '',
        email2: customer.email2 || '',
        sendViaEmail: customer.sendViaEmail || false,
      });
    }
  }, [customer]);

  useEffect(() => {
    if (customer?.id) {
      localStorage.setItem(`customer_notes_${customer.id}`, JSON.stringify(notes));
    }
  }, [notes, customer?.id]);

  useEffect(() => {
    if (customer?.id) {
      const filesMeta = files.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: file.uploadDate
      }));
      localStorage.setItem(`customer_files_${customer.id}`, JSON.stringify(filesMeta));
    }
  }, [files, customer?.id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' || type === 'switch' ? checked :
              name === 'balance' || name === 'creditLimit' ? parseFloat(value || '0.00').toString() :
              value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle file selection with metadata
  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString()
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  // Handle note changes
  const handleNoteChange = (id, value) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, text: value } : note
    ));
  };

  // Add new note
  const handleAddNote = () => {
    setNotes(prev => [...prev, { 
      id: Date.now(), 
      text: '', 
      date: new Date().toISOString() 
    }]);
  };

  // Remove note
  const handleRemoveNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  // Remove file
  const handleRemoveFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleSave = async () => {
    try {
      // Generate a unique account code if not provided
      const accountCode = formData.accountCode || `ACC${Date.now()}`;
      
      const customerData = {
        accountCode: accountCode,
        companyName: formData.companyName || '',
        companyRegNumber: formData.companyRegNumber || '',
        balance: parseFloat(formData.balance) || 0,
        creditLimit: parseFloat(formData.creditLimit) || 0,
        inactive: Boolean(formData.inactive),
        street1: formData.street1 || '',
        street2: formData.street2 || '',
        town: formData.town || '',
        county: formData.county || '',
        postCode: formData.postCode || '',
        country: formData.country || 'Nigeria',
        vatNumber: formData.vatNumber || '',
        contactName: formData.contactName || '',
        tradeContact: formData.tradeContact || '',
        telephone: formData.telephone || '',
        mobile: formData.mobile || '',
        website: formData.website || '',
        twitter: formData.twitter || '',
        facebook: formData.facebook || '',
        email1: formData.email1 || '',
        email2: formData.email2 || '',
        sendViaEmail: Boolean(formData.sendViaEmail),
        notes: notes.map(note => ({
          text: note.text,
          date: note.date
        }))
      };

      console.log('Saving customer data:', customerData);

      let response;
      if (formData.id) {
        console.log('Updating existing customer:', formData.id);
        response = await axios.put(`/api/customers/${formData.id}`, customerData);
      } else {
        console.log('Creating new customer');
        response = await axios.post('/api/customers', customerData);
      }

      console.log('Server response:', response.data);
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Please try again.';
      alert(`Error saving customer: ${errorMessage}`);
    }
  };

  const handleClose = () => {
    // Reset form data
    setFormData({
      accountCode: '',
      companyName: '',
      companyRegNumber: '',
      balance: '0.00',
      inactive: false,
      street1: '',
      street2: '',
      town: '',
      county: '',
      postCode: '',
      country: 'Nigeria',
      vatNumber: '',
      contactName: '',
      tradeContact: '',
      telephone: '',
      mobile: '',
      website: '',
      twitter: '',
      linkedin: '',
      facebook: '',
      email1: '',
      email2: '',
      sendViaEmail: false,
    });
    setNotes([{ id: 1, text: '', date: new Date().toISOString() }]);
    setFiles([]);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Customer Record</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small"
            onClick={() => window.open(`https://google.com/maps?q=${encodeURIComponent(formData.street1 + ' ' + formData.street2 + ' ' + formData.town + ' ' + formData.county + ' ' + formData.postCode)}`, '_blank')}
          >
            <GoogleIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Details" />
        <Tab label="Notes" />
        <Tab label="Documents" />
      </Tabs>

      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Account Details Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Account Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="A/C"
                    name="accountCode"
                    value={formData.accountCode}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Reg. Number"
                    name="companyRegNumber"
                    value={formData.companyRegNumber}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Balance"
                    name="balance"
                    value={formData.balance}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.inactive}
                        onChange={handleChange}
                        name="inactive"
                      />
                    }
                    label="Inactive"
                  />
                </Grid>
              </Grid>

              {/* Registered Address Section */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Registered Address</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street1"
                    name="street1"
                    value={formData.street1}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street2"
                    name="street2"
                    value={formData.street2}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Town"
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="County"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Post Code"
                    name="postCode"
                    value={formData.postCode}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="VAT Number"
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Contact Information Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Contact Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Trade Contact"
                    name="tradeContact"
                    value={formData.tradeContact}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton>
                            <LinkIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Social Media Section */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Social Media</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">www.twitter.com/</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">www.linkedin.com/</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">www.facebook.com/</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              {/* Email Settings Section */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Email Settings & Addresses</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email 1"
                    name="email1"
                    value={formData.email1}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email 2"
                    name="email2"
                    value={formData.email2}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.sendViaEmail}
                        onChange={handleChange}
                        name="sendViaEmail"
                      />
                    }
                    label="Send Via Email"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNote}
              sx={{ mb: 2 }}
            >
              Add Note
            </Button>
          </Box>
          {notes.map((note) => (
            <Paper key={note.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {new Date(note.date).toLocaleString()}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleRemoveNote(note.id)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter note text..."
                value={note.text}
                onChange={(e) => handleNoteChange(note.id, e.target.value)}
              />
            </Paper>
          ))}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current.click()}
              sx={{ mb: 2 }}
            >
              Upload Files
            </Button>
          </Box>
          {files.map((file) => (
            <Paper key={file.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachFileIcon />
                  <Box>
                    <Typography variant="subtitle2">{file.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {(file.size / 1024).toFixed(2)} KB • {new Date(file.uploadDate).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => handleRemoveFile(file.id)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomerForm;
