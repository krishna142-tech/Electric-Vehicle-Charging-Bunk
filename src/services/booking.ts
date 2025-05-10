import { collection, query, where, getDocs, updateDoc, doc, Timestamp, increment, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const checkAndUpdateExpiredBookings = async () => {
  try {
    console.log('Running checkAndUpdateExpiredBookings...');
    // Get all confirmed bookings that have expired
    const bookingsRef = collection(db, 'bookings');
    const now = new Date();
    const nowIso = now.toISOString();
    console.log('Current time (ISO):', nowIso);
    const q = query(
      bookingsRef,
      where('status', 'in', ['confirmed', 'verified']),
      where('endTime', '<=', nowIso)
    );

    const querySnapshot = await getDocs(q);
    const expiredBookings = querySnapshot.docs;
    console.log('Found', expiredBookings.length, 'expired bookings');

    // Process each expired booking
    for (const bookingDoc of expiredBookings) {
      const booking = bookingDoc.data();
      console.log('Processing booking:', bookingDoc.id, booking);
      console.log('Booking endTime:', booking.endTime, 'Type:', typeof booking.endTime);
      // Update booking status
      await updateDoc(doc(db, 'bookings', bookingDoc.id), {
        status: 'completed',
        expired: true
      });

      // Update station's available slots
      const stationRef = doc(db, 'stations', booking.stationId);
      await updateDoc(stationRef, {
        availableSlots: increment(1)
      });
      console.log('Incremented availableSlots for station:', booking.stationId);
    }

    return expiredBookings.length;
  } catch (error) {
    console.error('Error checking expired bookings:', error);
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
export const verifyBooking = async (bookingId: string) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const booking = bookingSnap.data();
    
    // Update booking status
    await updateDoc(bookingRef, {
      status: 'verified',
      expired: true,
      verifiedAt: new Date().toISOString()
    });

    // Update station's available slots
    const stationRef = doc(db, 'stations', booking.stationId);
    await updateDoc(stationRef, {
      availableSlots: increment(1)
    });

    return true;
  } catch (error) {
    console.error('Error verifying booking:', error);
    throw error;
  }
}; 