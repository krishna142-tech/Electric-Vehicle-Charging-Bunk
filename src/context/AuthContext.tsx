import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'user' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  register: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser({
              ...userData,
              id: userDoc.id,
            });
          } else {
            // If no custom user data exists, create it
            const timestamp = serverTimestamp();
            const newUser: Omit<User, 'id'> = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              displayName: firebaseUser.displayName,
              ...(firebaseUser.phoneNumber && { phone: firebaseUser.phoneNumber }),
              preferences: {
                notifications: true,
                theme: 'light',
                language: 'en'
              },
              role: 'user',
              status: 'active',
              createdAt: timestamp,
              updatedAt: timestamp,
            };

            await setDoc(userRef, newUser);
            setUser({
              ...newUser,
              id: userRef.id,
            } as User);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError('Failed to authenticate');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in');
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'user' | 'admin') => {
    try {
      setError(null);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const timestamp = serverTimestamp();
      const newUser: Omit<User, 'id'> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name,
        displayName: name,
        ...(firebaseUser.phoneNumber && { phone: firebaseUser.phoneNumber }),
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en'
        },
        role,
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 