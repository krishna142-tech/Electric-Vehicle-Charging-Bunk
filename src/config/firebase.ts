import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { auth, db, app } from './firebaseConfig';

export type { Auth, Firestore };
export { auth, db, app }; 