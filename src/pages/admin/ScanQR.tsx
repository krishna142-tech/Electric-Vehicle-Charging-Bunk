import { FC, useEffect, useRef } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

const ScanQR: FC = () => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scannerRef.current) {
      const scannerId = 'qr-scanner';
      scannerRef.current.id = scannerId;
      html5QrCodeRef.current = new Html5Qrcode(scannerId);
      html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          console.log('QR Code scanned:', decodedText);
          // Here you can handle the scanned QR code data
          // For example, navigate to a booking detail page or update a booking status
        },
        (error: string) => {
          console.error('QR Scan error:', error);
        }
      ).catch((err: Error) => {
        console.error('Failed to start QR scanner:', err);
      });
    }

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear();
        });
      }
    };
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Scan QR Code
        </Typography>
        <Box sx={{ position: 'relative', width: '100%', height: '300px', mb: 2 }}>
          <div ref={scannerRef} style={{ width: '100%', height: '100%' }} />
        </Box>
        <Button variant="contained" color="primary" onClick={() => navigate('/admin/bookings')}>
          Back to Bookings
        </Button>
      </Box>
    </Container>
  );
};

export default ScanQR; 