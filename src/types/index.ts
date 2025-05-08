import { User as FirebaseUser } from 'firebase/auth';
import { FieldValue, Timestamp } from 'firebase/firestore';

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark';
  language: string;
}

export interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  displayName: string | null;
  preferences: UserPreferences;
  createdAt: FieldValue | Timestamp;
  updatedAt: FieldValue | Timestamp;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  latitude: number;
  longitude: number;
  availableSlots: number;
  totalSlots: number;
  rates: {
    perHour: number;
    currency: string;
  };
  operatingHours: {
    open: string;
    close: string;
  };
  bookedSlots?: {
    [key: string]: {
      startTime: Date;
      endTime: Date;
    };
  };
  status: 'operational' | 'maintenance' | 'offline';
  lastUpdated: Date;
  createdBy: string;
  createdAt: Date;
}

// Alias for backward compatibility
export type ChargingStation = Station;

export interface Booking {
  id: string;
  userId: string;
  stationId: string;
  slotNumber: number;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed';
  amount: number;
  createdAt: Date;
}

export interface PaymentSession {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
} 