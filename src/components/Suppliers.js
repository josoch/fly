import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  TextField,
  Button,
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
  Checkbox,
  FormControlLabel,
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
import SupplierForm from './SupplierForm';
import ImportDialog from './ImportDialog';
import * as XLSX from 'xlsx';

const API_BASE_URL = '/api';
const initialSuppliers = [];

function Suppliers() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [filteredSuppliers, setFilteredSuppliers] = useState(initialSuppliers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState({});
  const [formMode, setFormMode] = useState('add');
  const [orderBy, setOrderBy] = useState('companyName');
  const [order, setOrder] = useState('asc');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [searchTerm, suppliers, showInactive]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/suppliers`);
      setSuppliers(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching suppliers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = [...suppliers];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.accountCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by active/inactive status
    if (!showInactive) {
      filtered = filtered.filter(supplier => !supplier.inactive);
    }

    setFilteredSuppliers(filtered);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);

    const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
      const aValue = a[property] || '';
      const bValue = b[property] || '';
      
      if (property === 'balance') {
        return isAsc ? aValue - bValue : bValue - aValue;
      }
      
      return isAsc
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });

    setFilteredSuppliers(sortedSuppliers);
  };

  const handleAddSupplier = () => {
    setCurrentSupplier(null);
    setFormMode('add');
    setOpenForm(true);
  };

  const handleEditSupplier = (supplier) => {
    setCurrentSupplier(supplier);
    setFormMode('edit');
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentSupplier(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (formMode === 'edit') {
        await axios.put(`${API_BASE_URL}/suppliers/${formData._id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/suppliers`, formData);
      }
      fetchSuppliers();
      setOpenForm(false);
      setCurrentSupplier(null);
    } catch (error) {
      console.error('Error saving supplier:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await axios.delete(`${API_BASE_URL}/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) {
        setError('Error deleting supplier: ' + err.message);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSuppliers.length === 0) return;

    const confirmMessage = selectedSuppliers.length === 1
      ? 'Are you sure you want to delete this supplier?'
      : `Are you sure you want to delete these ${selectedSuppliers.length} suppliers?`;

    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        const deletePromises = selectedSuppliers.map(id =>
          axios.delete(`${API_BASE_URL}/suppliers/${id}`)
        );
        await Promise.all(deletePromises);
        setSelectedSuppliers([]);
        await fetchSuppliers();
      } catch (err) {
        setError('Error deleting suppliers: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredSuppliers.map(supplier => supplier._id);
      setSelectedSuppliers(newSelected);
    } else {
      setSelectedSuppliers([]);
    }
  };

  const handleSelectSupplier = (id) => {
    const selectedIndex = selectedSuppliers.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedSuppliers, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedSuppliers.slice(1));
    } else if (selectedIndex === selectedSuppliers.length - 1) {
      newSelected = newSelected.concat(selectedSuppliers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedSuppliers.slice(0, selectedIndex),
        selectedSuppliers.slice(selectedIndex + 1)
      );
    }

    setSelectedSuppliers(newSelected);
  };

  const isSelected = (id) => selectedSuppliers.indexOf(id) !== -1;

  // Safe number formatting function
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleExportToExcel = () => {
    // Prepare the data for export
    const exportData = filteredSuppliers.map(supplier => ({
      'Account Code': supplier.accountCode || '',
      'Company Name': supplier.companyName || '',
      'Company Reg Number': supplier.companyRegNumber || '',
      'Balance': supplier.balance ? `₦${formatCurrency(supplier.balance)}` : '₦0.00',
      'Credit Limit': supplier.creditLimit ? `₦${formatCurrency(supplier.creditLimit)}` : '₦0.00',
      'Inactive': supplier.inactive ? 'Yes' : 'No',
      'Street 1': supplier.street1 || '',
      'Street 2': supplier.street2 || '',
      'Town': supplier.town || '',
      'County': supplier.county || '',
      'Post Code': supplier.postCode || '',
      'Country': supplier.country || '',
      'VAT Number': supplier.vatNumber || '',
      'Contact Name': supplier.contactName || '',
      'Trade Contact': supplier.tradeContact || '',
      'Telephone': supplier.telephone || '',
      'Mobile': supplier.mobile || '',
      'Website': supplier.website || '',
      'Twitter': supplier.twitter || '',
      'Facebook': supplier.facebook || '',
      'Email 1': supplier.email1 || '',
      'Email 2': supplier.email2 || '',
      'Send Via Email': supplier.sendViaEmail ? 'Yes' : 'No'
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Suppliers');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `suppliers_${date}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);
  };

  const handleDeleteClick = (e, supplier) => {
    e.stopPropagation();
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (supplierToDelete) {
      await handleDeleteSupplier(supplierToDelete._id);
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    await handleDeleteSelected();
    setBulkDeleteDialogOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
              onClick={handleAddSupplier}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Add Supplier
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
              placeholder="Search suppliers..."
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

          {selectedSuppliers.length > 0 && (
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
                Delete ({selectedSuppliers.length})
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
                    indeterminate={selectedSuppliers.length > 0 && selectedSuppliers.length < filteredSuppliers.length}
                    checked={filteredSuppliers.length > 0 && selectedSuppliers.length === filteredSuppliers.length}
                    onChange={handleSelectAll}
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
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Contact</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Telephone</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Status</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map((supplier) => {
                const isItemSelected = isSelected(supplier._id);
                return (
                  <TableRow
                    hover
                    key={supplier._id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleEditSupplier(supplier)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={() => handleSelectSupplier(supplier._id)}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>{supplier.accountCode}</TableCell>
                    <TableCell>{supplier.companyName}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{supplier.contactName}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{supplier.telephone}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{supplier.email1}</TableCell>
                    <TableCell align="right">₦{formatCurrency(supplier.balance)}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {supplier.inactive ? (
                        <Chip size="small" label="Inactive" color="error" />
                      ) : (
                        <Chip size="small" label="Active" color="success" />
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSupplier(supplier);
                          }}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={(e) => handleDeleteClick(e, supplier)}
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

      <SupplierForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        supplier={currentSupplier}
        mode={formMode}
      />

      <ImportDialog
        open={openImport}
        handleClose={() => setOpenImport(false)}
        onImportComplete={fetchSuppliers}
        entityType="suppliers"
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
            Are you sure you want to delete supplier "{supplierToDelete?.companyName}"? This action cannot be undone.
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
            Are you sure you want to delete {selectedSuppliers.length} selected supplier{selectedSuppliers.length > 1 ? 's' : ''}? This action cannot be undone.
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

export default Suppliers;
