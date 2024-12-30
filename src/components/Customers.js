import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Divider,
  Tooltip,
  Stack,
  Switch,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';
import * as XLSX from 'xlsx';
import CustomerForm from './CustomerForm';
import ImportDialog from './ImportDialog';

const API_BASE_URL = '/api';

const initialCustomers = [
  {
    id: '1',
    accountCode: 'CUST001',
    companyName: 'Acme Corporation',
    inactive: false,
    balance: 5000.00,
    creditLimit: 10000.00,
    contactName: 'John Doe',
    telephone: '123-456-7890',
    email1: 'john@acme.com'
  },
  // Add more sample data as needed
];

function Customers() {
  // Initialize customers from API or empty array
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers`);
      setCustomers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Error loading customers. Please try again.');
      setLoading(false);
    }
  };

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [orderBy, setOrderBy] = useState('companyName');
  const [order, setOrder] = useState('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formMode, setFormMode] = useState('add');

  // Safe string comparison function
  const safeString = (value) => {
    return (value || '').toString().toLowerCase();
  };

  // Safe number formatting function
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).replace('NGN', '₦');
  };

  const filteredCustomers = customers
    .filter(customer => showInactive || !customer.inactive)
    .filter(customer => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        safeString(customer.accountCode).includes(search) ||
        safeString(customer.companyName).includes(search) ||
        safeString(customer.contactName).includes(search) ||
        safeString(customer.telephone).includes(search) ||
        safeString(customer.email1).includes(search)
      );
    })
    .sort((a, b) => {
      const aValue = safeString(a[orderBy]);
      const bValue = safeString(b[orderBy]);
      return (order === 'asc' ? 1 : -1) * aValue.localeCompare(bValue);
    });

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFormClose = (customerData) => {
    if (customerData) {
      setCustomers(prev => {
        try {
          if (selectedCustomer) {
            // Update existing customer
            return prev.map(customer => 
              customer.id === selectedCustomer.id 
                ? { 
                    ...customer, 
                    ...customerData,
                    modifiedAt: new Date().toISOString() 
                  }
                : customer
            );
          } else {
            // Add new customer
            const newCustomer = {
              id: Date.now(),
              ...customerData,
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
              accountCode: customerData.accountCode || '',
              companyName: customerData.companyName || '',
              contactName: customerData.contactName || '',
              telephone: customerData.telephone || '',
              email1: customerData.email1 || '',
              balance: parseFloat(customerData.balance || '0.00'),
              creditLimit: parseFloat(customerData.creditLimit || '0.00'),
              inactive: customerData.inactive || false
            };
            return [...prev, newCustomer];
          }
        } catch (error) {
          console.error('Error updating customers:', error);
          return prev;
        }
      });
    }
    setSelectedCustomer(null);
    setIsFormOpen(false);
  };

  const handleNewCustomer = () => {
    setCurrentCustomer(null);
    setFormMode('add');
    setIsFormOpen(true);
  };

  const handleSaveCustomer = async (customerData) => {
    await fetchCustomers(); // Refresh the list after save
    setIsFormOpen(false);
  };

  const handleEditCustomer = (customer) => {
    setCurrentCustomer(customer);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (formMode === 'edit') {
        await axios.put(`${API_BASE_URL}/customers/${formData._id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/customers`, formData);
      }
      fetchCustomers();
      setIsFormOpen(false);
      setCurrentCustomer(null);
    } catch (error) {
      console.error('Error saving customer:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentCustomer(null);
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/customers/${id}`);
      fetchCustomers(); // Refresh the list after deletion
      setSelectedCustomers(selectedCustomers.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedCustomers.map(id => axios.delete(`${API_BASE_URL}/customers/${id}`)));
      fetchCustomers(); // Refresh the list after deletion
      setSelectedCustomers([]); // Clear selection after deletion
    } catch (error) {
      console.error('Error deleting selected customers:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredCustomers.map((customer) => customer._id);
      setSelectedCustomers(newSelected);
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (id) => {
    const selectedIndex = selectedCustomers.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedCustomers, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedCustomers.slice(1));
    } else if (selectedIndex === selectedCustomers.length - 1) {
      newSelected = newSelected.concat(selectedCustomers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedCustomers.slice(0, selectedIndex),
        selectedCustomers.slice(selectedIndex + 1)
      );
    }

    setSelectedCustomers(newSelected);
  };

  const isSelected = (id) => selectedCustomers.indexOf(id) !== -1;

  const handleExportToExcel = () => {
    // Prepare the data for export
    const exportData = filteredCustomers.map(customer => ({
      'Account Code': customer.accountCode || '',
      'Company Name': customer.companyName || '',
      'Company Reg Number': customer.companyRegNumber || '',
      'Balance': formatCurrency(customer.balance),
      'Credit Limit': formatCurrency(customer.creditLimit),
      'Inactive': customer.inactive ? 'Yes' : 'No',
      'Street 1': customer.street1 || '',
      'Street 2': customer.street2 || '',
      'Town': customer.town || '',
      'LGA': customer.LGA || '',
      'Post Code': customer.postCode || '',
      'Country': customer.country || '',
      'VAT Number': customer.vatNumber || '',
      'Contact Name': customer.contactName || '',
      'Trade Contact': customer.tradeContact || '',
      'Telephone': customer.telephone || '',
      'Mobile': customer.mobile || '',
      'Website': customer.website || '',
      'Twitter': customer.twitter || '',
      'Facebook': customer.facebook || '',
      'Email 1': customer.email1 || '',
      'Email 2': customer.email2 || '',
      'Send Via Email': customer.sendViaEmail ? 'Yes' : 'No'
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `customers_${date}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);
  };

  const handleDeleteClick = (e, customer) => {
    e.stopPropagation();
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      await handleDeleteCustomer(customerToDelete._id);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    await handleDeleteSelected();
    setBulkDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            mb: { xs: 1, sm: 0 }
          }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewCustomer}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Add Customer
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportToExcel}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => setOpenImport(true)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Import
            </Button>
          </Box>

          <Box sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            alignItems: 'center'
          }}>
            <TextField
              size="small"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                width: { xs: '100%', sm: 200, md: 250 },
                ml: { sm: 2 }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  size="small"
                />
              }
              label="Show Inactive"
              sx={{ ml: { sm: 2 } }}
            />
          </Box>

          {selectedCustomers.length > 0 && (
            <Box sx={{ 
              display: 'flex',
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 1, sm: 0 }
            }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDeleteClick}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Delete ({selectedCustomers.length})
              </Button>
            </Box>
          )}
        </Toolbar>

        <TableContainer sx={{ maxHeight: { xs: 'calc(100vh - 300px)', sm: 'calc(100vh - 250px)' }, overflowY: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < filteredCustomers.length}
                    checked={filteredCustomers.length > 0 && selectedCustomers.length === filteredCustomers.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'accountCode'}
                    direction={orderBy === 'accountCode' ? order : 'asc'}
                    onClick={() => handleSort('accountCode')}
                  >
                    A/C
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'companyName'}
                    direction={orderBy === 'companyName' ? order : 'asc'}
                    onClick={() => handleSort('companyName')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{display: { xs: 'none', sm: 'table-cell'}}}>Contact</TableCell>
                <TableCell sx={{display: { xs: 'none', md: 'table-cell'}}}>Telephone</TableCell>
                <TableCell sx={{display: { xs: 'none', md: 'table-cell'}}}>Email</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell sx={{display: { xs: 'none', sm: 'table-cell'}}}>Status</TableCell>
                <TableCell align="right" sx={{display: { xs: 'none', sm: 'table-cell'}}}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const isItemSelected = isSelected(customer._id);
                
                return (
                  <TableRow
                    hover
                    key={customer._id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleEditCustomer(customer)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={() => handleSelectCustomer(customer._id)}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>{customer.accountCode}</TableCell>
                    <TableCell>{customer.companyName}</TableCell>
                    <TableCell sx={{display: { xs: 'none', sm: 'table-cell'}}}>{customer.contactName}</TableCell>
                    <TableCell sx={{display: { xs: 'none', md: 'table-cell'}}}>{customer.telephone}</TableCell>
                    <TableCell sx={{display: { xs: 'none', md: 'table-cell'}}}>{customer.email1}</TableCell>
                    <TableCell align="right">{formatCurrency(customer.balance)}</TableCell>
                    <TableCell sx={{display: { xs: 'none', sm: 'table-cell'}}}>
                      {customer.inactive ? (
                        <Chip size="small" label="Inactive" color="error" />
                      ) : (
                        <Chip size="small" label="Active" color="success" />
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{display: { xs: 'none', sm: 'table-cell'}}}>
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCustomer(customer);
                          }}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={(e) => handleDeleteClick(e, customer)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <CustomerForm 
        open={isFormOpen} 
        onClose={handleCloseForm} 
        customer={currentCustomer}
        onSave={handleSubmitForm}
        mode={formMode}
      />
      <ImportDialog
        open={openImport}
        handleClose={() => setOpenImport(false)}
        onImportComplete={fetchCustomers}
        entityType="customers"
      />

      {/* Single Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete customer "{customerToDelete?.companyName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        aria-labelledby="bulk-delete-dialog-title"
        aria-describedby="bulk-delete-dialog-description"
      >
        <DialogTitle id="bulk-delete-dialog-title">
          Confirm Multiple Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="bulk-delete-dialog-description">
            Are you sure you want to delete {selectedCustomers.length} selected customer{selectedCustomers.length > 1 ? 's' : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleBulkDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Customers;
