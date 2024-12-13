import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ContactsIcon from '@mui/icons-material/Contacts';
import TimerIcon from '@mui/icons-material/Timer';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
  { text: 'Transactions', icon: <AccountBalanceIcon />, path: '/transactions' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Customers', icon: <BusinessIcon />, path: '/customers' },
  { text: 'Suppliers', icon: <LocalShippingIcon />, path: '/suppliers' },
  { text: 'Contacts', icon: <ContactsIcon />, path: '/contacts' },
  { text: 'Time Tracking', icon: <TimerIcon />, path: '/tracking' },
  { text: 'Team', icon: <PeopleIcon />, path: '/team' },
];

function Sidebar({ open, onClose, variant = 'permanent' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      <List sx={{ pt: { xs: 2, sm: 8 } }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  onClose();
                }
              }}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  opacity: 1,
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
}

export default Sidebar;
