import { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const PaymentPage: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const station = location.state?.station;
  const [method, setMethod] = useState('');
  const [upi, setUpi] = useState('');
  const [card, setCard] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!booking || !station) {
      navigate('/dashboard');
    }
  }, [booking, station, navigate]);

  const handlePayment = async () => {
    setError('');
    if ((method === 'UPI' && upi.toLowerCase() === 'fail') || (method === 'Card' && card.toLowerCase() === 'fail')) {
      setError('Payment failed. Please check your details.');
      return;
    }
    setLoading(true);
    try {
      // Decrement slot count in Firestore
      const stationRef = doc(db, 'stations', station.id);
      const stationSnap = await getDoc(stationRef);
      if (stationSnap.exists()) {
        const data = stationSnap.data();
        await updateDoc(stationRef, {
          availableSlots: Math.max(0, (data.availableSlots || 1) - 1),
        });
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to process payment.');
    } finally {
      setLoading(false);
    }
  };

  if (!booking || !station) return null;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f7fafd">
      <Paper elevation={3} sx={{ p: 5, borderRadius: 4, minWidth: 400 }}>
        <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
          Payment for {station.name}
        </Typography>
        <Typography variant="body1" mb={2} textAlign="center">
          Amount: <b>{station.rates.currency} {booking.amount}</b>
        </Typography>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12}>
            <Button
              variant={method === 'Card' ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => setMethod('Card')}
              sx={{ py: 1.5 }}
            >
              Credit/Debit Card
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant={method === 'UPI' ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => setMethod('UPI')}
              sx={{ py: 1.5 }}
            >
              UPI
            </Button>
          </Grid>
        </Grid>
        {method === 'UPI' && (
          <TextField
            label="UPI ID"
            value={upi}
            onChange={e => setUpi(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          />
        )}
        {method === 'Card' && (
          <TextField
            label="Card Number"
            value={card}
            onChange={e => setCard(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          />
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success ? (
          <Alert severity="success">Payment Successful! Redirecting...</Alert>
        ) : (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}
            onClick={handlePayment}
            disabled={loading || !method || (method === 'UPI' && !upi) || (method === 'Card' && !card)}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm Payment'}
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentPage; 