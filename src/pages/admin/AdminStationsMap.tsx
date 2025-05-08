import { FC, useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Container, Paper } from '@mui/material';
import Map from '../../components/Map';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Station as StationType } from '../../types';

interface Station extends StationType {
  createdBy: string;
}

const AdminStationsMap: FC = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      if (!user) return;
      const stationsRef = collection(db, 'stations');
      const q = query(stationsRef, where('createdBy', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const stationData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Station));
      setStations(stationData);
      setLoading(false);
    };
    fetchStations();
  }, [user]);

  if (!user) {
    return (
      <Container sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">Please log in as admin to view your stations map.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
        My Stations Map
      </Typography>
      <Paper sx={{ p: 2, borderRadius: 4, minHeight: 500 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: { xs: 400, md: 600 }, width: '100%' }}>
            <Map stations={stations} />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminStationsMap; 