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
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions/');
      if (response.data) {
        // Sort transactions by createdAt timestamp in ascending order
        const sortedTransactions = response.data
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((transaction, index) => ({
            ...transaction,
            serialNumber: index + 1
          }));
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
        const comparison = new Date(a.createdAt) - new Date(b.createdAt);
        return newDirection === 'asc' ? comparison : -comparison;
      }).map((transaction, index) => ({
        ...transaction,
        serialNumber: index + 1
      }));
      return sorted;
    });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
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
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Bank</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{transaction.serialNumber}</TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        size="small"
                        sx={typeStyles[transaction.type] || {}}
                      />
                    </TableCell>
                    <TableCell>{transaction.name}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell align="right">
                      {Number(transaction.amount).toLocaleString('en-NG', {
                        style: 'currency',
                        currency: 'NGN'
                      })}
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