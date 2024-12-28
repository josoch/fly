import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ChartForm from './ChartForm';
import ImportDialog from './ImportDialog';

const API_BASE_URL = '/api';

// Sample data for testing
const sampleAccounts = [
  {
    _id: '1',
    accountCode: '1000',
    accountName: 'Cash',
    accountType: 'Asset',
    balance: 150000.00
  },
  {
    _id: '2',
    accountCode: '1100',
    accountName: 'Bank Account',
    accountType: 'Asset',
    balance: 2500000.00
  },
  {
    _id: '3',
    accountCode: '2000',
    accountName: 'Accounts Payable',
    accountType: 'Liability',
    balance: -350000.00
  },
  {
    _id: '4',
    accountCode: '3000',
    accountName: 'Share Capital',
    accountType: 'Equity',
    balance: -1000000.00
  },
  {
    _id: '5',
    accountCode: '4000',
    accountName: 'Sales Revenue',
    accountType: 'Revenue',
    balance: -750000.00
  },
  {
    _id: '6',
    accountCode: '5000',
    accountName: 'Cost of Goods Sold',
    accountType: 'Expense',
    balance: 450000.00
  },
  {
    _id: '7',
    accountCode: '6000',
    accountName: 'Salaries Expense',
    accountType: 'Expense',
    balance: 280000.00
  },
  {
    _id: '8',
    accountCode: '1200',
    accountName: 'Accounts Receivable',
    accountType: 'Asset',
    balance: 420000.00
  },
  {
    _id: '9',
    accountCode: '1300',
    accountName: 'Inventory',
    accountType: 'Asset',
    balance: 680000.00
  },
  {
    _id: '10',
    accountCode: '2100',
    accountName: 'Bank Loan',
    accountType: 'Liability',
    balance: -900000.00
  }
];

const Chart = () => {
  const [accounts, setAccounts] = useState(sampleAccounts);
  const [filteredAccounts, setFilteredAccounts] = useState(sampleAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [openImport, setOpenImport] = useState(false);

  useEffect(() => {
    // Comment out API call for now
    // fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    // Simulating API call with sample data
    setAccounts(sampleAccounts);
    setFilteredAccounts(sampleAccounts);
  };

  useEffect(() => {
    const filtered = accounts.filter(account => 
      account.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAccounts(filtered);
    setPage(0);
  }, [searchTerm, accounts]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleAddAccount = () => {
    setCurrentAccount(null);
    setFormMode('add');
    setOpenForm(true);
  };

  const handleEditAccount = (account) => {
    setCurrentAccount(account);
    setFormMode('edit');
    setOpenForm(true);
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (formMode === 'edit') {
        // Simulate API update
        const updatedAccounts = accounts.map(acc => 
          acc._id === currentAccount._id ? { ...formData, _id: acc._id } : acc
        );
        setAccounts(updatedAccounts);
      } else {
        // Simulate API create
        const newAccount = {
          ...formData,
          _id: Date.now().toString()
        };
        setAccounts([...accounts, newAccount]);
      }
      setOpenForm(false);
      setCurrentAccount(null);
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      // Simulate API delete
      const updatedAccounts = accounts.filter(acc => acc._id !== accountToDelete._id);
      setAccounts(updatedAccounts);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(accounts.map(account => ({
      'Account Code': account.accountCode,
      'Account Name': account.accountName,
      'Account Type': account.accountType,
      'Balance': account.balance
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Chart of Accounts');
    
    const fileName = `Chart_of_Accounts_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Chart of Accounts
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setOpenImport(true)}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportToExcel}
          >
            Export to Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAccount}
          >
            Add Account
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search accounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Account Code</TableCell>
              <TableCell>Account Name</TableCell>
              <TableCell>Account Type</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAccounts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((account) => (
                <TableRow key={account._id}>
                  <TableCell>{account.accountCode}</TableCell>
                  <TableCell>{account.accountName}</TableCell>
                  <TableCell>{account.accountType}</TableCell>
                  <TableCell align="right">{formatCurrency(account.balance)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditAccount(account)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteClick(account)} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAccounts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <ChartForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmitForm}
        account={currentAccount}
        mode={formMode}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete account "{accountToDelete?.accountName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ImportDialog
        open={openImport}
        handleClose={() => setOpenImport(false)}
        onImportComplete={fetchAccounts}
        entityType="coa"
      />
    </Box>
  );
};

export default Chart;
