import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Alert,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function JournalForm() {
  const navigate = useNavigate();
  const emptyEntry = {
    chartAccount: '',
    customer: '',
    suppliers: '',
    debitAmount: '',
    creditAmount: ''
  };

  // State
  const [commonFields, setCommonFields] = useState({
    date: new Date(),
    voucherNumber: '',
    reference: '',
    description: ''
  });
  const [journalEntries, setJournalEntries] = useState([{ ...emptyEntry }]);
  const [chartAccounts, setChartAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch chart accounts, customers and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsResponse, customersResponse, suppliersResponse] = await Promise.all([
          axios.get('/api/accounts'),
          axios.get('/api/customers'),  
          axios.get('/api/suppliers')   
        ]);
        
        setChartAccounts(accountsResponse.data);
        setCustomers(customersResponse.data);
        setSuppliers(suppliersResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data');
      }
    };

    fetchData();
  }, []);

  // Calculate totals
  const calculateTotals = () => {
    return journalEntries.reduce((acc, entry) => {
      const debit = parseFloat(entry.debitAmount) || 0;
      const credit = parseFloat(entry.creditAmount) || 0;
      return {
        debitTotal: acc.debitTotal + debit,
        creditTotal: acc.creditTotal + credit
      };
    }, { debitTotal: 0, creditTotal: 0 });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle entry change
  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...journalEntries];
    
    // If changing debit or credit amount
    if (field === 'debitAmount' || field === 'creditAmount') {
      // Clear the opposite field if a value is entered
      if (value && value !== '0') {
        updatedEntries[index] = {
          ...updatedEntries[index],
          [field]: value,
          [field === 'debitAmount' ? 'creditAmount' : 'debitAmount']: ''
        };
      } else {
        updatedEntries[index] = {
          ...updatedEntries[index],
          [field]: value
        };
      }
    } else {
      // For other fields, just update normally
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: value
      };
    }
    
    setJournalEntries(updatedEntries);
  };

  // Add new entry
  const handleAddEntry = () => {
    setJournalEntries([...journalEntries, { ...emptyEntry }]);
  };

  // Remove entry
  const handleRemoveEntry = (index) => {
    if (journalEntries.length > 1) {
      const updatedEntries = journalEntries.filter((_, i) => i !== index);
      setJournalEntries(updatedEntries);
    }
  };

  // Handle submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Get running totals
      const { debitTotal, creditTotal } = calculateTotals();
      
      // Validate that total debits equal total credits
      if (debitTotal !== creditTotal) {
        setError(`Total Debit (${formatCurrency(debitTotal)}) must equal Total Credit (${formatCurrency(creditTotal)})`);
        return;
      }

      // Get the bank account from chart accounts (assuming it's the first Asset type account)
      const bankAccount = chartAccounts.find(account => account.type === 'Asset')?.name;
      if (!bankAccount) {
        setError('No bank account found in chart of accounts');
        return;
      }

      // Create transactions array
      const transactions = [];
      
      // Process each journal entry
      for (const entry of journalEntries) {
        // Find the chart account name
        const accountName = chartAccounts.find(acc => acc._id === entry.chartAccount)?.name;
        if (!accountName) {
          throw new Error('Invalid chart account selected');
        }

        // Process debit transaction
        if (entry.debitAmount && Number(entry.debitAmount) > 0) {
          const customer = entry.customer ? customers.find(c => c.id === entry.customer) : null;
          const supplier = entry.suppliers ? suppliers.find(s => s.id === entry.suppliers) : null;
          
          const debitTxn = {
            transactionNumber: String(commonFields.voucherNumber + '-DR'),
            date: String(commonFields.date),
            voucherNumber: String(commonFields.voucherNumber),
            reference: String(commonFields.reference || ''),
            description: String(commonFields.description || ''),
            type: 'DR',
            amount: Number(entry.debitAmount),
            account: String(accountName),
            bank: String(bankAccount),
            customer: customer ? customer.companyName : '',
            supplier: supplier ? supplier.companyName : '',
            customerPhone: customer ? customer.telephone : '',
            supplierPhone: supplier ? supplier.telephone : '',
            paymentMethod: 'Journal'
          };
          transactions.push(debitTxn);
        }

        // Process credit transaction
        if (entry.creditAmount && Number(entry.creditAmount) > 0) {
          const customer = entry.customer ? customers.find(c => c.id === entry.customer) : null;
          const supplier = entry.suppliers ? suppliers.find(s => s.id === entry.suppliers) : null;
          
          const creditTxn = {
            transactionNumber: String(commonFields.voucherNumber + '-CR'),
            date: String(commonFields.date),
            voucherNumber: String(commonFields.voucherNumber),
            reference: String(commonFields.reference || ''),
            description: String(commonFields.description || ''),
            type: 'CR',
            amount: Number(entry.creditAmount),
            account: String(accountName),
            bank: String(bankAccount),
            customer: customer ? customer.companyName : '',
            supplier: supplier ? supplier.companyName : '',
            customerPhone: customer ? customer.telephone : '',
            supplierPhone: supplier ? supplier.telephone : '',
            paymentMethod: 'Journal'
          };
          transactions.push(creditTxn);
        }
      }

      // Log the transactions for debugging
      console.log('Submitting transactions:', JSON.stringify(transactions, null, 2));

      // Submit all transactions
      const response = await axios.post('/api/transactions', { transactions });

      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/transactions');
        }, 1500);
      }
    } catch (err) {
      console.error('Submission error:', err.response?.data);
      setError(err.response?.data?.message || 'Error submitting journal entries');
    }
  };

  // Calculate totals for display
  const { debitTotal, creditTotal } = calculateTotals();

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Journal Entry</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Journal entries submitted successfully!
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={commonFields.date}
                onChange={(newValue) => setCommonFields({ ...commonFields, date: newValue })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Voucher Number"
              value={commonFields.voucherNumber}
              onChange={(e) => setCommonFields({ ...commonFields, voucherNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Reference"
              value={commonFields.reference}
              onChange={(e) => setCommonFields({ ...commonFields, reference: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Description"
              value={commonFields.description}
              onChange={(e) => setCommonFields({ ...commonFields, description: e.target.value })}
            />
          </Grid>
        </Grid>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="25%">Account</TableCell>
                <TableCell width="20%">Customer</TableCell>
                <TableCell width="20%">Suppliers</TableCell>
                <TableCell width="15%" align="right">Debit</TableCell>
                <TableCell width="15%" align="right">Credit</TableCell>
                <TableCell width="5%" padding="none" />
              </TableRow>
            </TableHead>
            <TableBody>
              {journalEntries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell width="25%">
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={entry.chartAccount}
                      onChange={(e) => handleEntryChange(index, 'chartAccount', e.target.value)}
                    >
                      {chartAccounts.map((account) => (
                        <MenuItem key={account._id} value={account._id}>
                          {account.name} ({account.code})
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell width="20%">
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={entry.customer}
                      onChange={(e) => handleEntryChange(index, 'customer', e.target.value)}
                      label="Select Customer"
                    >
                      <MenuItem value="">None</MenuItem>
                      {customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.companyName} - {customer.telephone}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell width="20%">
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={entry.suppliers}
                      onChange={(e) => handleEntryChange(index, 'suppliers', e.target.value)}
                      label="Select Supplier"
                    >
                      <MenuItem value="">None</MenuItem>
                      {suppliers.map((supplier) => (
                        <MenuItem key={supplier.id} value={supplier.id}>
                          {supplier.companyName} - {supplier.telephone}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell width="15%" align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={entry.debitAmount}
                      onChange={(e) => handleEntryChange(index, 'debitAmount', e.target.value)}
                      inputProps={{ 
                        min: 0, 
                        step: "0.01",
                        style: { textAlign: 'right' }
                      }}
                      sx={{ width: '100%' }}
                      disabled={entry.creditAmount && entry.creditAmount !== '0'}
                    />
                  </TableCell>
                  <TableCell width="15%" align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={entry.creditAmount}
                      onChange={(e) => handleEntryChange(index, 'creditAmount', e.target.value)}
                      inputProps={{ 
                        min: 0, 
                        step: "0.01",
                        style: { textAlign: 'right' }
                      }}
                      sx={{ width: '100%' }}
                      disabled={entry.debitAmount && entry.debitAmount !== '0'}
                    />
                  </TableCell>
                  <TableCell width="5%" padding="none" align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveEntry(index)}
                      disabled={journalEntries.length === 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddEntry}
          >
            Add Entry
          </Button>
          <Typography>
            Total Debit: {formatCurrency(debitTotal)} | Total Credit: {formatCurrency(creditTotal)}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={success}
          >
            Submit Journal
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/transactions')}
          >
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
