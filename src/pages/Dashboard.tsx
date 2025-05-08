import { FC, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  Chip
} from '@mui/material';
import {
  EvStation as StationIcon,
  BookOnline as BookingIcon,
  BatteryChargingFull as ChargingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Station } from '../types';
import Map from '../components/Map';
import BookingModal from '../components/BookingModal';
import { useNavigate } from 'react-router-dom';

const getStatusColor = (status: Station['status']) => {
  switch (status) {
    case 'operational':
      return 'success';
    case 'maintenance':
      return 'warning';
    case 'offline':
      return 'error';
    default:
      return 'default';
  }
};

const Dashboard: FC = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const stationsRef = collection(db, 'stations');
    const q = query(stationsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stationData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Add default values for rates and operating hours if missing
        return {
          id: doc.id,
          ...data,
          rates: {
            perHour: data.rates?.perHour || 0,
            currency: data.rates?.currency || 'INR'
          },
          operatingHours: {
            open: data.operatingHours?.open || '09:00',
            close: data.operatingHours?.close || '21:00'
          },
          availableSlots: data.availableSlots || 0,
          totalSlots: data.totalSlots || 0,
          status: data.status || 'offline'
        } as Station;
      });
      setStations(stationData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching stations:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setIsBookingModalOpen(true);
  };

  const handleBookingModalClose = () => {
    setIsBookingModalOpen(false);
    setSelectedStation(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              Charging Stations Map
            </Typography>
            <Box sx={{ height: '70vh', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
              <Map stations={stations} onStationSelect={handleStationSelect} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Available Stations
            </Typography>
            <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              {stations.map((station) => (
                <Card key={station.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{station.name}</Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {station.address}
                    </Typography>
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <Chip
                        label={station.status}
                        color={getStatusColor(station.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${station.availableSlots || 0}/${station.totalSlots || 0} slots`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      Rate: {station.rates?.currency || 'INR'} {station.rates?.perHour || 0}/hour
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Hours: {station.operatingHours?.open || '09:00'} - {station.operatingHours?.close || '21:00'}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={station.status !== 'operational'}
                      onClick={() => handleStationSelect(station)}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {selectedStation && (
        <BookingModal
          open={isBookingModalOpen}
          onClose={handleBookingModalClose}
          station={selectedStation}
        />
      )}
    </Box>
  );
};

export default Dashboard; 