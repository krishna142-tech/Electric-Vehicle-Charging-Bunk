import { FC, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyOtp } from '../services/otp';

const Register: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [pendingRegister, setPendingRegister] = useState<any>(null);
  const [otpError, setOtpError] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const generatedOtp = await sendOtp(email);
      setSentOtp(generatedOtp);
      setPendingRegister({ email, password, name, role });
      setOtpDialogOpen(true);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    const isValid = await verifyOtp(otp, sentOtp);
    if (isValid) {
      try {
        await register(pendingRegister.email, pendingRegister.password, pendingRegister.name, pendingRegister.role);
        setOtpDialogOpen(false);
      } catch (err) {
        setOtpError('Registration failed. Please try again.');
      }
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
          Create Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />
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
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin" disabled>Admin</MenuItem>
            </Select>
          </FormControl>
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
            Register
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Login here
          </Link>
        </Typography>
      </Paper>
      <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <TextField
            label="OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          {otpError && <Alert severity="error" sx={{ mt: 2 }}>{otpError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVerifyOtp} variant="contained">Verify</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Register; 