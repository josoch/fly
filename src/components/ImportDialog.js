import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  AlertTitle,
  Link,
  Menu,
  MenuItem,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';

const ImportDialog = ({ open, handleClose, onImportComplete, entityType }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.name.split('.').pop().toLowerCase();
      if (!['csv', 'xls', 'xlsx'].includes(fileType)) {
        setError('Invalid file type. Only CSV and Excel files are allowed.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    setUploading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`/api/${entityType}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data.results);
      if (response.data.results.success > 0) {
        onImportComplete();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading file');
      if (error.response?.data?.errors) {
        setResults({ errors: error.response.data.errors });
      }
    } finally {
      setUploading(false);
    }
  };

  const getSampleData = () => {
    // Sample data that will pass all validations
    return [
      {
        accountCode: 'ACC001',
        companyName: 'Sample Company Ltd',
        companyRegNumber: 'REG123456',
        balance: '5000.00',
        inactive: 'false',
        street1: '123 Business Street',
        street2: 'Suite 456',
        town: 'Business Town',
        county: 'Business County',
        postCode: 'BT1 1BT',
        country: 'Nigeria',
        vatNumber: 'VAT123456',
        contactName: 'John Smith',
        tradeContact: 'Jane Doe',
        telephone: '01234567890',
        mobile: '07700900000',
        website: 'www.samplecompany.com',
        twitter: '@samplecompany',
        facebook: 'samplecompany',
        email1: 'contact@samplecompany.com',
        email2: 'support@samplecompany.com',
        sendViaEmail: 'true'
      },
      {
        accountCode: 'ACC002',
        companyName: 'Test Enterprise Inc',
        companyRegNumber: 'REG789012',
        balance: '7500.00',
        inactive: 'false',
        street1: '456 Corporate Avenue',
        street2: 'Floor 7',
        town: 'Business City',
        county: 'Corporate County',
        postCode: 'BC2 2BC',
        country: 'Nigeria',
        vatNumber: 'VAT789012',
        contactName: 'Sarah Johnson',
        tradeContact: 'Mike Wilson',
        telephone: '01234567891',
        mobile: '07700900001',
        website: 'www.testenterprise.com',
        twitter: '@testenterprise',
        facebook: 'testenterprise',
        email1: 'info@testenterprise.com',
        email2: 'sales@testenterprise.com',
        sendViaEmail: 'true'
      }
    ];
  };

  const handleDownloadTemplate = (format) => {
    const sampleData = getSampleData();
    let content;
    let mimeType;
    let fileExtension;

    if (format === 'csv') {
      // Create CSV content
      const headers = Object.keys(sampleData[0]).join(',');
      const rows = sampleData.map(row => Object.values(row).join(','));
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv';
      fileExtension = 'csv';
    } else {
      // Create Excel-like content (CSV for now, but could be enhanced with actual Excel creation)
      const headers = Object.keys(sampleData[0]).join(',');
      const rows = sampleData.map(row => Object.values(row).join(','));
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv';
      fileExtension = 'csv';
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_template_with_sample_data.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setDownloadMenuAnchor(null);
  };

  const handleDownloadClick = (event) => {
    setDownloadMenuAnchor(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchor(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload a CSV or Excel file containing your {entityType} data.
            Make sure to include the required fields: Account Code and Company Name.
          </Typography>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleDownloadClick}
            >
              Download Template
            </Button>
            <Menu
              anchorEl={downloadMenuAnchor}
              open={Boolean(downloadMenuAnchor)}
              onClose={handleDownloadMenuClose}
            >
              <MenuItem onClick={() => handleDownloadTemplate('empty')}>
                Empty Template
              </MenuItem>
              <MenuItem onClick={() => handleDownloadTemplate('sample')}>
                Template with Sample Data
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            mb: 2,
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            type="file"
            id="file-input"
            accept=".csv,.xls,.xlsx"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: CSV, XLS, XLSX
          </Typography>
        </Box>

        {uploading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {results && (
          <Alert severity={results.success > 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
            <AlertTitle>Import Results</AlertTitle>
            <Typography variant="body2">
              Successfully imported: {results.success}
              {results.failed > 0 && ` | Failed: ${results.failed}`}
            </Typography>
            {results.errors && results.errors.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" gutterBottom>Errors:</Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {results.errors.map((error, index) => (
                    <li key={index}><Typography variant="body2">{error}</Typography></li>
                  ))}
                </ul>
              </Box>
            )}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
