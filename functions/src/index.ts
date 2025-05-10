import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const checkAndUpdateExpiredBookings = functions.pubsub
  .schedule("every 5 minutes")
  .timeZone("Asia/Kolkata") // Set your timezone if needed
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date().toISOString();

    // Get all confirmed or verified bookings that have expired
    const bookingsRef = db.collection("bookings");
    const snapshot = await bookingsRef
      .where("status", "in", ["confirmed", "verified"])
      .where("endTime", "<=", now)
      .get();

    if (snapshot.empty) {
      console.log("No expired bookings found.");
      return null;
    }

    const batch = db.batch();

    snapshot.docs.forEach((docSnap) => {
      const booking = docSnap.data();
      // Update booking status
      batch.update(docSnap.ref, {
        status: "completed",
        expired: true,
      });
      // Update station's available slots
      const stationRef = db.collection("stations").doc(booking.stationId);
      batch.update(stationRef, {
        availableSlots: admin.firestore.FieldValue.increment(1),
      });
    });

    await batch.commit();
    console.log(`Processed ${snapshot.size} expired bookings.`);
    return null;
  });