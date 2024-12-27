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

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [searchTerm, suppliers, showInactive]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/suppliers');
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
    setCurrentSupplier({});
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
    setCurrentSupplier({});
  };

  const handleSubmitForm = async () => {
    try {
      if (formMode === 'add') {
        await axios.post('/api/suppliers', currentSupplier);
      } else {
        await axios.put(`/api/suppliers/${currentSupplier._id}`, currentSupplier);
      }
      fetchSuppliers();
      handleCloseForm();
    } catch (err) {
      setError('Error saving supplier: ' + err.message);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await axios.delete(`/api/suppliers/${id}`);
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
          axios.delete(`/api/suppliers/${id}`)
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
        selectedSuppliers.slice(selectedIndex + 1),
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <TextField
              size="small"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSupplier}
            >
              Add Supplier
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => setOpenImport(true)}
            >
              Import
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchSuppliers}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </Button>
            {selectedSuppliers.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteSelected}
              >
                Delete ({selectedSuppliers.length})
              </Button>
            )}
          </Stack>
        </Toolbar>
        <Divider />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
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
                    Account Code
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'companyName'}
                    direction={orderBy === 'companyName' ? order : 'asc'}
                    onClick={() => handleSort('companyName')}
                  >
                    Company Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Contact Name</TableCell>
                <TableCell>Telephone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'balance'}
                    direction={orderBy === 'balance' ? order : 'asc'}
                    onClick={() => handleSort('balance')}
                  >
                    Balance
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
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
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={() => handleSelectSupplier(supplier._id)}
                      />
                    </TableCell>
                    <TableCell>{supplier.accountCode}</TableCell>
                    <TableCell>{supplier.companyName}</TableCell>
                    <TableCell>{supplier.contactName}</TableCell>
                    <TableCell>{supplier.telephone}</TableCell>
                    <TableCell>{supplier.email1}</TableCell>
                    <TableCell align="right">
                      ₦{formatCurrency(supplier.balance)}
                    </TableCell>
                    <TableCell>
                      {supplier.inactive ? (
                        <Typography color="error">Inactive</Typography>
                      ) : (
                        <Typography color="success">Active</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditSupplier(supplier)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteSupplier(supplier._id)}>
                          <DeleteIcon />
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
        handleClose={handleCloseForm}
        handleSubmit={handleSubmitForm}
        supplier={currentSupplier}
        setSupplier={setCurrentSupplier}
        mode={formMode}
      />

      <ImportDialog
        open={openImport}
        handleClose={() => setOpenImport(false)}
        onImportComplete={fetchSuppliers}
        entityType="suppliers"
      />
    </Box>
  );
}

export default Suppliers;
