import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { initializeFirestore } from '../utils/firebaseErrorHandler';

interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Initialize Firestore with error handling
initializeFirestore(db).then(({ success, error }) => {
  if (!success && error) {
    console.error('Firestore initialization error:', error);
    // Only disable network if connection is blocked
    if (error.includes('blocked')) {
      disableNetwork(db).then(() => {
        console.log('Network disabled due to blocking');
      }).catch(console.error);
    }
  }
}).catch(error => {
  // Handle any uncaught initialization errors
  console.error('Uncaught Firestore initialization error:', error);
});

// Log non-sensitive config for debugging
console.log('Firebase initialized with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
});

export type { FirebaseConfig };
export { firebaseConfig, app, auth, db }; 