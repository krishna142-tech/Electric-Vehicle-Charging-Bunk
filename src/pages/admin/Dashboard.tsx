import { FC, useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { updateStationSlots } from '../../services/booking';

interface Station {
  id: string;
  name: string;
  location: string;
  totalSlots: number;
  availableSlots: number;
  createdBy: string;
}

interface Booking {
  id: string;
  stationId: string;
  status: string;
  startTime: string;
  endTime: string;
}

const Dashboard: FC = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStation, setEditingStation] = useState<string | null>(null);
  const [newSlots, setNewSlots] = useState<{ [key: string]: number }>({});
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch stations
        const stationsRef = collection(db, 'stations');
        const stationsQuery = query(stationsRef, where('createdBy', '==', user.uid));
        const stationsSnapshot = await getDocs(stationsQuery);
        const stationsData = stationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Station[];
        setStations(stationsData);

        // Fetch active bookings
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(
          bookingsRef,
          where('status', 'in', ['confirmed', 'verified'])
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];
        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleEditSlots = (stationId: string, currentSlots: number) => {
    setEditingStation(stationId);
    setNewSlots(prev => ({ ...prev, [stationId]: currentSlots }));
  };

  const handleUpdateSlots = async (stationId: string) => {
    if (!newSlots[stationId] && newSlots[stationId] !== 0) return;

    setUpdateLoading(stationId);
    try {
      await updateStationSlots(stationId, newSlots[stationId]);
      setStations(prev => prev.map(station => 
        station.id === stationId 
          ? { ...station, availableSlots: newSlots[stationId] }
          : station
      ));
      setEditingStation(null);
    } catch (err) {
      setError('Failed to update slots');
      console.error('Error updating slots:', err);
    } finally {
      setUpdateLoading(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Your Stations
          </Typography>
          {stations.map(station => (
            <Card key={station.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{station.name}</Typography>
                <Typography color="textSecondary" gutterBottom>
                  {station.location}
                </Typography>
                {editingStation === station.id ? (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      type="number"
                      label="Available Slots"
                      value={newSlots[station.id]}
                      onChange={(e) => setNewSlots(prev => ({
                        ...prev,
                        [station.id]: parseInt(e.target.value) || 0
                      }))}
                      inputProps={{ min: 0, max: station.totalSlots }}
                      sx={{ mr: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleUpdateSlots(station.id)}
                      disabled={updateLoading === station.id}
                    >
                      {updateLoading === station.id ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setEditingStation(null)}
                      sx={{ ml: 1 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Typography>
                      Available Slots: {station.availableSlots} / {station.totalSlots}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleEditSlots(station.id, station.availableSlots)}
                      sx={{ mt: 1 }}
                    >
                      Update Slots
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Active Bookings
          </Typography>
          {bookings.map(booking => (
            <Card key={booking.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">
                  Booking #{booking.id.slice(-6)}
                </Typography>
                <Typography color="textSecondary">
                  Status: {booking.status}
                </Typography>
                <Typography>
                  Start: {new Date(booking.startTime).toLocaleString()}
                </Typography>
                <Typography>
                  End: {new Date(booking.endTime).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 