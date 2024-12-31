import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function Journal() {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          General Journal Voucher
        </Typography>
        <Typography variant="body1">
          Journal entries will be displayed here.
        </Typography>
      </Paper>
    </Box>
  );
}
