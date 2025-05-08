import { collection, doc, getDoc, getDocs, query, where, GeoPoint, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Station } from '../types';

export const getStation = async (stationId: string): Promise<Station | null> => {
  try {
    const stationRef = doc(db, 'stations', stationId);
    const stationSnap = await getDoc(stationRef);

    if (!stationSnap.exists()) {
      return null;
    }

    const data = stationSnap.data();
    const geoPoint = data.location as GeoPoint;
    
    return {
      id: stationSnap.id,
      ...data,
      location: {
        lat: geoPoint.latitude,
        lng: geoPoint.longitude
      }
    } as Station;
  } catch (error) {
    console.error('Error getting station:', error);
    throw error;
  }
};

export const getAllStations = async (): Promise<Station[]> => {
  try {
    const stationsQuery = query(collection(db, 'stations'));
    const querySnapshot = await getDocs(stationsQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const geoPoint = data.location as GeoPoint;
      
      return {
        id: doc.id,
        ...data,
        location: {
          lat: geoPoint.latitude,
          lng: geoPoint.longitude
        }
      } as Station;
    });
  } catch (error) {
    console.error('Error getting all stations:', error);
    throw error;
  }
};

export const getAdminStations = async (adminId: string): Promise<Station[]> => {
  try {
    const stationsQuery = query(
      collection(db, 'stations'),
      where('adminId', '==', adminId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(stationsQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const geoPoint = data.location as GeoPoint;
      
      return {
        id: doc.id,
        ...data,
        location: {
          lat: geoPoint.latitude,
          lng: geoPoint.longitude
        }
      } as Station;
    });
  } catch (error) {
    console.error('Error getting admin stations:', error);
    throw error;
  }
};

export const getActiveStations = async (): Promise<Station[]> => {
  try {
    const stationsQuery = query(
      collection(db, 'stations'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(stationsQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const geoPoint = data.location as GeoPoint;
      
      return {
        id: doc.id,
        ...data,
        location: {
          lat: geoPoint.latitude,
          lng: geoPoint.longitude
        }
      } as Station;
    });
  } catch (error) {
    console.error('Error getting active stations:', error);
    throw error;
  }
};

export const getStationBookings = async (stationId: string) => {
  try {
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('stationId', '==', stationId),
      orderBy('startTime', 'desc')
    );
    const querySnapshot = await getDocs(bookingsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting station bookings:', error);
    throw error;
  }
};

export const getNearbyStations = async (
  latitude: number,
  longitude: number,
  radiusInKm: number
): Promise<Station[]> => {
  try {
    // For now, we'll get all stations and filter them in memory
    // In a production environment, you'd want to use a geospatial query
    const stations = await getAllStations();
    
    return stations.filter(station => {
      const distance = calculateDistance(
        latitude,
        longitude,
        station.location.lat,
        station.location.lng
      );
      return distance <= radiusInKm;
    });
  } catch (error) {
    console.error('Error getting nearby stations:', error);
    throw error;
  }
};

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
}; 