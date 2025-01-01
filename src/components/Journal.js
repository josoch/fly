import React from 'react';
import { Box } from '@mui/material';
import JournalForm from './JournalForm';

import { Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Journal() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom>
        General Journal
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/journal/new')}
        sx={{ marginLeft: 'auto' }}
      >
        Create General Journal
      </Button>
    </Box>
  );
}
