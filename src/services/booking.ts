import { collection, query, where, getDocs, updateDoc, doc, Timestamp, increment, getDoc, writeBatch, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Booking {
  id: string;
  userId: string;
  stationId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'verified' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Station {
  id: string;
  name: string;
  location: string;
  totalSlots: number;
  availableSlots: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const checkAndUpdateExpiredBookings = async () => {
  try {
    const now = new Date();
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('status', 'in', ['confirmed', 'verified']),
      where('endTime', '<', now.toISOString())
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    for (const bookingDoc of querySnapshot.docs) {
      const booking = bookingDoc.data() as Booking;
      
      // Update booking status
      batch.update(bookingDoc.ref, {
        status: 'completed',
        updatedAt: now
      });

      // Update station's available slots
      const stationRef = doc(db, 'stations', booking.stationId);
      const stationDoc = await getDoc(stationRef);
      
      if (stationDoc.exists()) {
        const station = stationDoc.data() as Station;
        const currentAvailableSlots = station.availableSlots || 0;
        
        // Ensure we don't exceed total slots
        const newAvailableSlots = Math.min(
          station.totalSlots,
          currentAvailableSlots + 1
        );

        batch.update(stationRef, {
          availableSlots: newAvailableSlots,
          updatedAt: now
        });
      }
    }

    if (querySnapshot.size > 0) {
      await batch.commit();
      console.log(`Updated ${querySnapshot.size} expired bookings`);
    }
  } catch (error) {
    console.error('Error updating expired bookings:', error);
    throw error;
  }
};

// Function to start periodic checking of expired bookings
export const startExpiredBookingsCheck = () => {
  // Check every 5 seconds for debugging
  const interval = setInterval(async () => {
    try {
      await checkAndUpdateExpiredBookings();
    } catch (error) {
      console.error('Error in periodic booking check:', error);
    }
  }, 5000); // 5000 ms = 5 seconds

  return interval;
};

// Function to verify a booking and update slots
export const verifyBooking = async (bookingId: string, adminId: string) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const booking = bookingSnap.data();
    
    // Check if booking is already verified
    if (booking.status === 'verified') {
      throw new Error('Booking is already verified');
    }

    // Get the station to check ownership
    const stationRef = doc(db, 'stations', booking.stationId);
    const stationSnap = await getDoc(stationRef);
    
    if (!stationSnap.exists()) {
      throw new Error('Station not found');
    }

    const station = stationSnap.data();
    
    // Check if the admin owns the station
    if (station.createdBy !== adminId) {
      throw new Error('You do not have permission to verify bookings for this station');
    }

    // Only update booking status, do NOT increment slots here
    await updateDoc(bookingRef, {
      status: 'verified',
      expired: true,
      verifiedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error verifying booking:', error);
    throw error;
  }
};

// Add new function to update station slots
export const updateStationSlots = async (stationId: string, newAvailableSlots: number) => {
  try {
    const stationRef = doc(db, 'stations', stationId);
    const stationDoc = await getDoc(stationRef);
    
    if (!stationDoc.exists()) {
      throw new Error('Station not found');
    }

    const station = stationDoc.data() as Station;
    
    // Ensure new available slots is between 0 and total slots
    const validSlots = Math.max(0, Math.min(station.totalSlots, newAvailableSlots));
    
    await updateDoc(stationRef, {
      availableSlots: validSlots,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error updating station slots:', error);
    throw error;
  }
}; 