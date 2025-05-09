import { collection, query, where, getDocs, updateDoc, doc, Timestamp, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

export const checkAndUpdateExpiredBookings = async () => {
  try {
    // Get all confirmed bookings that have expired
    const bookingsRef = collection(db, 'bookings');
    const now = new Date();
    const q = query(
      bookingsRef,
      where('status', '==', 'confirmed'),
      where('endTime', '<=', now.toISOString())
    );

    const querySnapshot = await getDocs(q);
    const expiredBookings = querySnapshot.docs;

    // Process each expired booking
    for (const bookingDoc of expiredBookings) {
      const booking = bookingDoc.data();
      
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
    }

    return expiredBookings.length;
  } catch (error) {
    console.error('Error checking expired bookings:', error);
    throw error;
  }
};

// Function to start periodic checking of expired bookings
export const startExpiredBookingsCheck = () => {
  // Check every minute
  const interval = setInterval(async () => {
    try {
      await checkAndUpdateExpiredBookings();
    } catch (error) {
      console.error('Error in periodic booking check:', error);
    }
  }, 60000); // 60000 ms = 1 minute

  return interval;
}; 