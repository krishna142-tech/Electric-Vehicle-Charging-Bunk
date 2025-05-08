import { FC } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import StationCard from './StationCard';

interface Station {
  id: string;
  name: string;
  location: string;
  rate: string;
  hours: string;
  slots: string;
  status: 'operational' | 'maintenance' | 'offline';
}

interface StationListProps {
  stations: Station[];
}

const StationList: FC<StationListProps> = ({ stations }) => {
  const handleBook = (stationId: string) => {
    // Handle booking logic
    console.log('Booking station:', stationId);
  };

  return (
    <Box
      className="page-container"
      sx={{
        py: { xs: 3, md: 5 },
        background: 'linear-gradient(135deg, rgba(38, 198, 218, 0.05), rgba(33, 150, 243, 0.05))',
      }}
    >
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 700,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: 'fadeIn 0.5s ease-in-out',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          Available Charging Stations
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Find and book charging stations near you
        </Typography>
      </Box>

      <Grid 
        container 
        spacing={3}
        sx={{
          position: 'relative',
        }}
      >
        {stations.map((station) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={station.id}
            sx={{
              animation: 'fadeInUp 0.5s ease-in-out',
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            <StationCard
              {...station}
              onBook={() => handleBook(station.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StationList; 