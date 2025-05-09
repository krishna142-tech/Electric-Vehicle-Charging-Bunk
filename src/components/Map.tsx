import { FC, useState, useRef } from 'react';
import { Box, Typography, IconButton, Tooltip, Paper, Alert } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Station } from '../types';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

interface MapProps {
  stations?: Station[];
  onStationSelect?: (station: Station) => void;
}

const Map: FC<MapProps> = ({ stations = [], onStationSelect }) => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
    if (onStationSelect) onStationSelect(station);
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
          if (mapRef.current) {
            mapRef.current.panTo(pos);
            mapRef.current.setZoom(14);
          }
        },
        (error) => {
          let errorMessage = 'Unable to get your location. ';
          switch (error.code) {
            case 1:
              errorMessage = 'Location permission denied. Please enable location services.';
              break;
            case 2:
              errorMessage = 'Location information is unavailable.';
              break;
            case 3:
              errorMessage = 'Location request timed out.';
              break;
          }
          setLocationError(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
    }
  };

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  if (!apiKey) {
    return (
      <Box sx={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">Google Maps API key is missing. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file.</Alert>
      </Box>
    );
  }
  if (!stations || stations.length === 0) {
    return (
      <Box sx={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="info">No stations found to display on the map.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '400px', position: 'relative' }}>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation || defaultCenter}
          zoom={userLocation ? 12 : 5}
          onLoad={map => {
            mapRef.current = map;
          }}
        >
          {stations.map((station) => (
            <Marker
              key={station.id}
              position={{ lat: station.latitude, lng: station.longitude }}
              onClick={() => handleStationClick(station)}
            />
          ))}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: window.google?.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
              }}
              title="Your Location"
            />
          )}
          {selectedStation && (
            <InfoWindow
              position={{ lat: selectedStation.latitude, lng: selectedStation.longitude }}
              onCloseClick={() => setSelectedStation(null)}
            >
              <Paper sx={{ p: 1 }}>
                <Typography variant="subtitle1">{selectedStation.name}</Typography>
                <Typography variant="body2">{selectedStation.address}</Typography>
              </Paper>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
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
            boxShadow: 2,
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
    </Box>
  );
};

export default Map; 