import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';

const functions = getFunctions(app);

export const sendOtp = async (email: string) => {
  const sendOtpFn = httpsCallable(functions, 'sendOtp');
  return await sendOtpFn({ email });
};

export const verifyOtp = async (email: string, otp: string) => {
  const verifyOtpFn = httpsCallable(functions, 'verifyOtp');
  return await verifyOtpFn({ email, otp });
}; 