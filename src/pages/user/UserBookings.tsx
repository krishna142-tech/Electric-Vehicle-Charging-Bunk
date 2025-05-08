import { FC, useEffect, useState } from 'react';
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
  Button,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  DialogActions
} from '@mui/material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

interface Booking {
  id: string;
  stationName: string;
  bookingTime: string;
  duration: number;
  totalCost: number;
  status: string;
  paymentStatus: string;
  expiresAt?: string;
  qrCode?: string;
  endTime?: string;
  expired: boolean;
}

const BookingTicketModal: FC<{
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}> = ({ open, onClose, booking }) => {
  const [qrMaximized, setQrMaximized] = useState(false);
  if (!booking) return null;
  const isExpired = booking.expiresAt && new Date(booking.expiresAt).getTime() < Date.now();
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Ticket Details
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', boxShadow: 2, mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">STATION</Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>{booking.stationName}</Typography>
            <Box sx={{ borderTop: '1px dashed #ccc', my: 2 }} />
            <Typography>Booking Time: {new Date(booking.bookingTime).toLocaleString()}</Typography>
            <Typography>Duration: {booking.duration >= 60 ? `${booking.duration / 60} hr` : `${booking.duration} min`}</Typography>
            <Typography>Valid Till: {booking.endTime ? new Date(booking.endTime).toLocaleString() : (booking.expiresAt ? new Date(booking.expiresAt).toLocaleString() : '-')}</Typography>
            <Typography>Amount: ₹{booking.totalCost}</Typography>
            <Typography>Status: {isExpired ? 'Expired' : booking.status}</Typography>
            <Typography>Payment: {booking.paymentStatus}</Typography>
            <Typography sx={{ mt: 1, fontSize: 12, color: 'text.secondary' }}>Ticket ID: {booking.qrCode || booking.id}</Typography>
            <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
              {!isExpired ? (
                <Box sx={{ cursor: 'pointer' }} onClick={() => setQrMaximized(true)}>
                  <QRCodeCanvas value={booking.qrCode || booking.id} size={160} />
                  <Typography variant="caption" display="block" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
                    Tap to enlarge
                  </Typography>
                </Box>
              ) : (
                <Typography variant="h5" color="error" sx={{ fontWeight: 700 }}>EXPIRED</Typography>
              )}
            </Box>
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={onClose}>Close</Button>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Maximized QR Dialog */}
      <Dialog open={qrMaximized} onClose={() => setQrMaximized(false)} fullScreen PaperProps={{ sx: { bgcolor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } }}>
        <IconButton onClick={() => setQrMaximized(false)} sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
          <CloseIcon fontSize="large" />
        </IconButton>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
          <QRCodeCanvas value={booking.qrCode || booking.id} size={320} />
          <Typography variant="caption" sx={{ mt: 2, color: 'text.secondary' }}>Booking ID: {booking.qrCode || booking.id}</Typography>
        </Box>
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button variant="contained" onClick={() => setQrMaximized(false)} sx={{ minWidth: 120 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const UserBookings: FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
      setBookings(data);
      setLoading(false);
    }, (err) => {
      setError('Failed to load bookings');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <Container>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Please log in to view your bookings.</Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={48} color="primary" />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Loading bookings...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
          My Bookings
        </Typography>
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
              bookings.map((booking) => {
                const isExpired = (booking.expiresAt && new Date(booking.expiresAt).getTime() < Date.now()) || (booking.endTime && new Date(booking.endTime).getTime() < Date.now()) || booking.expired;
                const isVerified = booking.status === 'verified';
                return (
                  <Card key={booking.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">STATION</Typography>
                      <Typography variant="h6">{booking.stationName}</Typography>
                      <Typography sx={{ mt: 1 }}>Time: {new Date(booking.bookingTime).toLocaleString()}</Typography>
                      <Typography>Duration: {booking.duration >= 60 ? `${booking.duration / 60} hr` : `${booking.duration} min`}</Typography>
                      <Typography>Valid Till: {booking.endTime ? new Date(booking.endTime).toLocaleString() : (booking.expiresAt ? new Date(booking.expiresAt).toLocaleString() : '-')}</Typography>
                      <Typography>Amount: ₹{booking.totalCost}</Typography>
                      <Typography>Status: {
                        isVerified && isExpired ? (
                          <Chip label="Verified & Expired" color="success" size="small" />
                        ) : isExpired ? (
                          <Chip label="Expired" color="error" size="small" />
                        ) : (
                          <Chip label={booking.status} color={booking.status === 'confirmed' ? 'success' : 'default'} size="small" />
                        )
                      }</Typography>
                      <Typography>Payment: <Chip label={booking.paymentStatus} color={booking.paymentStatus === 'completed' ? 'success' : 'warning'} size="small" /></Typography>
                      <Button size="small" variant="outlined" sx={{ mt: 2 }} onClick={() => { setSelectedBooking(booking); setTicketModalOpen(true); }}>
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
            <BookingTicketModal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} booking={selectedBooking} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: '16px', background: 'rgba(255,255,255,0.9)', border: '1px solid #26C6DA22' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Station</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Valid Till</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>QR Code</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No bookings found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => {
                    const isExpired = (booking.expiresAt && new Date(booking.expiresAt).getTime() < Date.now()) || (booking.endTime && new Date(booking.endTime).getTime() < Date.now()) || booking.expired;
                    const isVerified = booking.status === 'verified';
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.stationName}</TableCell>
                        <TableCell>{new Date(booking.bookingTime).toLocaleString()}</TableCell>
                        <TableCell>{booking.duration >= 60 ? `${booking.duration / 60} hr` : `${booking.duration} min`}</TableCell>
                        <TableCell>{booking.endTime ? new Date(booking.endTime).toLocaleString() : (booking.expiresAt ? new Date(booking.expiresAt).toLocaleString() : '-')}</TableCell>
                        <TableCell>{booking.totalCost}</TableCell>
                        <TableCell>
                          {isVerified && isExpired ? (
                            <Chip label="Verified & Expired" color="success" size="small" />
                          ) : isExpired ? (
                            <Chip label="Expired" color="error" size="small" />
                          ) : (
                            <Chip label={booking.status} color={booking.status === 'confirmed' ? 'success' : 'default'} size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={booking.paymentStatus} color={booking.paymentStatus === 'completed' ? 'success' : 'warning'} size="small" />
                        </TableCell>
                        <TableCell>
                          <QRCodeCanvas value={booking.qrCode || booking.id} size={48} style={{ cursor: 'pointer' }} onClick={() => { setSelectedBooking(booking); setTicketModalOpen(true); }} />
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" onClick={() => { setSelectedBooking(booking); setTicketModalOpen(true); }}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <BookingTicketModal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} booking={selectedBooking} />
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default UserBookings; 