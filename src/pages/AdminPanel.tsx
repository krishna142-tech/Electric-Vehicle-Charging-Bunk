import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ChargingStation } from '../types';

const AdminPanel: React.FC = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '',
    address: '',
    totalSlots: 0,
    rates: {
      perHour: 0,
      currency: 'USD'
    }
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const stationsCollection = collection(db, 'stations');
      const stationSnapshot = await getDocs(stationsCollection);
      const stationList = stationSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChargingStation[];
      
      setStations(stationList);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch charging stations');
      setLoading(false);
      console.error('Error fetching stations:', err);
    }
  };

  const handleAddStation = async () => {
    try {
      const stationData = {
        ...newStation,
        availableSlots: newStation.totalSlots,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'stations'), stationData);
      setOpenDialog(false);
      fetchStations();
    } catch (err) {
      console.error('Error adding station:', err);
    }
  };

  const handleUpdateStation = async (stationId: string, updates: Partial<ChargingStation>) => {
    try {
      const stationRef = doc(db, 'stations', stationId);
      await updateDoc(stationRef, {
        ...updates,
        updatedAt: new Date()
      });
      fetchStations();
    } catch (err) {
      console.error('Error updating station:', err);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading stations...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Manage Charging Stations</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(true)}
            >
              Add New Station
            </Button>
          </Box>
        </Grid>

        {stations.map((station) => (
          <Grid item xs={12} key={station.id}>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">{station.name}</Typography>
                  <Typography color="textSecondary">{station.address}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    Available Slots: {station.availableSlots}/{station.totalSlots}
                  </Typography>
                  <Typography>
                    Rate: ${station.rates.perHour}/hour
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add Station Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Charging Station</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Station Name"
            fullWidth
            value={newStation.name}
            onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            value={newStation.address}
            onChange={(e) => setNewStation({ ...newStation, address: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Total Slots"
            type="number"
            fullWidth
            value={newStation.totalSlots}
            onChange={(e) => setNewStation({ ...newStation, totalSlots: parseInt(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Rate per Hour"
            type="number"
            fullWidth
            value={newStation.rates.perHour}
            onChange={(e) => setNewStation({
              ...newStation,
              rates: { ...newStation.rates, perHour: parseFloat(e.target.value) }
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddStation} color="primary">
            Add Station
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 