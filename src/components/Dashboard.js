import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';

function Dashboard() {
  const navigate = useNavigate();
  const emptyData = [];
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
    { text: 'Transactions', icon: <AccountBalanceIcon />, path: '/transactions' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => {
              navigate(item.path);
              handleDrawerToggle();
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Financial Performance
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Financial Performance
        </Typography>
        
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Box sx={{ 
            height: { xs: 300, sm: 350 }, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch' 
          }}>
            <Box sx={{ 
              textAlign: 'center', 
              width: '100%', 
              px: { xs: 1, sm: 2 } 
            }}>
              <Box sx={{ mb: 3 }}>
                <img 
                  src="/lightbulb-icon.png" 
                  alt="Lightbulb"
                  style={{ width: 40, height: 40 }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </Box>
              <Typography variant="body1" gutterBottom>
                Once you start sending invoices or categorizing transactions, we'll display your company's revenue,
                expenses, and net income here.
              </Typography>
              <Box sx={{ 
                mt: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: 'center'
              }}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ 
                    maxWidth: { sm: '200px' },
                    height: '48px'
                  }}
                  onClick={() => navigate('/invoices')}
                >
                  Create an invoice
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ 
                    maxWidth: { sm: '200px' },
                    height: '48px'
                  }}
                  onClick={() => navigate('/transactions')}
                >
                  Go to my transactions
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              height: '100%',
              minHeight: '100px',
              touchAction: 'manipulation'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
                Total Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>₦0.00</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              height: '100%',
              minHeight: '100px',
              touchAction: 'manipulation'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
                Outstanding
              </Typography>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>₦0.00</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              height: '100%',
              minHeight: '100px',
              touchAction: 'manipulation'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
                Overdue
              </Typography>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>₦0.00</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              height: '100%',
              minHeight: '100px',
              touchAction: 'manipulation'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
                Paid Last 30 Days
              </Typography>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>₦0.00</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom>
                Expenses
              </Typography>
              <Box sx={{ height: { xs: 250, sm: 300 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" gutterBottom>
                    No expenses yet.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Connect a bank
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom>
                Tracked time
              </Typography>
              <Box sx={{ height: { xs: 250, sm: 300 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      sx={{ mr: 1 }}
                    >
                      Add team
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                    >
                      Add payroll
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
