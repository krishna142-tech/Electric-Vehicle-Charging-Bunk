import { ChargingStation } from '../types';

// This is a placeholder for the actual Google Maps implementation
// You'll need to add the Google Maps JavaScript API to your project
// and replace this with actual implementation

export const initializeMap = (containerId: string, center: { lat: number; lng: number }) => {
  // Initialize Google Maps
  // This is where you'll add the actual Google Maps initialization code
  console.log('Initializing map in container:', containerId, 'at center:', center);
};

export const addStationMarkers = (stations: ChargingStation[]) => {
  // Add markers for each charging station
  // This is where you'll add the actual marker creation code
  console.log('Adding markers for stations:', stations);
};

export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  // Haversine formula to calculate distance between two points
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
}; 