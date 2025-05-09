import { FC, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  EvStation as StationIcon,
  BookOnline as BookingIcon,
  BatteryChargingFull as ChargingIcon,
  Warning as WarningIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  totalStations: number;
  activeBookings: number;
  availableSlots: number;
  maintenanceStations: number;
}

const AdminDashboard: FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStations: 0,
    activeBookings: 0,
    availableSlots: 0,
    maintenanceStations: 0
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    // Listen to stations in real-time
    const stationsRef = collection(db, 'stations');
    const adminStationsQuery = query(stationsRef, where('createdBy', '==', user.uid));
    const unsubscribeStations = onSnapshot(adminStationsQuery, (stationsSnapshot) => {
      const stations = stationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      const stationIds = stationsSnapshot.docs.map(doc => doc.id);
      // Listen to bookings in real-time
      if (stationIds.length === 0) {
        setStats({
          totalStations: 0,
          activeBookings: 0,
          availableSlots: 0,
          maintenanceStations: 0
        });
        setLoading(false);
        return;
      }
      const bookingsRef = collection(db, 'bookings');
      const activeBookingsQuery = query(
        bookingsRef,
        where('status', 'in', ['confirmed', 'verified']),
        where('stationId', 'in', stationIds)
      );
      const unsubscribeBookings = onSnapshot(activeBookingsQuery, (activeBookingsSnapshot) => {
        const totalStations = stations.length;
        const availableSlots = stations.reduce((acc, station) => acc + (station.availableSlots || 0), 0);
        const maintenanceStations = stations.filter(station => station.status === 'maintenance').length;
        setStats({
          totalStations,
          activeBookings: activeBookingsSnapshot.size,
          availableSlots,
          maintenanceStations
        });
        setLoading(false);
      });
      // Clean up bookings listener when stations change
      return () => unsubscribeBookings();
    });
    // Clean up stations listener on unmount
    return () => unsubscribeStations();
  }, [user]);

  const StatCard: FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }> = ({ title, value, icon, color, onClick }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: '50%',
              p: 1,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
      {onClick && (
        <CardActions>
          <Button size="small" color="primary">
            View Details
          </Button>
        </CardActions>
      )}
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Overview of your charging station network
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Stations"
            value={stats.totalStations}
            icon={<StationIcon sx={{ color: theme.palette.primary.main }} />}
            color={theme.palette.primary.main}
            onClick={() => navigate('/admin/stations')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={<BookingIcon sx={{ color: theme.palette.success.main }} />}
            color={theme.palette.success.main}
            onClick={() => navigate('/admin/bookings')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Slots"
            value={stats.availableSlots}
            icon={<ChargingIcon sx={{ color: theme.palette.info.main }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Maintenance Required"
            value={stats.maintenanceStations}
            icon={<WarningIcon sx={{ color: theme.palette.warning.main }} />}
            color={theme.palette.warning.main}
            onClick={() => navigate('/admin/stations')}
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<StationIcon />}
                onClick={() => navigate('/admin/stations')}
              >
                Manage Stations
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<BookingIcon />}
                onClick={() => navigate('/admin/bookings')}
              >
                View Bookings
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="info"
                startIcon={<MapIcon />}
                onClick={() => navigate('/admin/stations-map')}
              >
                Stations Map
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 