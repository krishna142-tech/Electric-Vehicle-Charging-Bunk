import { FC, useEffect, useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import { LocationOn as LocationIcon, Search as SearchIcon } from '@mui/icons-material';
import { DEFAULT_CENTER, loadMapsWithRetry } from '../config/maps';

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPicker: FC<LocationPickerProps> = ({
  open,
  onClose,
  onSelect,
  initialLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);
  const searchBoxInstanceRef = useRef<google.maps.places.SearchBox | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const updateSelectedLocation = useCallback(async (
    lat: number,
    lng: number,
    markerInstance: google.maps.Marker
  ) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      
      if (result.results?.[0]) {
        const address = result.results[0].formatted_address;
        markerInstance.setPosition({ lat, lng });
        setSelectedLocation({ lat, lng, address });
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      markerInstance.setPosition({ lat, lng });
      setSelectedLocation({
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });
    }
  }, []);

  const cleanup = useCallback(() => {
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setMap(null);
      markerInstanceRef.current = null;
    }
    if (searchBoxInstanceRef.current) {
      searchBoxInstanceRef.current.unbindAll();
      searchBoxInstanceRef.current = null;
    }
    if (mapInstanceRef.current) {
      google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      mapInstanceRef.current = null;
    }
  }, []);

  const initializeMap = useCallback(async () => {
    if (!mapRef.current) {
      console.log('Map container not found');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Clean up existing instances
      cleanup();

      // Wait for Google Maps to be fully loaded
      await loadMapsWithRetry();
      
      // Double check if the map container still exists after loading
      if (!mapRef.current) {
        console.log('Map container no longer exists after loading');
        return;
      }

      // Create map instance
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: initialLocation || DEFAULT_CENTER,
        zoom: initialLocation ? 15 : 5,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        disableDefaultUI: false, // Enable default UI for better user experience
        zoomControl: true, // Keep zoom control
      });

      // Create marker
      const markerInstance = new google.maps.Marker({
        map: mapInstance,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: initialLocation || DEFAULT_CENTER
      });

      // Initialize search box
      const searchInput = document.getElementById('location-search') as HTMLInputElement;
      if (searchInput) {
        const searchBoxInstance = new google.maps.places.SearchBox(searchInput);

        // Set up search box event listener
        searchBoxInstance.addListener('places_changed', () => {
          const places = searchBoxInstance.getPlaces();
          if (places && places.length > 0) {
            const place = places[0];
            const location = place.geometry?.location;
            if (location) {
              const lat = location.lat();
              const lng = location.lng();
              mapInstance.setCenter({ lat, lng });
              mapInstance.setZoom(15);
              updateSelectedLocation(lat, lng, markerInstance);
            }
          }
        });

        searchBoxInstanceRef.current = searchBoxInstance;
      }

      // Set up map click listener
      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();
        if (lat && lng) {
          updateSelectedLocation(lat, lng, markerInstance);
        }
      });

      // Set up marker drag listener
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          updateSelectedLocation(position.lat(), position.lng(), markerInstance);
        }
      });

      mapInstanceRef.current = mapInstance;
      markerInstanceRef.current = markerInstance;

      // If there's an initial location, update the selected location
      if (initialLocation) {
        updateSelectedLocation(initialLocation.lat, initialLocation.lng, markerInstance);
      }

      setLoading(false);
      setRetryCount(0);
    } catch (error) {
      console.error('Error in map initialization:', error);
      setError('Failed to load the map. Please check your internet connection and try again.');
      setLoading(false);

      // Retry initialization if under max retries
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          initializeMap();
        }, delay);
      }
    }
  }, [initialLocation, retryCount, updateSelectedLocation, cleanup]);

  // Initialize map when dialog opens
  useEffect(() => {
    let mounted = true;

    if (open) {
      // Add a small delay to ensure the dialog is fully rendered
      const timeoutId = setTimeout(() => {
        if (mounted) {
          initializeMap();
        }
      }, 100);

      return () => {
        mounted = false;
        clearTimeout(timeoutId);
        cleanup();
      };
    }

    return () => {
      mounted = false;
      cleanup();
    };
  }, [open, initializeMap, cleanup]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <LocationIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Select Location</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative', height: 'calc(100% - 64px)', width: '100%' }}>
          <TextField
            id="location-search"
            placeholder="Search for a location"
            variant="outlined"
            fullWidth
            sx={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 40px)',
              zIndex: 1,
              backgroundColor: 'white',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                boxShadow: 1
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <div
            ref={mapRef}
            style={{ 
              height: '100%', 
              width: '100%',
              backgroundColor: '#f5f5f5' // Add background color to make it visible while loading
            }}
          />

          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <CircularProgress size={40} />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading map...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '80%'
              }}
            >
              {error}
              {retryCount < MAX_RETRIES && (
                <Box mt={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => initializeMap()}
                  >
                    Retry Loading Map
                  </Button>
                </Box>
              )}
            </Alert>
          )}
        </Box>

        {selectedLocation && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Selected Location"
              value={selectedLocation.address}
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => selectedLocation && onSelect(selectedLocation)}
          variant="contained"
          disabled={!selectedLocation}
        >
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationPicker; 