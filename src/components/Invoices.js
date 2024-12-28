import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Invoices
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mt: 4 
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onClick={() => navigate('/receipts')}
        >
          <ReceiptIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Receipts
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Create and manage customer receipts
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ReceiptIcon />}
            sx={{ mt: 2 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/receipts/new');
            }}
          >
            New Receipt
          </Button>
        </Paper>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onClick={() => navigate('/payments')}
        >
          <PaymentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Payments
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Create and manage supplier payments
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<PaymentIcon />}
            sx={{ mt: 2 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/payments/new');
            }}
          >
            New Payment
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default Invoices;
