import { FC } from 'react';
import { Box, Typography } from '@mui/material';

const UserDashboard: FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        User Dashboard
      </Typography>
      <Typography>
        Welcome to your dashboard. Here you can view your bookings and find charging stations.
      </Typography>
    </Box>
  );
};

export default UserDashboard; 