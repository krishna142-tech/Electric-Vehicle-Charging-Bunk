import { FC, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography, Button, Tooltip, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { Station } from '../types';
import { mapsLoader, DEFAULT_CENTER } from '../config/maps';
import BookingModal from './BookingModal';

interface MapProps {
  stations?: Station[];
  onStationSelect?: (station: Station) => void;
  isEditing?: boolean;
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void;
}

const Map: FC<MapProps> = ({
  stations = [],
  onStationSelect,
  isEditing = false,
  selectedLocation,
  onLocationSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<google.maps.Marker | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapsBlockedDialogOpen, setMapsBlockedDialogOpen] = useState(false);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [showBookingButton, setShowBookingButton] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [loadRetries, setLoadRetries] = useState(0);
  const MAX_RETRIES = 3;
  const markersRef = useRef<google.maps.Marker[]>([]);

  const handleMapsError = (error: any) => {
    console.error('Google Maps loading error:', error);
    if (error.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
        error.message?.includes('blocked by client') ||
        error.message?.includes('google is not defined')) {
      setLocationError('Google Maps is being blocked. Please disable your ad blocker or privacy extensions for this site.');
      setMapsBlockedDialogOpen(true);
    } else {
      setLocationError('Error loading map. Please check your internet connection and try again.');
    }
  };

  const retryLoadMaps = () => {
    if (loadRetries < MAX_RETRIES) {
      setLoadRetries(prev => prev + 1);
      setLocationError(null);
      setMapsBlockedDialogOpen(false);
      // Force reload the page to retry loading Google Maps
      window.location.reload();
    } else {
      setLocationError('Unable to load maps after multiple attempts. Please try again later.');
    }
  };

  const handleMarkerClick = (station: Station) => {
    if (onStationSelect) {
      onStationSelect(station);
    }
  };

  useEffect(() => {
    let mapInstance: google.maps.Map;
    let currentMarkers: google.maps.Marker[] = [];

    mapsLoader
      .load()
      .then(() => {
        if (!mapRef.current) return;

        try {
          mapInstance = new google.maps.Map(mapRef.current as HTMLElement, {
            center: DEFAULT_CENTER,
            zoom: 5,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          });
        } catch (error) {
          handleMapsError(error);
          return;
        }

        setMap(mapInstance);
        setInfoWindow(new google.maps.InfoWindow());
        setDirectionsService(new google.maps.DirectionsService());
        setDirectionsRenderer(new google.maps.DirectionsRenderer({ map: mapInstance }));
        geocoder.current = new google.maps.Geocoder();

        // Get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setUserLocation(pos);
              setLocationError(null);
              mapInstance.setCenter(pos);
              mapInstance.setZoom(12);

              // Add user location marker
              new google.maps.Marker({
                position: pos,
                map: mapInstance,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                },
                title: 'Your Location',
              });
            },
            (error) => {
              console.error('Geolocation error:', error);
              let errorMessage = 'Unable to get your location. ';
              
              // Handle specific error codes
              switch (error.code) {
                case 1: // PERMISSION_DENIED
                  if (window.location.protocol !== 'https:') {
                    errorMessage = 'Geolocation requires a secure connection (HTTPS). Please access this site using HTTPS.';
                  } else {
                    errorMessage = 'Location permission denied. Please enable location services in your browser settings.';
                  }
                  break;
                case 2: // POSITION_UNAVAILABLE
                  errorMessage = 'Location information is unavailable. Please try again.';
                  break;
                case 3: // TIMEOUT
                  errorMessage = 'Location request timed out. Please try again.';
                  break;
              }
              
              setLocationError(errorMessage);
              // Use default location as fallback
              setUserLocation(DEFAULT_CENTER);
              mapInstance.setCenter(DEFAULT_CENTER);
              mapInstance.setZoom(5);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        } else {
          setLocationError('Geolocation is not supported by your browser');
          setUserLocation(DEFAULT_CENTER);
          mapInstance.setCenter(DEFAULT_CENTER);
          mapInstance.setZoom(5);
        }

        // If there's a selected location, show it on the map
        if (selectedLocation?.lat && selectedLocation?.lng && mapInstance) {
          const marker = new google.maps.Marker({
            position: { 
              lat: selectedLocation.lat, 
              lng: selectedLocation.lng 
            },
            map: mapInstance,
            animation: google.maps.Animation.DROP
          });
          currentMarkers.push(marker);
          setMarkers(currentMarkers);
          mapInstance.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
          mapInstance.setZoom(15);
        }

        if (isEditing && mapInstance) {
          const clickListener = mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
            const lat = e.latLng?.lat();
            const lng = e.latLng?.lng();
            if (!lat || !lng || !onLocationSelect) return;

            // Clear existing markers
            currentMarkers.forEach(marker => marker.setMap(null));
            currentMarkers = [];

            // Create new marker
            const marker = new google.maps.Marker({
              position: { lat, lng },
              map: mapInstance,
              animation: google.maps.Animation.DROP
            });

            currentMarkers.push(marker);
            setMarkers(currentMarkers);

            // Get address for the selected location
            if (geocoder.current) {
              geocoder.current.geocode({
                location: { lat, lng }
              }).then((response) => {
                if (response.results?.[0]) {
                  onLocationSelect({
                    lat,
                    lng,
                    address: response.results[0].formatted_address,
                  });
                } else {
                  onLocationSelect({ lat, lng });
                }
              }).catch((error) => {
                console.error('Geocoding error:', error);
                onLocationSelect({ lat, lng });
              });
            } else {
              onLocationSelect({ lat, lng });
            }
          });

          return () => {
            google.maps.event.removeListener(clickListener);
          };
        }
      })
      .catch((error) => {
        handleMapsError(error);
      });

    return () => {
      if (currentMarkers.length > 0) {
        currentMarkers.forEach((marker) => marker.setMap(null));
      }
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, [isEditing, selectedLocation, loadRetries, directionsRenderer, onLocationSelect]);

  useEffect(() => {
    if (!map || !stations.length || isEditing) return;

    const updateMarkers = () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      const newMarkers = stations.map(station => {
        const marker = new google.maps.Marker({
          position: { lat: station.latitude, lng: station.longitude },
          map,
          title: station.name,
          icon: {
            url: '/ev-station-marker.svg',
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          }
        });

        marker.addListener('click', () => handleMarkerClick(station));
        return marker;
      });

      markersRef.current = newMarkers;
      setMarkers(newMarkers);
    };

    updateMarkers();
  }, [map, stations, isEditing, handleMarkerClick, markers]);

  const findNearestStation = (
    location: { lat: number; lng: number },
    stations: Station[]
  ): Station | null => {
    if (!location || stations.length === 0) return null;

    let nearest: Station | null = null;
    let minDistance = Infinity;

    stations.forEach(station => {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(location.lat, location.lng),
        new google.maps.LatLng(station.latitude, station.longitude)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = station;
      }
    });

    return nearest;
  };

  const getDirectionsToStation = (destination: { lat: number; lng: number }) => {
    if (!directionsService || !directionsRenderer || !userLocation) return;

    directionsService.route(
      {
        origin: userLocation,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          if (infoWindow) {
            infoWindow.close();
          }
          // Show estimated time and booking button
          const duration = result.routes[0].legs[0].duration?.text || '';
          setEstimatedTime(duration);
          setShowBookingButton(true);
          
          // Update the info window with new content
          if (selectedStation) {
            const content = `
              <div style="padding: 12px; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 8px; color: #1976D2; font-size: 16px;">${selectedStation.name}</h3>
                <p style="margin: 0 0 8px; color: #666; font-size: 14px;">${selectedStation.address}</p>
                <div style="background: #f5f5f5; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
                  <p style="margin: 0; font-size: 14px;">
                    <strong>Estimated Time:</strong> ${duration}<br>
                    <strong>Available:</strong> ${selectedStation.availableSlots}/${selectedStation.totalSlots} slots<br>
                    <strong>Rate:</strong> ${selectedStation.rates.currency} ${selectedStation.rates.perHour}/hour<br>
                    <strong>Hours:</strong> ${selectedStation.operatingHours.open} - ${selectedStation.operatingHours.close}
                  </p>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button onclick="window.handleBookNow()" 
                          style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; flex: 1; font-weight: 500; display: flex; align-items: center; justify-content: center;">
                    Book Now
                  </button>
                  <button onclick="window.resetDirections()" 
                          style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; flex: 1; font-weight: 500;">
                    Clear Route
                  </button>
                </div>
              </div>
            `;
            const newInfoWindow = new google.maps.InfoWindow({
              content,
              position: result.routes[0].legs[0].end_location
            });
            newInfoWindow.open(map);
            setInfoWindow(newInfoWindow);
          }
        }
      }
    );
  };

  const resetDirections = () => {
    if (directionsRenderer) {
      const emptyResult: google.maps.DirectionsResult = {
        routes: [],
        request: {
          origin: '',
          destination: '',
          travelMode: google.maps.TravelMode.DRIVING
        }
      };
      directionsRenderer.setDirections(emptyResult);
    }
    setShowBookingButton(false);
    setEstimatedTime('');
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          setLocationError(null);
          if (map) {
            map.setCenter(pos);
            map.setZoom(14);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to get your location. ';
          
          // Handle specific error codes
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              if (window.location.protocol !== 'https:') {
                errorMessage = 'Geolocation requires a secure connection (HTTPS). Please access this site using HTTPS.';
              } else {
                errorMessage = 'Location permission denied. Please enable location services in your browser settings.';
              }
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = 'Location information is unavailable. Please try again.';
              break;
            case 3: // TIMEOUT
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          
          setLocationError(errorMessage);
          // Use default location as fallback
          setUserLocation(DEFAULT_CENTER);
          if (map) {
            map.setCenter(DEFAULT_CENTER);
            map.setZoom(5);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
      setUserLocation(DEFAULT_CENTER);
      if (map) {
        map.setCenter(DEFAULT_CENTER);
        map.setZoom(5);
      }
    }
  };

  // Add this function to handle booking dialog
  const handleBookNow = () => {
    if (selectedStation) {
      setIsBookingDialogOpen(true);
    }
  };

  // Update the window.handleBookNow function
  useEffect(() => {
    (window as any).handleBookNow = handleBookNow;
  }, [selectedStation, handleBookNow]);

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {locationError && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1,
            maxWidth: '80%',
            boxShadow: 2
          }}
        >
          {locationError}
        </Alert>
      )}
      <Box
        sx={{
          position: 'absolute',
          top: locationError ? 70 : 10,
          right: 10,
          zIndex: 1,
        }}
      >
        <Tooltip title="Get Current Location">
          <IconButton
            onClick={handleGetCurrentLocation}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Dialog
        open={mapsBlockedDialogOpen}
        onClose={() => setMapsBlockedDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Google Maps Access Blocked</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Google Maps is being blocked by your browser. This might be due to:
          </Typography>
          <ul>
            <li>Ad blocker extensions</li>
            <li>Privacy protection extensions</li>
            <li>Firewall settings</li>
          </ul>
          <Typography paragraph>
            To use the map feature, please:
          </Typography>
          <ol>
            <li>Disable your ad blocker for this site</li>
            <li>Add an exception for maps.googleapis.com</li>
            <li>Refresh the page</li>
          </ol>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapsBlockedDialogOpen(false)}>
            Close
          </Button>
          <Button 
            onClick={retryLoadMaps} 
            variant="contained" 
            color="primary"
            disabled={loadRetries >= MAX_RETRIES}
          >
            Retry Loading Maps
          </Button>
        </DialogActions>
      </Dialog>
      {selectedStation && (
        <BookingModal
          open={isBookingDialogOpen}
          onClose={() => setIsBookingDialogOpen(false)}
          station={selectedStation}
        />
      )}
    </Box>
  );
};

export default Map; 