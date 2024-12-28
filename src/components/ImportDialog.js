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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import * as XLSX from 'xlsx';

const ImportDialog = ({ open, handleClose, onImportComplete, entityType }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.name.split('.').pop().toLowerCase();
      if (!['xls', 'xlsx'].includes(fileType)) {
        setError('Invalid file type. Only Excel files are allowed.');
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

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);

          // Validate required columns
          if (data.length === 0) {
            throw new Error('File is empty');
          }

          const requiredColumns = ['Account Code', 'Account Name', 'Account Type', 'Balance'];
          const headers = Object.keys(data[0]);
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));

          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
          }

          // Validate data types and required fields
          const validTypes = [
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
          const errors = [];

          data.forEach((row, index) => {
            if (!row['Account Code'] || !row['Account Name'] || !row['Account Type']) {
              errors.push(`Row ${index + 1}: Account Code, Account Name, and Account Type are required`);
            }

            if (!validTypes.includes(row['Account Type'])) {
              errors.push(`Row ${index + 1}: Invalid Account Type. Must be one of: ${validTypes.join(', ')}`);
            }

            if (isNaN(parseFloat(row['Balance']))) {
              errors.push(`Row ${index + 1}: Balance must be a number`);
            }
          });

          if (errors.length > 0) {
            throw new Error('Validation errors:\n' + errors.join('\n'));
          }

          // Send data to API
          const response = await axios.post(`/api/${entityType}/import`, data);
          setResults({
            success: response.data.success || data.length,
            failed: response.data.failed || 0,
            errors: response.data.errors
          });
          if (response.data.success > 0) {
            onImportComplete();
          }
        } catch (err) {
          throw new Error(err.message);
        }
      };
      reader.readAsBinaryString(selectedFile);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create template with headers and sample data
    const headers = ['Account Code', 'Account Name', 'Account Type', 'Balance'];
    const sampleData = [
      ['1000', 'Cash in Bank', 'Bank', '0'],
      ['1100', 'Accounts Receivable', 'Debtor', '0'],
      ['2000', 'Accounts Payable', 'Creditor', '0'],
      ['3000', 'Share Capital', 'Capital', '0'],
      ['4000', 'Sales Revenue', 'Income', '0'],
      ['5000', 'Cost of Sales', 'Cost of Goods Sold', '0'],
      ['6000', 'Salaries Expense', 'Expense', '0'],
      ['1200', 'Office Equipment', 'Fixed Asset', '0']
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    XLSX.writeFile(wb, `${entityType}_import_template.xlsx`);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Chart of Accounts</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload an Excel file containing your Chart of Accounts data.
            Required fields: Account Code, Account Name, Account Type, and Balance.
          </Typography>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
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
            accept=".xls,.xlsx"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: XLS, XLSX
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
