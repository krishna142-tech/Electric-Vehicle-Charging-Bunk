import { FC, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  TextField,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import MuiAlert from '@mui/material/Alert';

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(38, 198, 218, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid #fff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, #00A3E0, #34C759)',
}));

const AdminProfile: FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});

  const adminData = {
    name: user?.name || 'Not set',
    email: user?.email || 'Not set',
    phone: user?.phone || 'Not set',
    role: user?.role || 'Not set',
    status: user?.status || 'Not set',
    joinDate: (() => {
      if (user?.createdAt && typeof user.createdAt === 'object' && 'seconds' in user.createdAt) {
        return new Date(user.createdAt.seconds * 1000).toLocaleString('default', { month: 'long', year: 'numeric' });
      }
      return 'Not set';
    })(),
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: form.name });
      }
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        updatedAt: new Date(),
      });
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      setIsEditing(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <ProfileCard>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <StyledAvatar sx={{ mx: 'auto', mb: 2 }}>
                <AdminPanelSettingsIcon fontSize="large" />
              </StyledAvatar>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                {adminData.name}
              </Typography>
              <Chip
                label="Admin"
                sx={{
                  background: 'linear-gradient(135deg, #00A3E0, #34C759)',
                  color: '#fff',
                  fontWeight: 500,
                }}
              />
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={adminData.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText primary="Phone" secondary={adminData.phone} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText primary="Admin Since" secondary={adminData.joinDate} />
              </ListItem>
            </List>
          </ProfileCard>
        </Grid>

        {/* Admin Stats & Settings */}
        <Grid item xs={12} md={8}>
          <ProfileCard>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Admin Details
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <DashboardIcon sx={{ color: '#00A3E0' }} />
                </ListItemIcon>
                <ListItemText primary="Role" secondary={adminData.role} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SettingsIcon sx={{ color: '#2196F3' }} />
                </ListItemIcon>
                <ListItemText primary="Status" secondary={adminData.status} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText primary="Admin Since" secondary={adminData.joinDate} />
              </ListItem>
            </List>
            <Divider sx={{ my: 4 }} />
            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 600 }}
              startIcon={<SettingsIcon />}
              onClick={() => setIsEditing(!isEditing)}
            >
              Edit Profile
            </Button>
            {isEditing && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Edit Profile
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(135deg, #00A3E0, #34C759)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #33B5E6, #5CD679)',
                        },
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
              <MuiAlert elevation={6} variant="filled" onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity}>
                {snackbar.message}
              </MuiAlert>
            </Snackbar>
          </ProfileCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminProfile; 