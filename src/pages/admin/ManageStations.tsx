import { FC, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  useTheme,
  Container,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  useMediaQuery
} from '@mui/material';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import TableCell from '@mui/material/TableCell';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  BatteryChargingFull as BatteryIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { collection, query, doc, deleteDoc, addDoc, updateDoc, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import Map from '../../components/Map';
import LocationPicker from '../../components/LocationPicker';
import { Station } from '../../types';

interface StationFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  totalSlots: string;
  availableSlots: string;
  rates: {
    perHour: string;
    currency: string;
  };
  operatingHours: {
    open: string;
    close: string;
  };
  status: 'operational' | 'maintenance' | 'offline';
}

interface FormData {
  name: string;
  location: string;
  totalSlots: string;
  rate: string;
  hours: string;
  status: string;
}

const AddStationDialog: FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StationFormData) => void;
  initialData?: Station;
}> = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<FormData>(() => ({
    name: initialData?.name || '',
    location: initialData?.address || '',
    totalSlots: initialData?.totalSlots?.toString() || '',
    rate: initialData?.rates?.perHour?.toString() || '',
    hours: `${initialData?.operatingHours?.open || '09:00'} - ${initialData?.operatingHours?.close || '21:00'}`,
    status: initialData?.status || 'operational'
  }));

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialData ? {
      lat: initialData.latitude || 0,
      lng: initialData.longitude || 0
    } : null
  );
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form data when initialData changes
  useEffect(() => {
    setFormData({
      name: initialData?.name || '',
      location: initialData?.address || '',
      totalSlots: initialData?.totalSlots?.toString() || '',
      rate: initialData?.rates?.perHour?.toString() || '',
      hours: `${initialData?.operatingHours?.open || '09:00'} - ${initialData?.operatingHours?.close || '21:00'}`,
      status: initialData?.status || 'operational'
    });
    setSelectedLocation(initialData ? {
      lat: initialData.latitude || 0,
      lng: initialData.longitude || 0
    } : null);
  }, [initialData]);

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation({ lat: location.lat, lng: location.lng });
    setFormData(prev => ({
      ...prev,
      location: location.address
    }));
    setLocationPickerOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      setError('Please select a location on the map');
      return;
    }
    
    // Parse hours
    const [openTime = '09:00', closeTime = '21:00'] = formData.hours.split('-').map(t => t.trim());
    
    const stationFormData: StationFormData = {
      name: formData.name,
      address: formData.location,
      latitude: selectedLocation.lat.toString(),
      longitude: selectedLocation.lng.toString(),
      totalSlots: formData.totalSlots || '0',
      availableSlots: formData.totalSlots || '0',
      rates: {
        perHour: formData.rate || '0',
        currency: 'INR'
      },
      operatingHours: {
        open: openTime,
        close: closeTime
      },
      status: formData.status as 'operational' | 'maintenance' | 'offline'
    };

    onSubmit(stationFormData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Typography variant="h6">
            {initialData ? 'Edit Station' : 'Add New Station'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Name *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Location *"
              name="location"
              value={formData.location}
              required
              InputProps={{
                readOnly: true,
              }}
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<LocationIcon />}
              onClick={() => setLocationPickerOpen(true)}
              fullWidth
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                }
              }}
            >
              Select Location on Map
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Rate (₹/hour) *"
              name="rate"
              value={formData.rate}
              onChange={handleInputChange}
              required
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
              }}
            />
            <TextField
              label="Hours *"
              name="hours"
              value={formData.hours}
              onChange={handleInputChange}
              required
              placeholder="e.g., 09:00 - 21:00"
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Total Slots *"
              name="totalSlots"
              type="number"
              value={formData.totalSlots}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Status *</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status *"
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="operational">Operational</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                }
              }}
            >
              {initialData ? 'Save Changes' : 'Add Station'}
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <LocationPicker
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onSelect={handleLocationSelect}
        initialLocation={selectedLocation || undefined}
      />
    </Dialog>
  );
};

const ManageStations: FC = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (data: StationFormData) => {
    try {
      if (!user) return;

      const stationData = {
        name: data.name,
        address: data.address,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        totalSlots: parseInt(data.totalSlots),
        availableSlots: parseInt(data.availableSlots),
        rates: {
          perHour: parseFloat(data.rates.perHour),
          currency: data.rates.currency
        },
        operatingHours: {
          open: data.operatingHours.open,
          close: data.operatingHours.close
        },
        status: data.status,
        lastUpdated: Timestamp.now(),
        createdBy: user.uid
      };

      if (editingStation) {
        await updateDoc(doc(db, 'stations', editingStation.id), stationData);
        showSnackbar('Station updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'stations'), {
          ...stationData,
          createdAt: Timestamp.now()
        });
        showSnackbar('Station added successfully', 'success');
      }

      setDialogOpen(false);
      setEditingStation(null);
      fetchStations();
    } catch (error) {
      console.error('Error saving station:', error);
      showSnackbar('Failed to save station', 'error');
    }
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!stationToDelete) return;

    try {
      await deleteDoc(doc(db, 'stations', stationToDelete.id));
      showSnackbar('Station deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setStationToDelete(null);
      fetchStations();
    } catch (error) {
      console.error('Error deleting station:', error);
      showSnackbar('Failed to delete station', 'error');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStation(null);
  };

  const fetchStations = useCallback(async () => {
    try {
      if (!user) return;

      setLoading(true);
      const stationsRef = collection(db, 'stations');
      const q = query(stationsRef, where('createdBy', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const stationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Station[];
      setStations(stationsData);
    } catch (error) {
      console.error('Error fetching stations:', error);
      showSnackbar('Failed to load stations', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  if (!user || user.role !== 'admin') {
    return (
      <Container>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Please log in as an admin to access this page.</Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="80vh"
        >
          <CircularProgress size={48} color="primary" />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Loading stations...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 4,
            background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Manage Stations
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ mb: 3 }}
        >
          Add New Station
        </Button>

        <Box>
          {stations.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No stations found
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {stations.map((station) => (
                <Grid item xs={12} sm={6} md={4} key={station.id}>
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 12, right: 16, zIndex: 2 }}>
                      <Chip
                        label={station.status.charAt(0).toUpperCase() + station.status.slice(1)}
                        color={station.status === 'operational' ? 'success' : station.status === 'maintenance' ? 'warning' : 'error'}
                        size="small"
                        sx={{ fontWeight: 'bold', px: 1.5, boxShadow: 1 }}
                      />
                    </Box>
                    <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 2, minHeight: 220 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={700}>{station.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 0.5, display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                          {station.address}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <BatteryIcon sx={{ fontSize: 18, mr: 1 }} />
                          <Typography variant="body2">{station.availableSlots || 0}/{station.totalSlots || 0}</Typography>
                          <AttachMoneyIcon sx={{ fontSize: 18, ml: 2, mr: 1 }} />
                          <Typography variant="body2">{station.rates?.currency || 'INR'} {station.rates?.perHour || 0}/h</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 18, mr: 1 }} />
                          <Typography variant="body2">{station.operatingHours?.open || '09:00'} - {station.operatingHours?.close || '21:00'}</Typography>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                        <Tooltip title="View on Map">
                          <IconButton color="info" size="small" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`, '_blank')}>
                            <LocationIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton color="primary" size="small" onClick={() => handleEdit(station)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" size="small" onClick={() => { setStationToDelete(station); setDeleteDialogOpen(true); }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        <AddStationDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          initialData={editingStation || undefined}
        />

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Station</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this station? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ManageStations; 