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
import CustomerForm from './CustomerForm';

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
      const response = await axios.get('/api/customers');
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [orderBy, setOrderBy] = useState('companyName');
  const [order, setOrder] = useState('asc');

  // Safe string comparison function
  const safeString = (value) => {
    return (value || '').toString().toLowerCase();
  };

  // Safe number formatting function
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
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
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleSaveCustomer = async (customerData) => {
    await fetchCustomers(); // Refresh the list after save
    setIsFormOpen(false);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteCustomers = async () => {
    if (selectedCustomers.length === 0) {
      alert('Please select customers to delete');
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedCustomers.length} customer(s)?`);
    if (!confirmed) return;

    try {
      await Promise.all(
        selectedCustomers.map(id => 
          axios.delete(`/api/customers/${id}`)
        )
      );
      
      await fetchCustomers(); // Refresh the list after deletion
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error deleting customers:', error);
      alert('Error deleting customers. Please try again.');
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredCustomers.map((customer) => customer.id);
      setSelectedCustomers(newSelected);
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (id) => {
    const selectedIndex = selectedCustomers.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedCustomers, id];
    } else {
      newSelected = selectedCustomers.filter((selectedId) => selectedId !== id);
    }

    setSelectedCustomers(newSelected);
  };

  const isSelected = (id) => selectedCustomers.indexOf(id) !== -1;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ 
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* First Toolbar Row */}
          <Toolbar sx={{ 
            pl: { sm: 2 }, 
            pr: { xs: 1, sm: 1 },
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            minHeight: '48px !important'
          }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              sx={{ mr: 1 }}
              onClick={handleNewCustomer}
            >
              New/Edit
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<ReceiptIcon />}
              sx={{ mr: 1 }}
            >
              Receipt
            </Button>

            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              sx={{ mr: 1 }}
              onClick={handleDeleteCustomers}
              disabled={selectedCustomers.length === 0}
            >
              Delete
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<PrintIcon />}
              sx={{ mr: 1 }}
            >
              Print
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              sx={{ mr: 1 }}
            >
              Excel
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<AssessmentIcon />}
              sx={{ mr: 1 }}
            >
              Reports
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshIcon />}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<FilterListIcon />}
            >
              Filter
            </Button>
          </Toolbar>

          {/* Second Toolbar Row */}
          <Toolbar sx={{ 
            pl: { sm: 2 }, 
            pr: { xs: 1, sm: 1 },
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            minHeight: '48px !important'
          }}>
            <TextField
              size="small"
              placeholder="Search..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ 
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: 300 }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    size="small"
                  />
                }
                label="Include inactive"
              />
            </Box>
          </Toolbar>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 750 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
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
                <TableCell>Inactive</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'balance'}
                    direction={orderBy === 'balance' ? order : 'asc'}
                    onClick={() => handleSort('balance')}
                  >
                    Balance
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Credit Limit</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Telephone</TableCell>
                <TableCell align="center">Email Or Print</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const isItemSelected = isSelected(customer.id);
                
                return (
                  <TableRow
                    hover
                    onClick={() => handleSelectCustomer(customer.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={customer.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                      />
                    </TableCell>
                    <TableCell>{customer.accountCode}</TableCell>
                    <TableCell>{customer.companyName}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={customer.inactive}
                        size="small"
                        disabled
                      />
                    </TableCell>
                    <TableCell align="right">
                      ₦{formatCurrency(customer.balance)}
                    </TableCell>
                    <TableCell align="right">
                      ₦{formatCurrency(customer.creditLimit)}
                    </TableCell>
                    <TableCell>{customer.contactName}</TableCell>
                    <TableCell>{customer.telephone}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small">
                        <EmailIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <PrintIcon fontSize="small" />
                      </IconButton>
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
        onClose={() => setIsFormOpen(false)} 
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />
    </Box>
  );
}

export default Customers;
