import { FC, useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { verifyBooking } from '../../services/booking';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ScanQR: FC = () => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasStations, setHasStations] = useState<boolean | null>(null);

  // Check if admin has any stations
  useEffect(() => {
    const checkStations = async () => {
      if (!user) return;
      
      try {
        const stationsRef = collection(db, 'stations');
        const q = query(stationsRef, where('createdBy', '==', user.uid));
        const querySnapshot = await getDocs(q);
        setHasStations(!querySnapshot.empty);
        
        if (querySnapshot.empty) {
          setError('You need to add a station before you can verify bookings');
        }
      } catch (err) {
        console.error('Error checking stations:', err);
        setError('Failed to check station ownership');
      }
    };

    checkStations();
  }, [user]);

  const handleBookingValidation = async (bookingId: string) => {
    if (!user) {
      setError('You must be logged in to verify bookings');
      return;
    }

    if (!hasStations) {
      setError('You need to add a station before you can verify bookings');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Stop the scanner immediately after getting a valid QR code
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
      }

      await verifyBooking(bookingId, user.uid);
      setScanResult({ message: 'Booking verified successfully!' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify booking';
      setError(errorMessage);
      // If the booking is already verified, show a different message
      if (errorMessage === 'Booking is already verified') {
        setScanResult({ message: 'This booking has already been verified!' });
      }
      console.error('Error verifying booking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scannerRef.current && hasStations) {
      const scannerId = 'qr-scanner';
      scannerRef.current.id = scannerId;
      html5QrCodeRef.current = new Html5Qrcode(scannerId);
      html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          // Only process if not already loading
          if (!loading) {
            handleBookingValidation(decodedText);
          }
        },
        (error: string) => {
          // Only log errors that are not related to "no QR code found"
          if (!error.includes('NotFoundException')) {
            console.error('QR Scan error:', error);
          }
        }
      ).catch((err: Error) => {
        setError('Failed to start QR scanner');
        console.error('Failed to start QR scanner:', err);
      });
    }

    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().then(() => {
            html5QrCodeRef.current?.clear();
          }).catch((err: Error) => {
            console.error('Error stopping scanner:', err);
          });
        } catch (err) {
          console.error('Error in cleanup:', err);
        }
      }
    };
  }, [loading, hasStations]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Scan Booking QR Code
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {scanResult ? (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              {scanResult.message}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setScanResult(null);
                navigate('/admin/bookings');
              }}
              sx={{ mt: 2 }}
            >
              Back to Bookings
            </Button>
          </Box>
        ) : (
          <>
            {hasStations ? (
              <Box sx={{ position: 'relative', width: '100%', height: '300px', mb: 2 }}>
                <div ref={scannerRef} style={{ width: '100%', height: '100%' }} />
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/admin/stations')}
                >
                  Add Station
                </Button>
              </Box>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/admin/bookings')}
            >
              Cancel
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default ScanQR; 