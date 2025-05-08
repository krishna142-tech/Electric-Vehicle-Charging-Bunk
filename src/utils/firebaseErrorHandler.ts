import { enableIndexedDbPersistence, Firestore, getFirestore, initializeFirestore as initFirestore } from 'firebase/firestore';

export const initializeFirestore = async (db: Firestore): Promise<{ success: boolean; error?: string }> => {
  try {
    // First try to initialize with memory-only persistence
    initFirestore(db.app, {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true
    });

    try {
      // Then try to enable IndexedDB persistence
      await enableIndexedDbPersistence(db, {
        forceOwnership: false // Don't force ownership of persistence
      });
    } catch (persistenceError: any) {
      // If persistence fails, just log it but continue
      console.warn('Persistence initialization failed:', persistenceError);
      // Don't return error here - continue with memory-only mode
    }

    return { success: true };
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      // Multiple tabs might be open, but we'll continue in memory-only mode
      console.warn('Multiple tabs detected, continuing in memory-only mode');
      return { success: true }; // Still return success as the app can function
    } else if (error.message?.includes('blocked by client')) {
      // Connection blocked by ad blocker or privacy extension
      console.error('Firebase connection blocked:', error);
      return {
        success: false,
        error: 'Connection to our services is being blocked. If you are using an ad blocker, please disable it for this site or whitelist Firebase services.'
      };
    } else if (error.code === 'unimplemented') {
      // Browser doesn't support persistence, continue in memory-only mode
      console.warn('Browser does not support persistence, continuing in memory-only mode');
      return { success: true }; // Still return success as the app can function
    }
    
    // Other errors
    console.error('Firebase initialization error:', error);
    return {
      success: false,
      error: 'Unable to connect to our services. Please check your internet connection and try again.'
    };
  }
}; 