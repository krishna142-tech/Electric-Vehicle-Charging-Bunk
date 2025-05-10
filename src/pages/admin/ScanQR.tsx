import { FC, useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { verifyBooking } from '../../services/booking';

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

      // Stop the scanner immediately after getting a valid QR code
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
      }

      await verifyBooking(bookingId);
      setScanResult({ message: 'Booking verified successfully!' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify booking');
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
  }, [loading]); // Add loading as a dependency

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