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
  Chip
} from '@mui/material';
import axios from 'axios';

// Configure axios base URL if not already configured
axios.defaults.baseURL = 'http://localhost:5000';

const TransactionList = () => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Transaction type styles
  const typeStyles = {
    Receipt: { color: 'success' },
    Payment: { color: 'error' },
    Txn: { color: 'primary' },
    Journal: { color: 'warning' }
  };

  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/transactions/');
        
        // Sort transactions by date and transaction number in descending order
        const sortedTransactions = response.data.sort((a, b) => {
          const dateComparison = new Date(b.date) - new Date(a.date);
          if (dateComparison === 0) {
            // If dates are equal, sort by transaction number in descending order
            return b.transactionNumber.localeCompare(a.transactionNumber);
          }
          return dateComparison;
        });

        setTransactions(sortedTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err.response?.data?.message || 'Error loading transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format amount with currency
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format account or bank display
  const formatAccountOrBank = (item) => {
    if (!item) return '-';
    if (typeof item === 'string') return item;
    return `${item.name} (${item.code})`;
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ p: 2 }}
        >
          Transactions
        </Typography>

        <TableContainer>
          <Table sx={{ minWidth: 750 }} size="medium">
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
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">Loading...</TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">No transactions found</TableCell>
                </TableRow>
              ) : (
                transactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>{transaction.transactionNumber}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.type} 
                          size="small"
                          color={typeStyles[transaction.type]?.color || 'default'}
                        />
                      </TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.voucherNumber || '-'}</TableCell>
                      <TableCell>{transaction.reference || '-'}</TableCell>
                      <TableCell>{transaction.name || '-'}</TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell>{formatAccountOrBank(transaction.account)}</TableCell>
                      <TableCell>{formatAccountOrBank(transaction.bank)}</TableCell>
                      <TableCell>{transaction.paymentMethod || '-'}</TableCell>
                      <TableCell align="right">
                        {formatAmount(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

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