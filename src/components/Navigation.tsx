import { FC, useState, useRef, useCallback, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Tooltip,
  Avatar,
  Fade
} from '@mui/material';
import {
  Menu as MenuIcon,
  EvStation,
  AccountCircle,
  Dashboard,
  AdminPanelSettings,
  Login,
  PersonAdd,
  Logout,
  BookOnline,
  QrCodeScanner
} from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { keyframes } from '@mui/system';

// Define keyframe animations for logo and text if needed
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Navigation: FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      handleCloseMenu();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  const QRScanDialog = ({ open, onClose, onScanSuccess, onScanError }: { open: boolean, onClose: () => void, onScanSuccess: (data: string) => void, onScanError: (err: string) => void }) => {
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

  return (
    <AppBar 
      position="fixed" 
      sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.8))',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(38, 198, 218, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: '70px',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 }
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                '& .logo-icon': {
                  animation: `${pulseAnimation} 1s ease-in-out`
                }
              }
            }}
          >
            <EvStation 
              className="logo-icon"
              sx={{ 
                fontSize: '2.2rem',
                background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                transition: 'all 0.3s ease'
              }} 
            />
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
                backgroundSize: '200% 200%',
                animation: `${gradientShift} 5s ease infinite`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateX(3px)'
                }
              }}
            >
              EV Charging
            </Typography>
          </Box>

          {isMobile ? (
            <Box>
              <IconButton
                size="large"
                edge="end"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
                sx={{
                  background: 'linear-gradient(135deg, rgba(38, 198, 218, 0.1), rgba(33, 150, 243, 0.1))',
                  borderRadius: '12px',
                  p: 1,
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(38, 198, 218, 0.2), rgba(33, 150, 243, 0.2))',
                  }
                }}
              >
                <MenuIcon sx={{ color: theme.palette.primary.main }} />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
                TransitionComponent={Fade}
                PaperProps={{
                  sx: {
                    mt: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(38, 198, 218, 0.1)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    '& .MuiMenuItem-root': {
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(38, 198, 218, 0.1), rgba(33, 150, 243, 0.1))',
                      }
                    }
                  }
                }}
              >
                {user ? (
                  <>
                    {user.role !== 'admin' && (
                      <MenuItem 
                        key="dashboard"
                        component={RouterLink} 
                        to="/dashboard"
                        onClick={handleMobileMenuClose}
                        selected={isCurrentPath('/dashboard')}
                        sx={{
                          py: 1.5,
                          px: 2,
                          gap: 1.5,
                          borderLeft: isCurrentPath('/dashboard') ? 
                            '3px solid #26C6DA' : '3px solid transparent'
                        }}
                      >
                        <Dashboard sx={{ color: theme.palette.primary.main }} /> Dashboard
                      </MenuItem>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <MenuItem 
                          key="admin-dashboard"
                          component={RouterLink} 
                          to="/admin/dashboard"
                          onClick={handleMobileMenuClose}
                          selected={isCurrentPath('/admin/dashboard')}
                          sx={{
                            py: 1.5,
                            px: 2,
                            gap: 1.5,
                            borderLeft: isCurrentPath('/admin/dashboard') ? 
                              '3px solid #26C6DA' : '3px solid transparent'
                          }}
                        >
                          <Dashboard />
                          <Typography>Admin Dashboard</Typography>
                        </MenuItem>
                        <MenuItem 
                          key="admin-stations"
                          component={RouterLink} 
                          to="/admin/stations"
                          onClick={handleMobileMenuClose}
                          selected={isCurrentPath('/admin/stations')}
                          sx={{
                            py: 1.5,
                            px: 2,
                            gap: 1.5,
                            borderLeft: isCurrentPath('/admin/stations') ? 
                              '3px solid #26C6DA' : '3px solid transparent'
                          }}
                        >
                          <EvStation />
                          <Typography>Manage Stations</Typography>
                        </MenuItem>
                        <MenuItem 
                          key="admin-bookings"
                          component={RouterLink} 
                          to="/admin/bookings"
                          onClick={handleMobileMenuClose}
                          selected={isCurrentPath('/admin/bookings')}
                          sx={{
                            py: 1.5,
                            px: 2,
                            gap: 1.5,
                            borderLeft: isCurrentPath('/admin/bookings') ? 
                              '3px solid #26C6DA' : '3px solid transparent'
                          }}
                        >
                          <BookOnline />
                          <Typography>Bookings</Typography>
                        </MenuItem>
                      </>
                    )}
                    {user.role !== 'admin' && (
                      <MenuItem 
                        key="bookings"
                        component={RouterLink} 
                        to="/bookings"
                        onClick={handleMobileMenuClose}
                        selected={isCurrentPath('/bookings')}
                        sx={{
                          py: 1.5,
                          px: 2,
                          gap: 1.5,
                          borderLeft: isCurrentPath('/bookings') ? 
                            '3px solid #26C6DA' : '3px solid transparent'
                        }}
                      >
                        <BookOnline />
                        <Typography>Bookings</Typography>
                      </MenuItem>
                    )}
                    <MenuItem
                      key="profile"
                      component={RouterLink}
                      to={user.role === 'admin' ? '/admin/profile' : '/profile'}
                      onClick={handleMobileMenuClose}
                      selected={isCurrentPath(user.role === 'admin' ? '/admin/profile' : '/profile')}
                      sx={{
                        py: 1.5,
                        px: 2,
                        gap: 1.5,
                        borderLeft: isCurrentPath(user.role === 'admin' ? '/admin/profile' : '/profile') ? 
                          '3px solid #26C6DA' : '3px solid transparent'
                      }}
                    >
                      <AccountCircle />
                      <Typography>Profile</Typography>
                    </MenuItem>
                    <MenuItem 
                      key="logout" 
                      onClick={handleLogout}
                      sx={{
                        py: 1.5,
                        px: 2,
                        gap: 1.5,
                        color: theme.palette.error.main,
                        '&:hover': {
                          background: 'rgba(211, 47, 47, 0.1)',
                        }
                      }}
                    >
                      <Logout /> Logout
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem 
                      key="login"
                      component={RouterLink} 
                      to="/login"
                      onClick={handleMobileMenuClose}
                      sx={{
                        py: 1.5,
                        px: 2,
                        gap: 1.5,
                        borderLeft: isCurrentPath('/login') ? 
                          '3px solid #26C6DA' : '3px solid transparent'
                      }}
                    >
                      <Login sx={{ color: theme.palette.primary.main }} /> Login
                    </MenuItem>
                    <MenuItem 
                      key="register"
                      component={RouterLink} 
                      to="/register"
                      onClick={handleMobileMenuClose}
                      sx={{
                        py: 1.5,
                        px: 2,
                        gap: 1.5,
                        borderLeft: isCurrentPath('/register') ? 
                          '3px solid #26C6DA' : '3px solid transparent'
                      }}
                    >
                      <PersonAdd sx={{ color: theme.palette.primary.main }} /> Register
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                '& .MuiButton-root': {
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
                    transform: 'scaleX(0)',
                    transition: 'transform 0.3s ease',
                    transformOrigin: 'right'
                  },
                  '&:hover::after': {
                    transform: 'scaleX(1)',
                    transformOrigin: 'left'
                  }
                }
              }}
            >
              {user ? (
                <>
                  {user.role !== 'admin' && (
                    <>
                      <Button
                        color="primary"
                        component={RouterLink}
                        to="/dashboard"
                        startIcon={<Dashboard />}
                        variant={isCurrentPath('/dashboard') ? 'contained' : 'text'}
                        sx={{
                          borderRadius: '12px',
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          background: isCurrentPath('/dashboard') ? 
                            'linear-gradient(135deg, #26C6DA, #2196F3)' : 'transparent',
                          '&:hover': {
                            background: isCurrentPath('/dashboard') ? 
                              'linear-gradient(135deg, #4DD0E1, #64B5F6)' : 'rgba(38, 198, 218, 0.1)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Dashboard
                      </Button>
                      <Button
                        color="primary"
                        component={RouterLink}
                        to="/bookings"
                        startIcon={<BookOnline />}
                        variant={isCurrentPath('/bookings') ? 'contained' : 'text'}
                        sx={{
                          borderRadius: '12px',
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          background: isCurrentPath('/bookings') ? 
                            'linear-gradient(135deg, #26C6DA, #2196F3)' : 'transparent',
                          '&:hover': {
                            background: isCurrentPath('/bookings') ? 
                              'linear-gradient(135deg, #4DD0E1, #64B5F6)' : 'rgba(38, 198, 218, 0.1)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Bookings
                      </Button>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <Button
                        color="primary"
                        component={RouterLink}
                        to="/admin/dashboard"
                        startIcon={<Dashboard />}
                        variant={isCurrentPath('/admin/dashboard') ? 'contained' : 'text'}
                        sx={{
                          borderRadius: '12px',
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          background: isCurrentPath('/admin/dashboard') ? 
                            'linear-gradient(135deg, #26C6DA, #2196F3)' : 'transparent',
                          '&:hover': {
                            background: isCurrentPath('/admin/dashboard') ? 
                              'linear-gradient(135deg, #4DD0E1, #64B5F6)' : 'rgba(38, 198, 218, 0.1)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Admin Dashboard
                      </Button>
                      <Button
                        color="primary"
                        component={RouterLink}
                        to="/admin/stations"
                        startIcon={<AdminPanelSettings />}
                        variant={isCurrentPath('/admin/stations') ? 'contained' : 'text'}
                        sx={{
                          borderRadius: '12px',
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          background: isCurrentPath('/admin/stations') ? 
                            'linear-gradient(135deg, #26C6DA, #2196F3)' : 'transparent',
                          '&:hover': {
                            background: isCurrentPath('/admin/stations') ? 
                              'linear-gradient(135deg, #4DD0E1, #64B5F6)' : 'rgba(38, 198, 218, 0.1)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Manage Stations
                      </Button>
                      <Button
                        color="primary"
                        component={RouterLink}
                        to="/admin/bookings"
                        startIcon={<BookOnline />}
                        variant={isCurrentPath('/admin/bookings') ? 'contained' : 'text'}
                        sx={{
                          borderRadius: '12px',
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          background: isCurrentPath('/admin/bookings') ? 
                            'linear-gradient(135deg, #26C6DA, #2196F3)' : 'transparent',
                          '&:hover': {
                            background: isCurrentPath('/admin/bookings') ? 
                              'linear-gradient(135deg, #4DD0E1, #64B5F6)' : 'rgba(38, 198, 218, 0.1)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Bookings
                      </Button>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <Button
                        color="primary"
                        startIcon={<QrCodeScanner />}
                        variant="outlined"
                        sx={{ borderRadius: '12px', px: 2, py: 1, fontWeight: 600 }}
                        onClick={() => setScanDialogOpen(true)}
                      >
                        Scan QR
                      </Button>
                      <QRScanDialog
                        open={scanDialogOpen}
                        onClose={() => setScanDialogOpen(false)}
                        onScanSuccess={(data: string) => {
                          setScanDialogOpen(false);
                        }}
                        onScanError={(err: string) => {
                          console.error('QR scan error:', err);
                        }}
                      />
                    </>
                  )}
                  <Tooltip title="Account settings">
                    <IconButton 
                      onClick={handleOpenMenu} 
                      size="small"
                      sx={{
                        ml: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 40,
                          height: 40,
                          background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
                          border: '2px solid transparent',
                          borderImage: 'linear-gradient(135deg, #26C6DA, #2196F3) 1',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <AccountCircle />
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    TransitionComponent={Fade}
                    PaperProps={{
                      sx: {
                        mt: 2,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(38, 198, 218, 0.1)',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        '& .MuiMenuItem-root': {
                          py: 1.5,
                          px: 2,
                          gap: 1.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'rgba(211, 47, 47, 0.1)',
                            color: theme.palette.error.main
                          }
                        }
                      }
                    }}
                  >
                    {user && (
                      <MenuItem
                        component={RouterLink}
                        to={user.role === 'admin' ? '/admin/profile' : '/profile'}
                        onClick={handleCloseMenu}
                      >
                        <AccountCircle /> Profile
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>
                      <Logout /> Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    color="primary"
                    component={RouterLink}
                    to="/login"
                    startIcon={<Login />}
                    variant={isCurrentPath('/login') ? 'contained' : 'text'}
                    sx={{
                      borderRadius: '12px',
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      background: isCurrentPath('/login') ? 
                        'linear-gradient(135deg, #26C6DA, #2196F3)' : 'transparent',
                      '&:hover': {
                        background: isCurrentPath('/login') ? 
                          'linear-gradient(135deg, #4DD0E1, #64B5F6)' : 'rgba(38, 198, 218, 0.1)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    color="primary"
                    component={RouterLink}
                    to="/register"
                    startIcon={<PersonAdd />}
                    variant={isCurrentPath('/register') ? 'contained' : 'text'}
                    sx={{
                      borderRadius: '12px',
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      background: isCurrentPath('/register') ? 
                        'linear-gradient(135deg, #26C6DA, #2196F3)' : 'transparent',
                      '&:hover': {
                        background: isCurrentPath('/register') ? 
                          'linear-gradient(135deg, #4DD0E1, #64B5F6)' : 'rgba(38, 198, 218, 0.1)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation; 