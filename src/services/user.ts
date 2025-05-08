import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, UserPreferences } from '../types';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  try {
    const userRef = doc(collection(db, USERS_COLLECTION));
    const timestamp = serverTimestamp();
    const newUser: User = {
      ...userData,
      id: userRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDoc(userRef, newUser);
    return newUser;
  } catch (error) {
    throw new Error(`Failed to create user: ${error}`);
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    throw new Error(`Failed to get user: ${error}`);
  }
};

export const updateUser = async (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(`Failed to update user: ${error}`);
  }
};

export const updateUserPreferences = async (userId: string, preferences: UserPreferences): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(`Failed to update user preferences: ${error}`);
  }
};

export const deactivateUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      status: 'inactive',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(`Failed to deactivate user: ${error}`);
  }
};

export const reactivateUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      status: 'active',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(`Failed to reactivate user: ${error}`);
  }
}; 