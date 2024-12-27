import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import InvoiceForm from './components/InvoiceForm';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#00C853',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: {
            xs: '100%',
            sm: 240,
          },
        },
      },
    },
  },
});

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Navbar onMenuClick={handleDrawerToggle} />
          <Sidebar 
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            variant={isMobile ? 'temporary' : 'permanent'}
          />
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              p: { xs: 2, sm: 3 }, 
              mt: { xs: 7, sm: 8 },
              width: { sm: `calc(100% - ${240}px)` }
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invoices/new" element={<InvoiceForm />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/suppliers" element={<Suppliers />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
