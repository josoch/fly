import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

export default function Reports() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Financial Reports
            </Typography>
            <Typography variant="body1">
              View and generate financial reports including profit & loss statements, balance sheets, and cash flow statements.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Reports
            </Typography>
            <Typography variant="body1">
              Access detailed transaction reports, customer statements, and supplier payment history.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tax Reports
            </Typography>
            <Typography variant="body1">
              Generate tax reports and summaries for compliance and filing purposes.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Custom Reports
            </Typography>
            <Typography variant="body1">
              Create and save custom reports based on your specific business needs.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
