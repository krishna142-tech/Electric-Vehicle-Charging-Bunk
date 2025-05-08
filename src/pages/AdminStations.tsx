import { FC, useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Map as MapIcon
} from '@mui/icons-material';
import Map from '../components/Map';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Station as StationType } from '../types';

interface Station extends StationType {
  createdBy: string;
}

interface FormData {
  name: string;
  address: string;
  rate: string;
  openTime: string;
  closeTime: string;
  totalSlots: string;
  status: StationType['status'];
  latitude?: number;
  longitude?: number;
}

const initialFormData: FormData = {
  name: '',
  address: '',
  rate: '',
  openTime: '09:00',
  closeTime: '21:00',
  totalSlots: '',
  status: 'operational',
};

const AdminStations: FC = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStations();
  }, [user]);

  const fetchStations = async () => {
    try {
      if (!user) return;
      
      const stationsRef = collection(db, 'stations');
      const q = query(stationsRef, where('createdBy', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const stationData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Station));
      
      setStations(stationData);
    } catch (error) {
      console.error('Error fetching stations:', error);
      showSnackbar('Error fetching stations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (station?: Station) => {
    if (station) {
      setSelectedStation(station);
      setFormData({
        name: station.name,
        address: station.address,
        rate: `${station.rates.perHour} ${station.rates.currency}`,
        openTime: station.operatingHours.open,
        closeTime: station.operatingHours.close,
        totalSlots: station.totalSlots.toString(),
        status: station.status,
        latitude: station.latitude,
        longitude: station.longitude,
      });
      setSelectedLocation({ lat: station.latitude, lng: station.longitude });
    } else {
      setSelectedStation(null);
      setFormData(initialFormData);
      setSelectedLocation(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStation(null);
    setFormData(initialFormData);
    setSelectedLocation(null);
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      address: location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      latitude: location.lat,
      longitude: location.lng
    }));
    setMapDialogOpen(false);
  };

  const validateForm = () => {
    if (!formData.name || !formData.address || !formData.rate || !formData.openTime || !formData.closeTime || !formData.totalSlots) {
      showSnackbar('Please fill in all required fields', 'error');
      return false;
    }
    if (!selectedLocation) {
      showSnackbar('Please select a location on the map', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    try {
      const rateValue = parseFloat(formData.rate);
      if (isNaN(rateValue)) {
        showSnackbar('Please enter a valid rate', 'error');
        return;
      }

      const stationData = {
        name: formData.name,
        address: formData.address,
        location: {
          lat: selectedLocation!.lat,
          lng: selectedLocation!.lng
        },
        latitude: selectedLocation!.lat,
        longitude: selectedLocation!.lng,
        totalSlots: parseInt(formData.totalSlots),
        availableSlots: parseInt(formData.totalSlots),
        rates: {
          perHour: rateValue,
          currency: 'INR'
        },
        operatingHours: {
          open: formData.openTime,
          close: formData.closeTime
        },
        status: formData.status,
        lastUpdated: new Date(),
        createdBy: user.uid
      };

      if (selectedStation) {
        await updateDoc(doc(db, 'stations', selectedStation.id), stationData);
        showSnackbar('Station updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'stations'), stationData);
        showSnackbar('Station added successfully', 'success');
      }

      handleCloseDialog();
      fetchStations();
    } catch (error) {
      console.error('Error saving station:', error);
      showSnackbar('Error saving station', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'stations', id));
      showSnackbar('Station deleted successfully', 'success');
      fetchStations();
    } catch (error) {
      console.error('Error deleting station:', error);
      showSnackbar('Error deleting station', 'error');
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Please log in to access this page.</Alert>
      </Box>
    );
  }

  return (
    <Box className="page-container" sx={{ py: { xs: 3, md: 5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<MapIcon />}
          onClick={() => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        >
          View Map
        </Button>
        <Button
          variant="contained"
          color="info"
          startIcon={<MapIcon />}
          onClick={() => window.location.href = '/admin/stations-map'}
        >
          Stations Map
        </Button>
      </Box>
      <Box ref={mapRef} sx={{ height: { xs: 300, md: 400 }, mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: 2 }}>
        <Map stations={stations} />
      </Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Manage Stations
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4DD0E1, #64B5F6)',
              },
            }}
          >
            Add Station
          </Button>
          <Button
            variant="outlined"
            color="info"
            startIcon={<MapIcon />}
            onClick={() => window.location.href = '/admin/stations-map'}
            sx={{ borderRadius: '12px', fontWeight: 600 }}
          >
            Stations Map
          </Button>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(38, 198, 218, 0.1)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Slots</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stations.map((station) => (
              <TableRow key={station.id}>
                <TableCell>{station.name}</TableCell>
                <TableCell>{station.address}</TableCell>
                <TableCell>{`${station.rates.perHour} ${station.rates.currency}/hour`}</TableCell>
                <TableCell>{`${station.operatingHours.open} - ${station.operatingHours.close}`}</TableCell>
                <TableCell>{`${station.availableSlots}/${station.totalSlots}`}</TableCell>
                <TableCell>
                  <Chip
                    label={station.status}
                    color={
                      station.status === 'operational'
                        ? 'success'
                        : station.status === 'maintenance'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenDialog(station)}
                    sx={{ color: 'primary.main' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(station.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <DialogTitle>
          {selectedStation ? 'Edit Station' : 'Add New Station'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.address}
                  InputProps={{
                    readOnly: true,
                  }}
                  required
                />
                <Button
                  variant="contained"
                  startIcon={<LocationIcon />}
                  onClick={() => setMapDialogOpen(true)}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Select Location on Map
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rate (INR/hour)"
                  type="number"
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData({ ...formData, rate: e.target.value })
                  }
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1 }}>INR/hour</Typography>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Opening Time"
                  type="time"
                  value={formData.openTime}
                  onChange={(e) =>
                    setFormData({ ...formData, openTime: e.target.value })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Closing Time"
                  type="time"
                  value={formData.closeTime}
                  onChange={(e) =>
                    setFormData({ ...formData, closeTime: e.target.value })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Total Slots"
                  type="number"
                  value={formData.totalSlots}
                  onChange={(e) =>
                    setFormData({ ...formData, totalSlots: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as StationType['status'],
                    })
                  }
                  required
                >
                  <MenuItem value="operational">Operational</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4DD0E1, #64B5F6)',
                },
              }}
            >
              {selectedStation ? 'Save Changes' : 'Add Station'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Location</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, width: '100%', mt: 2 }}>
            <Map
              stations={stations}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminStations; 