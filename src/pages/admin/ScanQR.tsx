import { FC, useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ScanQR: FC = () => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBookingValidation = async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);

      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) {
        setError('Booking not found');
        return;
      }

      const booking = bookingSnap.data();
      if (booking.status === 'verified') {
        setError('Booking already verified');
        return;
      }

      await updateDoc(bookingRef, {
        status: 'verified',
        verifiedAt: new Date().toISOString(),
      });

      setScanResult(booking);
      // Stop the scanner after successful verification
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      setError('Failed to verify booking');
      console.error('Error verifying booking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scannerRef.current) {
      const scannerId = 'qr-scanner';
      scannerRef.current.id = scannerId;
      html5QrCodeRef.current = new Html5Qrcode(scannerId);
      html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          // The QR code contains the booking ID directly
          handleBookingValidation(decodedText);
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
  }, []);

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
              Booking verified successfully!
            </Alert>
            <Typography variant="body1" gutterBottom>
              Station: {scanResult.stationName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Start Time: {new Date(scanResult.bookingTime).toLocaleString()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Duration: {scanResult.duration >= 60 ? `${scanResult.duration / 60} hr` : `${scanResult.duration} min`}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Amount: ₹{scanResult.totalCost}
            </Typography>
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
            <Box sx={{ position: 'relative', width: '100%', height: '300px', mb: 2 }}>
              <div ref={scannerRef} style={{ width: '100%', height: '100%' }} />
            </Box>
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