import { FC, useState, useEffect } from 'react';
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

interface StationData {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  latitude: number;
  longitude: number;
  totalSlots: number;
  availableSlots: number;
  rates: {
    perHour: number;
    currency: string;
  };
  operatingHours: {
    open: string;
    close: string;
  };
  status: 'operational' | 'maintenance' | 'offline';
  lastUpdated: Timestamp;
  createdBy?: string;
  createdAt?: Timestamp;
}

type FormField = keyof StationFormData | 'rates.perHour' | 'operatingHours.open' | 'operatingHours.close';

const initialFormState: StationFormData = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  totalSlots: '',
  availableSlots: '',
  rates: {
    perHour: '',
    currency: 'INR'
  },
  operatingHours: {
    open: '06:00',
    close: '22:00'
  },
  status: 'operational'
};

interface FormData {
  name: string;
  location: string;
  totalSlots: string;
  rate: string;
  hours: string;
  status: string;
}

type SetFormData = React.Dispatch<React.SetStateAction<FormData>>;

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
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    totalSlots: '',
    rate: '',
    hours: '09:00 - 21:00',
    status: 'Operational'
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchStations = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      const stationsRef = collection(db, 'stations');
      const adminStationsQuery = query(stationsRef, where('createdBy', '==', user.uid));
      const querySnapshot = await getDocs(adminStationsQuery);
      const stationData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Add default values for rates if missing
        return {
          id: doc.id,
          ...data,
          rates: {
            perHour: data.rates?.perHour || 0,
            currency: data.rates?.currency || 'INR'
          }
        } as Station;
      });
      setStations(stationData);
    } catch (err) {
      console.error('Error fetching stations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stations');
      showSnackbar('Failed to load stations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [user, fetchStations]);

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      location: location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
    }));
    setMapDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.location || !formData.totalSlots || !formData.rate) {
      showSnackbar('Please fill in all required fields', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (data: StationFormData) => {
    try {
      if (!user) return;

      const updateData = {
        name: data.name,
        address: data.address,
        'location.lat': parseFloat(data.latitude),
        'location.lng': parseFloat(data.longitude),
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        totalSlots: parseInt(data.totalSlots),
        availableSlots: parseInt(data.availableSlots),
        'rates.perHour': parseFloat(data.rates.perHour),
        'rates.currency': data.rates.currency || 'INR',
        'operatingHours.open': data.operatingHours?.open || '09:00',
        'operatingHours.close': data.operatingHours?.close || '21:00',
        status: data.status || 'operational',
        lastUpdated: Timestamp.now()
      };

      if (editingStation) {
        if (editingStation.createdBy !== user.uid) {
          showSnackbar('You can only edit stations created by you', 'error');
          return;
        }
        await updateDoc(doc(db, 'stations', editingStation.id), updateData);
        showSnackbar('Station updated successfully', 'success');
      } else {
        const newStationData = {
          ...updateData,
          createdBy: user.uid,
          createdAt: Timestamp.now()
        };
        await addDoc(collection(db, 'stations'), newStationData);
        showSnackbar('Station added successfully', 'success');
      }

      handleCloseDialog();
      fetchStations();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to save station data');
    }
  };

  const handleEdit = (station: Station) => {
    if (!user || station.createdBy !== user.uid) {
      showSnackbar('You can only edit stations created by you', 'error');
      return;
    }
    setEditingStation(station);
    setFormData({
      name: station.name || '',
      location: station.address || '',
      totalSlots: (station.totalSlots || 0).toString(),
      rate: (station.rates?.perHour || 0).toString(),
      hours: `${station.operatingHours?.open || '09:00'} - ${station.operatingHours?.close || '21:00'}`,
      status: station.status || 'operational'
    });
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    try {
      if (!stationToDelete || !user || stationToDelete.createdBy !== user.uid) {
        showSnackbar('You can only delete stations created by you', 'error');
        return;
      }
      await deleteDoc(doc(db, 'stations', stationToDelete.id));
      showSnackbar('Station deleted successfully', 'success');
      setDeleteConfirmOpen(false);
      setStationToDelete(null);
      fetchStations();
    } catch (err) {
      console.error('Error deleting station:', err);
      showSnackbar('Failed to delete station', 'error');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStation(null);
    setFormData({
      name: '',
      location: '',
      totalSlots: '',
      rate: '',
      hours: '09:00 - 21:00',
      status: 'Operational'
    });
    setSelectedLocation(null);
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="80vh"
          textAlign="center"
        >
          <BatteryIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography color="text.secondary">
            Admin privileges are required to access this page.
          </Typography>
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
    <Container maxWidth="lg" sx={{ py: 3 }}>
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
          Manage Charging Stations
        </Typography>
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'flex-end',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4DD0E1, #64B5F6)',
              },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Add New Station
          </Button>
          <Button
            variant="contained"
            startIcon={<LocationIcon />}
            onClick={() => window.location.href = '/admin/stations-map'}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4DD0E1, #64B5F6)',
              },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Stations Map
          </Button>
        </Box>
      </Box>
      {isMobile ? (
        <Box>
          {stations.map((station) => (
            <Card key={station.id} sx={{ mb: 2, borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6" fontWeight={700}>{station.name}</Typography>
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
                    sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  <LocationIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  {station.address}
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <BatteryIcon sx={{ fontSize: 18, mr: 1 }} />
                  <Typography variant="body2">{station.availableSlots || 0}/{station.totalSlots || 0} slots</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <AttachMoneyIcon sx={{ fontSize: 18, mr: 1 }} />
                  <Typography variant="body2">{station.rates?.currency || 'INR'} {station.rates?.perHour || 0}/h</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <AccessTimeIcon sx={{ fontSize: 18, mr: 1 }} />
                  <Typography variant="body2">{station.operatingHours?.open || '09:00'} - {station.operatingHours?.close || '21:00'}</Typography>
                </Box>
                <CardActions sx={{ justifyContent: 'flex-end', p: 0, pt: 2 }}>
                  <Tooltip title="View on Map">
                    <IconButton color="info" size="small" onClick={() => { setSelectedLocation({ lat: station.latitude, lng: station.longitude }); setMapDialogOpen(true); }}>
                      <LocationIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Station">
                    <IconButton color="primary" size="small" onClick={() => handleEdit(station)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Station">
                    <IconButton color="error" size="small" onClick={() => { setStationToDelete(station); setDeleteConfirmOpen(true); }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
          <Grid container spacing={3}>
            {stations.map((station) => (
              <Grid item xs={12} sm={6} md={4} key={station.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: 16,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: '50%',
                        p: 1,
                        boxShadow: theme.shadows[4],
                      }}
                    >
                      <BatteryIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'text.primary'
                        }}
                      >
                        {station.name}
                      </Typography>
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
                        sx={{ 
                          fontWeight: 'medium',
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                    <Box 
                      sx={{ 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary'
                      }}
                    >
                      <LocationIcon sx={{ fontSize: 18, mr: 1 }} />
                      <Typography variant="body2" noWrap>
                        {station.address}
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary'
                          }}
                        >
                          <BatteryIcon sx={{ fontSize: 18, mr: 1 }} />
                          <Typography variant="body2">
                            {station.availableSlots || 0}/{station.totalSlots || 0}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary'
                          }}
                        >
                          <AttachMoneyIcon sx={{ fontSize: 18, mr: 1 }} />
                          <Typography variant="body2">
                            {station.rates?.currency || 'INR'} {station.rates?.perHour || 0}/h
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary'
                          }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 18, mr: 1 }} />
                          <Typography variant="body2">
                            {station.operatingHours?.open || '09:00'} - {station.operatingHours?.close || '21:00'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions 
                    sx={{ 
                      borderTop: `1px solid ${theme.palette.divider}`,
                      justifyContent: 'flex-end',
                      p: 2
                    }}
                  >
                    <Tooltip title="View on Map">
                      <IconButton 
                        color="info"
                        size="small"
                        onClick={() => {
                          setSelectedLocation({ lat: station.latitude, lng: station.longitude });
                          setMapDialogOpen(true);
                        }}
                      >
                        <LocationIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Station">
                      <IconButton 
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(station)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Station">
                      <IconButton 
                        color="error"
                        size="small"
                        onClick={() => {
                          setStationToDelete(station);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <AddStationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        initialData={editingStation || undefined}
      />

      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[24],
          }
        }}
      >
        <DialogTitle sx={{ p: 3 }}>
          <Box display="flex" alignItems="center">
            <DeleteIcon sx={{ mr: 2, color: 'error.main' }} />
            <Typography variant="h5">Confirm Delete</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography>
            Are you sure you want to delete the station "{stationToDelete?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={mapDialogOpen} 
        onClose={() => setMapDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[24],
          }
        }}
      >
        <DialogTitle sx={{ p: 3 }}>
          <Box display="flex" alignItems="center">
            <LocationIcon sx={{ mr: 2, color: 'info.main' }} />
            <Typography variant="h5">Select Location</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ height: '500px', width: '100%' }}>
            <Map
              isEditing={true}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setMapDialogOpen(false)}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageStations; 