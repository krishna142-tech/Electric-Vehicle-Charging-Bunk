import { FC, useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Container,
  useMediaQuery,
  Card,
  CardContent,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Booking, Station } from '../../types';
import { Html5QrcodeScanner } from 'html5-qrcode';

// @ts-ignore
// eslint-disable-next-line
declare module 'html5-qrcode';

interface QRScanDialogProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  onScanError: (err: string) => void;
}

const QRScanDialog: FC<QRScanDialogProps> = ({ open, onClose, onScanSuccess, onScanError }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstance = useRef<any>(null);
  const handleScanSuccess = useCallback((decodedText: string) => {
    onScanSuccess(decodedText);
    scannerInstance.current?.clear();
  }, [onScanSuccess]);
  useEffect(() => {
    if (open && scannerRef.current) {
      scannerInstance.current = new Html5QrcodeScanner(
        scannerRef.current.id,
        { fps: 10, qrbox: 250 },
        false
      );
      scannerInstance.current.render(
        handleScanSuccess,
        (error: any) => {
          if (typeof error === 'string' && !error.includes('decode')) {
            onScanError(error);
          }
        }
      );
    }
    return () => {
      scannerInstance.current?.clear();
    };
  }, [open, handleScanSuccess, onScanError]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Scan User QR Code</DialogTitle>
      <DialogContent>
        <div id="qr-scanner" ref={scannerRef} style={{ width: '100%' }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Point the camera at the user's booking QR code.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const Bookings: FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<(Booking & { station?: Station })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      if (!user) return;

      setLoading(true);
      setError(null);

      // Get all stations owned by the admin
      const stationsRef = collection(db, 'stations');
      const stationsQuery = query(stationsRef, where('createdBy', '==', user.uid));
      const stationsSnapshot = await getDocs(stationsQuery);
      const stationIds = stationsSnapshot.docs.map(doc => doc.id);
      const stations = stationsSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = { id: doc.id, ...doc.data() } as Station;
        return acc;
      }, {} as { [key: string]: Station });

      // Get all bookings for these stations
      const bookingsRef = collection(db, 'bookings');
      const bookingsQuery = query(bookingsRef, where('stationId', 'in', stationIds));
      const bookingsSnapshot = await getDocs(bookingsQuery);

      const bookingsData = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        station: stations[doc.data().stationId]
      })) as (Booking & { station?: Station })[];

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Please log in as an admin to access this page.</Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="80vh"
        >
          <CircularProgress size={48} color="primary" />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Loading bookings...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 4,
            background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Manage Bookings
        </Typography>
        <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setScanDialogOpen(true)}>
          Scan QR
        </Button>
        <QRScanDialog
          open={scanDialogOpen}
          onClose={() => setScanDialogOpen(false)}
          onScanSuccess={async (data: string) => {
            if (!scanning) {
              setScanning(true);
              setScanError(null);
              try {
                const bookingId = data.trim();
                const bookingRef = doc(db, 'bookings', bookingId);
                const bookingSnap = await getDoc(bookingRef);
                if (!bookingSnap.exists()) {
                  setScanError('Booking not found.');
                  setScanning(false);
                  return;
                }
                await updateDoc(bookingRef, {
                  status: 'verified',
                  expired: true,
                  verifiedAt: new Date().toISOString(),
                });
                setScanSuccess('Booking verified and expired!');
                setTimeout(() => {
                  setScanDialogOpen(false);
                  setScanSuccess(null);
                  setScanning(false);
                  fetchBookings();
                }, 1500);
              } catch (err) {
                setScanError('Failed to verify booking.');
                setScanning(false);
              }
            }
          }}
          onScanError={(err: string) => setScanError('QR scan error. Please try again.')}
        />
        {scanError && <Alert severity="error" sx={{ mb: 2 }}>{scanError}</Alert>}
        {scanSuccess && <Alert severity="success" sx={{ mb: 2 }}>{scanSuccess}</Alert>}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isMobile ? (
          <Box>
            {bookings.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No bookings found
              </Typography>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">STATION</Typography>
                    <Typography variant="h6">{booking.station?.name || 'Unknown Station'}</Typography>
                    <Typography sx={{ mt: 1 }}>User: {booking.userId}</Typography>
                    <Typography>Start: {booking.startTime ? new Date(booking.startTime).toLocaleString() : '-'}</Typography>
                    <Typography>End: {booking.endTime ? new Date(booking.endTime).toLocaleString() : '-'}</Typography>
                    <Typography>Amount: {booking.amount} {booking.station?.rates?.currency || 'INR'}</Typography>
                    <Typography>Status: <Chip label={booking.status} color={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : booking.status === 'cancelled' ? 'error' : 'default'} size="small" /></Typography>
                    <Typography>Payment: <Chip label={booking.paymentStatus} color={booking.paymentStatus === 'completed' ? 'success' : booking.paymentStatus === 'pending' ? 'warning' : 'error'} size="small" /></Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(38, 198, 218, 0.1)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Station</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No bookings found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.station?.name || 'Unknown Station'}</TableCell>
                      <TableCell>{booking.userId}</TableCell>
                      <TableCell>
                        {booking.startTime ? new Date(booking.startTime).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        {booking.endTime ? new Date(booking.endTime).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        {booking.amount} {booking.station?.rates.currency || 'INR'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={
                            booking.status === 'confirmed'
                              ? 'success'
                              : booking.status === 'pending'
                              ? 'warning'
                              : booking.status === 'cancelled'
                              ? 'error'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.paymentStatus}
                          color={
                            booking.paymentStatus === 'completed'
                              ? 'success'
                              : booking.paymentStatus === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default Bookings; 