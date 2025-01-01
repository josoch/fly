import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function JournalForm() {
  const navigate = useNavigate();
  const emptyEntry = {
    txnNo: '',
    type: 'Journal',
    name: '',
    chartAccount: '',
    debitAmount: 0,
    creditAmount: 0,
    amount: 0,
    entityType: 'Customer',
  };

  const [journalEntries, setJournalEntries] = useState([emptyEntry]);
  const [commonFields, setCommonFields] = useState({
    date: new Date().toISOString().split('T')[0],
    voucherNumber: '',
    reference: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [chartAccounts, setChartAccounts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txnResponse, customersResponse, suppliersResponse, accountsResponse] = await Promise.all([
          axios.get('/api/transactions/next-number'),
          axios.get('/api/customers'),
          axios.get('/api/suppliers'),
          axios.get('/api/accounts')
        ]);

        setJournalEntries([{
          ...emptyEntry,
          txnNo: txnResponse.data.transactionNumber
        }]);

        setCustomers(customersResponse.data);
        setSuppliers(suppliersResponse.data);
        setChartAccounts(accountsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading form data');
      }
    };
    fetchData();
  }, []);

  const handleChange = (index, field) => (event) => {
    const value = event.target.value;
    setJournalEntries(prevEntries => {
      const newEntries = [...prevEntries];
      newEntries[index] = {
        ...newEntries[index],
        [field]: value,
        ...(field === 'entityType' ? { name: '' } : {}),
        ...(field === 'debitAmount' || field === 'creditAmount' ? {
          amount: Math.abs(parseFloat(value) || 0)
        } : {})
      };
      return newEntries;
    });
  };

  const handleCommonFieldChange = (field) => (event) => {
    const value = event.target.value;
    setCommonFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addNewRow = (index) => {
    setJournalEntries(prevEntries => {
      const newEntries = [...prevEntries];
      newEntries.splice(index + 1, 0, { ...emptyEntry });
      return newEntries;
    });
  };

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

      // Submit all entries with common fields
      const response = await axios.post('/api/transactions', journalEntries.map(entry => ({
        ...entry,
        ...commonFields,
        debit: {
          account: entry.chartAccount,
          amount: entry.debitAmount
        },
        credit: {
          account: entry.chartAccount,
          amount: entry.creditAmount
        }
      })));

      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/journal');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting journal entries');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(value);
  };

  const calculateTotals = () => {
    return journalEntries.reduce((acc, entry) => ({
      debitTotal: acc.debitTotal + Number(entry.debitAmount || 0),
      creditTotal: acc.creditTotal + Number(entry.creditAmount || 0)
    }), { debitTotal: 0, creditTotal: 0 });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Journal Entry Form
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Date"
                type="date"
                value={commonFields.date}
                onChange={handleCommonFieldChange('date')}
                required
                fullWidth
                size="small"
                InputLabelProps={{ 
                  shrink: true,
                  sx: { fontSize: '0.875rem' }
                }}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    fontSize: '0.875rem',
                    height: '1.5rem'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Voucher Number"
                value={commonFields.voucherNumber}
                onChange={handleCommonFieldChange('voucherNumber')}
                required
                fullWidth
                size="small"
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    fontSize: '0.875rem',
                    height: '1.5rem'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Reference"
                value={commonFields.reference}
                onChange={handleCommonFieldChange('reference')}
                fullWidth
                size="small"
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    fontSize: '0.875rem',
                    height: '1.5rem'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Description"
                value={commonFields.description}
                onChange={handleCommonFieldChange('description')}
                fullWidth
                size="small"
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    fontSize: '0.875rem',
                    height: '1.5rem'
                  }
                }}
              />
            </Grid>
          </Grid>

          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '20%' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '20%' }}>COA</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '22%' }}>Debit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '22%' }}>Credit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '10%' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', width: '6%' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {journalEntries.map((entry, index) => (
                  <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                    <TableCell>
                      <TextField
                        select
                        value={entry.name}
                        onChange={handleChange(index, 'name')}
                        required
                        fullWidth
                        size="small"
                        sx={{ 
                          '& .MuiInputBase-input': { 
                            fontSize: '0.875rem',
                            height: '1.5rem'
                          }
                        }}
                      >
                        {(entry.entityType === 'Customer' ? customers : suppliers).map((option) => (
                          <MenuItem 
                            key={option._id} 
                            value={option.companyName}
                            sx={{ fontSize: '0.875rem' }}
                          >
                            {option.companyName}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        value={entry.chartAccount}
                        onChange={handleChange(index, 'chartAccount')}
                        required
                        fullWidth
                        size="small"
                        sx={{ 
                          '& .MuiInputBase-input': { 
                            fontSize: '0.875rem',
                            height: '1.5rem'
                          }
                        }}
                      >
                        {chartAccounts.map((account) => (
                          <MenuItem 
                            key={account._id} 
                            value={account._id}
                            sx={{ fontSize: '0.875rem' }}
                          >
                            {account.name} ({account.code})
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={entry.debitAmount}
                        onChange={handleChange(index, 'debitAmount')}
                        InputProps={{
                          inputProps: { 
                            min: 0,
                            style: { textAlign: 'right' }
                          },
                          startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                        }}
                        fullWidth
                        required
                        size="small"
                        sx={{ 
                          '& .MuiInputBase-input': { 
                            fontSize: '0.875rem',
                            height: '1.5rem',
                            paddingLeft: '0.5rem'
                          },
                          '& .MuiInputAdornment-root': {
                            '& p': {
                              fontSize: '0.875rem'
                            }
                          },
                          '& .MuiOutlinedInput-root': {
                            paddingRight: '8px'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={entry.creditAmount}
                        onChange={handleChange(index, 'creditAmount')}
                        InputProps={{
                          inputProps: { 
                            min: 0,
                            style: { textAlign: 'right' }
                          },
                          startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                        }}
                        fullWidth
                        required
                        size="small"
                        sx={{ 
                          '& .MuiInputBase-input': { 
                            fontSize: '0.875rem',
                            height: '1.5rem',
                            paddingLeft: '0.5rem'
                          },
                          '& .MuiInputAdornment-root': {
                            '& p': {
                              fontSize: '0.875rem'
                            }
                          },
                          '& .MuiOutlinedInput-root': {
                            paddingRight: '8px'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                        row
                        value={entry.entityType}
                        onChange={handleChange(index, 'entityType')}
                        sx={{ 
                          justifyContent: 'center',
                          '& .MuiFormControlLabel-root': { 
                            margin: 0,
                            marginLeft: '4px'
                          }
                        }}
                      >
                        <FormControlLabel 
                          value="Customer" 
                          control={<Radio size="small" />} 
                          label="C" 
                          sx={{ 
                            '& .MuiFormControlLabel-label': { 
                              fontSize: '0.75rem'
                            }
                          }}
                        />
                        <FormControlLabel 
                          value="Supplier" 
                          control={<Radio size="small" />} 
                          label="S" 
                          sx={{ 
                            '& .MuiFormControlLabel-label': { 
                              fontSize: '0.75rem'
                            }
                          }}
                        />
                      </RadioGroup>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => addNewRow(index)}
                        size="small"
                      >
                        <AddCircleOutlineIcon sx={{ fontSize: '1.25rem' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Total:
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.875rem',
                    textAlign: 'right',
                    paddingRight: '14px'
                  }}>
                    {formatCurrency(calculateTotals().debitTotal)}
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.875rem',
                    textAlign: 'right',
                    paddingRight: '14px'
                  }}>
                    {formatCurrency(calculateTotals().creditTotal)}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {error && (
            <Typography color="error" sx={{ mt: 2, fontSize: '0.875rem' }}>
              {error}
            </Typography>
          )}

          {success && (
            <Typography color="success.main" sx={{ mt: 2, fontSize: '0.875rem' }}>
              Journal entries submitted successfully!
            </Typography>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ 
                minWidth: 150,
                fontSize: '0.875rem',
                textTransform: 'none'
              }}
            >
              Submit Entries
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
