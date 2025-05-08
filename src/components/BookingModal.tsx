import { FC, useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Station } from '../types';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  station: Station;
}

const BookingModal: FC<BookingModalProps> = ({ open, onClose, station }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingTime, setBookingTime] = useState<Date | null>(new Date());
  const [durationType, setDurationType] = useState<'preset' | 'custom'>('preset');
  const [duration, setDuration] = useState<number>(1); // Default 1 hour
  const [customMinutes, setCustomMinutes] = useState<number>(15); // Default 15 minutes
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Calculate total cost based on duration type
  const getTotalCost = () => {
    const ratePerHour = station.rates?.perHour || 0;
    if (durationType === 'preset') {
      return duration * ratePerHour;
    } else {
      // Convert minutes to hours for cost calculation
      return (customMinutes / 60) * ratePerHour;
    }
  };

  const totalCost = getTotalCost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTime || !user) return;

    try {
      setLoading(true);
      setError(null);

      // Calculate final duration in minutes
      const finalDurationMinutes = durationType === 'preset' ? duration * 60 : customMinutes;
      const durationMs = finalDurationMinutes * 60 * 1000;
      const expiresAt = new Date(bookingTime.getTime() + durationMs).toISOString();
      const startTime = bookingTime.toISOString();
      const endTime = new Date(bookingTime.getTime() + durationMs).toISOString();

      // Create booking in Firestore
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        stationId: station.id,
        stationName: station.name,
        userId: user.uid,
        userName: name,
        userPhone: phone,
        bookingTime: bookingTime.toISOString(),
        startTime,
        endTime,
        duration: finalDurationMinutes,
        totalCost: totalCost,
        status: 'confirmed',
        paymentStatus: 'completed',
        createdAt: new Date().toISOString()
      });
      setBookingId(bookingRef.id);

      // Add qrCode and expiresAt fields
      await updateDoc(doc(db, 'bookings', bookingRef.id), {
        qrCode: bookingRef.id,
        expiresAt: expiresAt
      });

      // Update station's available slots
      const stationRef = doc(db, 'stations', station.id);
      await updateDoc(stationRef, {
        availableSlots: (station.availableSlots || 0) - 1
      });

      setStep('confirmation');
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error('Error creating booking:', err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Booking Confirmed!</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Your booking has been confirmed. You can now proceed to the station.<br />
            <strong>You can view your QR code anytime in the Bookings section.</strong>
          </Alert>
          {bookingId && (
            <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Show this QR code at the station for verification:
              </Typography>
              <QRCodeCanvas value={bookingId} size={180} />
              <Typography variant="caption" sx={{ mt: 1 }}>
                Booking ID: {bookingId}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <Box display="flex" justifyContent="center" pb={3}>
          <Button variant="contained" onClick={onClose}>OK</Button>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Book Charging Station</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Booking Time"
                  value={bookingTime}
                  onChange={(newValue) => setBookingTime(newValue)}
                  sx={{ width: '100%', mt: 2 }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <RadioGroup
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value as 'preset' | 'custom')}
                >
                  <FormControlLabel
                    value="preset"
                    control={<Radio />}
                    label="Preset Duration"
                  />
                  <FormControlLabel
                    value="custom"
                    control={<Radio />}
                    label="Custom Duration"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              {durationType === 'preset' ? (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Duration (hours)</InputLabel>
                  <Select
                    value={duration}
                    label="Duration (hours)"
                    onChange={(e) => setDuration(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map((hours) => (
                      <MenuItem key={hours} value={hours}>
                        {hours} {hours === 1 ? 'hour' : 'hours'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="Custom Duration"
                  type="number"
                  value={customMinutes}
                  onChange={(e) => {
                    const value = Math.max(15, Number(e.target.value));
                    setCustomMinutes(value);
                  }}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                    inputProps: { min: 15 }
                  }}
                  helperText="Minimum duration: 15 minutes"
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Cost Breakdown:
                </Typography>
                <Typography>
                  Rate: {station.rates?.currency || 'INR'} {station.rates?.perHour || 0}/hour
                </Typography>
                <Typography>
                  Duration: {durationType === 'preset' 
                    ? `${duration} ${duration === 1 ? 'hour' : 'hours'}`
                    : `${customMinutes} minutes`
                  }
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Total Cost: {station.rates?.currency || 'INR'} {totalCost.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !name || !phone || !bookingTime}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BookingModal; 