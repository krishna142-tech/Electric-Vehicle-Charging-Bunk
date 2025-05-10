import emailjs from 'emailjs-com';

const SERVICE_ID = '';
const TEMPLATE_ID = '';
const PUBLIC_KEY = '';

// Generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to get expiry time string (15 minutes from now)
const getExpiryTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const sendOtp = async (email: string) => {
  const otp = generateOtp();
  const templateParams = {
    email, // matches {{email}} in your template
    passcode: otp, // matches {{passcode}}
    time: getExpiryTime(), // matches {{time}}
  };
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
  // Return the OTP so the frontend can verify it
  return otp;
};

// On the frontend, store the OTP in state and compare it when the user enters it
export const verifyOtp = async (inputOtp: string, sentOtp: string) => {
  return inputOtp === sentOtp;
}; 
