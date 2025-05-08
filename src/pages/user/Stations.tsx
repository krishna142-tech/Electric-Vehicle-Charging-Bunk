import { FC } from 'react';
import { Box, Typography } from '@mui/material';
import Map from '../../components/Map';

const Stations: FC = () => {
  return (
    <Box sx={{ height: '100vh', width: '100%' }}>
      <Typography variant="h4" gutterBottom p={3}>
        Find Charging Stations
      </Typography>
      <Map />
    </Box>
  );
};

export default Stations; 