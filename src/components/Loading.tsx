import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}
    >
      <CircularProgress size={40} />
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loading; 