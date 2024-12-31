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
  TablePagination,
  Alert,
  Snackbar,
  Chip,
  TableSortLabel,
  Toolbar,
  IconButton,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import * as XLSX from 'xlsx';
import axios from 'axios';

// Configure axios base URL if not already configured
axios.defaults.baseURL = 'http://localhost:5000';

const TransactionList = () => {
  const navigate = useNavigate();
  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // Transaction type styles
  const typeStyles = {
    Receipt: {
      color: 'success.main',
      bgcolor: 'success.lighter',
    },
    Payment: {
      color: 'error.main',
      bgcolor: 'error.lighter',
    }
  };

  // Format date to DD-MM-YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions/', {
        params: {
          includeReceipts: true
        }
      });
      
      if (response.data) {
        // Sort transactions by date
        const sortedTransactions = response.data.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA === dateB ? 0 : dateA - dateB;
        });
        setTransactions(sortedTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Handle sort toggle
  const handleSortToggle = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    
    setTransactions(prev => {
      const sorted = [...prev].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        const comparison = dateA - dateB;
        return newDirection === 'asc' ? comparison : -comparison;
      });
      return sorted;
    });
  };

  // Handle edit click
  const handleEdit = (transactionId) => {
    const transaction = transactions.find(t => t._id === transactionId);
    if (transaction) {
      if (transaction.type === 'Receipt') {
        navigate(`/receipts/edit/${transactionId}`);
      } else {
        navigate(`/transactions/edit/${transactionId}`);
      }
    }
  };

  // Handle delete click
  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      setLoading(true);
      const endpoint = transactionToDelete.type === 'Receipt' ? 'receipts' : 'transactions';
      await axios.delete(`/api/${endpoint}/${transactionToDelete._id}`);
      await fetchTransactions();
      setError(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Failed to delete transaction');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  // Handle Excel export
  const handleExcelExport = () => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    });

    // Transform data for export
    const exportData = transactions.map(({
      transactionNumber,
      date,
      type,
      name,
      description,
      amount,
      account,
      bank,
      reference,
      voucherNumber,
      paymentMethod
    }) => ({
      'Transaction No': transactionNumber,
      'Date': formatDate(date),
      'Type': type,
      'Name': name,
      'Description': description,
      'Amount': formatter.format(amount),
      'Account': typeof account === 'object' ? `${account.name} (${account.code})` : account,
      'Bank': typeof bank === 'object' ? `${bank.name} (${bank.code})` : bank,
      'Reference': reference,
      'Voucher No': voucherNumber,
      'Payment Method': paymentMethod
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, 'transactions.xlsx');
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, bgcolor: 'background.paper' }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/transactions/new')}
            >
              Enter Transaction
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExcelExport}
            >
              EXCEL
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
            >
              IMPORT
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Stack>
        </Toolbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={true}
                    direction={sortDirection}
                    onClick={handleSortToggle}
                  >
                    Txn No
                  </TableSortLabel>
                </TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Voucher No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .filter(transaction =>
                  Object.values(transaction).some(value =>
                    value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                  )
                )
                .map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{transaction.transactionNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        size="small"
                        sx={typeStyles[transaction.type] || {}}
                      />
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.reference}</TableCell>
                    <TableCell>{transaction.voucherNumber}</TableCell>
                    <TableCell>{transaction.name}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN'
                      }).format(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {typeof transaction.account === 'object'
                        ? `${transaction.account.name} (${transaction.account.code})`
                        : transaction.account}
                    </TableCell>
                    <TableCell>
                      {typeof transaction.bank === 'object'
                        ? `${transaction.bank.name} (${transaction.bank.code})`
                        : transaction.bank}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(transaction._id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(transaction)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction?
            {transactionToDelete && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Date: {formatDate(transactionToDelete.date)}<br />
                  Reference: {transactionToDelete.reference}<br />
                  Amount: {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN'
                  }).format(transactionToDelete.amount)}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionList;