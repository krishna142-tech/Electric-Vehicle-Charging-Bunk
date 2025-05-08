import { Firestore, collection, getDocs } from 'firebase/firestore';

export const initializeFirestore = async (db: Firestore) => {
  try {
    // Test the connection by making a simple query
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    return { success: true };
  } catch (error) {
    console.error('Firestore connection error:', error);
    return { 
      success: false, 
      error: 'Failed to connect to the database. Please check your internet connection and try again.' 
    };
  }
}; 