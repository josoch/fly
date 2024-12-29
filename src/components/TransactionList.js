import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Grid,
  Tooltip,
  Button,
  Stack,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Divider,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_BASE_URL = '/api';

const transactionTypes = [
  { value: '', label: 'All Types' },
  { value: 'Receipt', label: 'Receipt' },
  { value: 'Payment', label: 'Payment' },
  { value: 'Invoice', label: 'Invoice' },
  { value: 'Bill', label: 'Bill' }
];

const TransactionList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await axios.get(`${API_BASE_URL}/transactions?${queryParams}`);
      setTransactions(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (type, id) => {
    const route = type.toLowerCase();
    navigate(`/${route}s/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`${API_BASE_URL}/transactions/${id}`);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        setError('Failed to delete transaction');
      }
    }
  };

  const handleEnterTransaction = () => {
    // Open a menu with transaction type options
    const transactionType = window.prompt('Select transaction type:', 'Receipt');
    if (transactionType) {
      const route = transactionType.toLowerCase();
      navigate(`/${route}s/new`);
    }
  };

  const handleImport = () => {
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.xls';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Create FormData to send the file
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          setLoading(true);
          const response = await axios.post('/api/transactions/import', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          // Refresh the transactions list after import
          fetchTransactions();
        } catch (error) {
          console.error('Error importing transactions:', error);
          setError('Failed to import transactions');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fileInput.click();
  };

  const handleExportExcel = () => {
    // Prepare data for export
    const exportData = transactions.map(transaction => ({
      'Txn No': transaction.transactionNumber,
      'Type': transaction.type,
      'Date': formatDate(transaction.date),
      'Voucher Number': transaction.voucherNumber,
      'Reference': transaction.reference,
      'Name': transaction.name,
      'Description': transaction.description,
      'Account': transaction.account ? `${transaction.account.code} - ${transaction.account.name}` : '',
      'Bank': transaction.bank ? `${transaction.bank.code} - ${transaction.bank.name}` : '',
      'Payment Method': transaction.paymentMethod,
      'Amount': transaction.amount
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `Transactions_${date}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {/* Header with Title and Buttons */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2,
        mb: 3 
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h5" component="h2">
            Transactions
          </Typography>
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            color={showFilters ? 'primary' : 'default'}
          >
            <FilterListIcon />
          </IconButton>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1
        }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleEnterTransaction}
          >
            Enter Transaction
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
          >
            Excel
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={handleImport}
          >
            Import
          </Button>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Type"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Receipt">Receipt</MenuItem>
                  <MenuItem value="Payment">Payment</MenuItem>
                  <MenuItem value="Invoice">Invoice</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="End Date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Transactions List */}
      {isMobile ? (
        // Mobile Card View
        <Stack spacing={2}>
          {transactions.map((transaction) => (
            <Card key={transaction._id}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" component="div">
                    {transaction.transactionNumber}
                  </Typography>
                  <Chip
                    label={transaction.type}
                    size="small"
                    color={
                      transaction.type === 'Receipt' ? 'success' :
                      transaction.type === 'Payment' ? 'error' : 'primary'
                    }
                  />
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography variant="body1">{formatDate(transaction.date)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Amount</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatAmount(transaction.amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{transaction.name}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{transaction.description}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Account</Typography>
                    <Typography variant="body1">
                      {transaction.account ? `${transaction.account.code} - ${transaction.account.name}` : ''}
                    </Typography>
                  </Grid>
                  {transaction.bank && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Bank</Typography>
                      <Typography variant="body1">
                        {`${transaction.bank.code} - ${transaction.bank.name}`}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(transaction.type, transaction._id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(transaction._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        // Desktop Table View
        <TableContainer component={Paper}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Txn No</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Voucher Number</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{transaction.transactionNumber}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.voucherNumber}</TableCell>
                  <TableCell>{transaction.reference}</TableCell>
                  <TableCell>{transaction.name}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    {transaction.account ? `${transaction.account.code} - ${transaction.account.name}` : ''}
                  </TableCell>
                  <TableCell>
                    {transaction.bank ? `${transaction.bank.code} - ${transaction.bank.name}` : ''}
                  </TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell align="right">{formatAmount(transaction.amount)}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleEdit(transaction.type, transaction._id)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(transaction._id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TransactionList;
