import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function Dashboard() {
  const navigate = useNavigate();
  const emptyData = [];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Financial Performance
      </Typography>
      
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box sx={{ 
          height: { xs: 250, sm: 300 }, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'auto' 
        }}>
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <img 
                src="/lightbulb-icon.png" 
                alt="Lightbulb"
                style={{ width: 48, height: 48 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>
            <Typography variant="body1" gutterBottom>
              Once you start sending invoices or categorizing transactions, we'll display your company's revenue,
              expenses, and net income here.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                sx={{ mr: 2 }}
                onClick={() => navigate('/invoices/new')}
              >
                Create an invoice
              </Button>
              <Button
                variant="contained"
                color="primary"
              >
                Go to my transactions
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Total Revenue</Typography>
            <Typography variant="h4">₦0.00</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Outstanding</Typography>
            <Typography variant="h4">₦0.00</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Overdue</Typography>
            <Typography variant="h4">₦0.00</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Paid Last 30 Days</Typography>
            <Typography variant="h4">₦0.00</Typography>
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
  );
}

export default Dashboard;
