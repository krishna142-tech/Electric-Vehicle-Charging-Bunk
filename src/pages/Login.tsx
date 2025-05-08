import { FC, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyOtp } from '../services/otp';
import { Google as GoogleIcon, Email as EmailIcon } from '@mui/icons-material';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
  const [otpEmail, setOtpEmail] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // New user: sign out and show error
        await auth.signOut();
        setError('No account found. Please register first.');
        return;
      }
      // Existing user: proceed as normal
    } catch (err) {
      setError('Google login failed.');
    }
  };

  // OTP login (forgot password)
  const handleOpenOtpDialog = () => {
    setOtpDialogOpen(true);
    setOtpStep('send');
    setOtpEmail('');
    setOtp('');
    setOtpError('');
  };

  const handleSendOtp = async () => {
    setOtpError('');
    try {
      const generatedOtp = await sendOtp(otpEmail);
      setSentOtp(generatedOtp);
      setOtpStep('verify');
    } catch (err) {
      setOtpError('Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    const isValid = await verifyOtp(otp, sentOtp);
    if (isValid) {
      // Show a success message or proceed with passwordless login logic
      setOtpDialogOpen(false);
      alert('OTP verified! You can now log in or reset your password.');
    } else {
      setOtpError('Invalid OTP');
    }
  };

  if (user) {
    return null;
  }

  return (
    <Box
      className="page-container"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 8 },
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          width: '100%',
          maxWidth: '400px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(38, 198, 218, 0.1)',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 3,
            fontWeight: 700,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              mb: 2,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4DD0E1, #64B5F6)',
              },
            }}
          >
            Login
          </Button>
        </form>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{ mb: 2, borderRadius: '12px', fontWeight: 600 }}
        >
          Login with Google
        </Button>

        <Button
          fullWidth
          variant="text"
          startIcon={<EmailIcon />}
          onClick={handleOpenOtpDialog}
          sx={{ mb: 2, borderRadius: '12px', fontWeight: 600 }}
        >
          Forgot Password? Login with OTP
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <Link
            component={RouterLink}
            to="/register"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Register here
          </Link>
        </Typography>
      </Paper>
      <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)}>
        <DialogTitle>OTP Login</DialogTitle>
        <DialogContent>
          {otpStep === 'send' ? (
            <>
              <TextField
                label="Email"
                value={otpEmail}
                onChange={e => setOtpEmail(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
              />
              {otpError && <Alert severity="error" sx={{ mt: 2 }}>{otpError}</Alert>}
            </>
          ) : (
            <>
              <TextField
                label="OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
              />
              {otpError && <Alert severity="error" sx={{ mt: 2 }}>{otpError}</Alert>}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {otpStep === 'send' ? (
            <Button onClick={handleSendOtp} variant="contained">Send OTP</Button>
          ) : (
            <Button onClick={handleVerifyOtp} variant="contained">Verify OTP & Login</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login; 