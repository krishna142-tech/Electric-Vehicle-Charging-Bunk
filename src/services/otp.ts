import emailjs from 'emailjs-com';

// Initialize EmailJS with your public key
emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '');

// Generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to get expiry time string (15 minutes from now)
const getExpiryTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const sendOtp = async (email: string) => {
  try {
    const otp = generateOtp();
    const templateParams = {
      to_email: email,
      otp: otp,
      expiry_time: getExpiryTime(),
    };

    await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID || '',
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '',
      templateParams
    );

    return otp;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP. Please try again.');
  }
};

// Verify OTP
export const verifyOtp = async (inputOtp: string, sentOtp: string) => {
  return inputOtp === sentOtp;
};