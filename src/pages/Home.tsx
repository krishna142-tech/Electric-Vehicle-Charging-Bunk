import { FC } from 'react';
import { Box, Container, Typography, Grid, Paper, useTheme, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import { useNavigate } from 'react-router-dom';

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, rgba(0, 163, 224, 0.1), rgba(52, 199, 89, 0.1))',
  borderRadius: '16px 16px 0 0',
}));

const SocialLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateY(-2px)',
  },
}));

const Home: FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const features = [
    {
      icon: <AccessTimeIcon />,
      title: 'Smart Time Management',
      description: 'Our intelligent system automatically tracks and saves your charging time. Get real-time updates and notifications about your charging session.',
    },
    {
      icon: <LocationOnIcon />,
      title: 'Station Locator',
      description: 'Find the nearest charging stations with real-time availability. Get detailed information about rates, amenities, and current status.',
    },
    {
      icon: <SecurityIcon />,
      title: 'Secure Booking',
      description: 'Book your charging slot in advance with our secure reservation system. Your spot is guaranteed when you arrive.',
    },
    {
      icon: <SpeedIcon />,
      title: 'Fast Charging',
      description: 'Access high-speed charging stations across the city. Our network supports all major EV models and charging standards.',
    },
    {
      icon: <PaymentIcon />,
      title: 'Easy Payments',
      description: 'Multiple payment options including digital wallets, UPI, and credit cards. Get detailed billing and usage history.',
    },
    {
      icon: <SupportAgentIcon />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for any assistance. Get help with booking, payments, or technical issues.',
    },
  ];

  const featureImages: Record<string, string> = {
    'Smart Time Management': '/smarttimemanagement.png',
    'Station Locator': '/smart.png',
    'Secure Booking': '/securebooking.png',
    'Fast Charging': '/FastCharging.png',
    'Easy Payments': '/EasyPayments.png',
    '24/7 Support': '/24support.png',
  };

  return (
    <Box sx={{ py: 8 }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mb: 8, position: 'relative' }}>
        <Box
          sx={{
            textAlign: 'center',
            mb: 6,
            background: 'linear-gradient(135deg, rgba(0, 163, 224, 0.1), rgba(52, 199, 89, 0.1))',
            borderRadius: 4,
            p: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src="/electric-vehicle-charging.jpeg"
            alt="Electric Vehicle Charging"
            style={{
              position: 'absolute',
              right: 40,
              top: 0,
              width: 320,
              maxWidth: '40vw',
              opacity: 0.18,
              zIndex: 0,
              pointerEvents: 'none',
              display: 'none',
            }}
            className="hero-bg-img"
          />
          <Typography
            variant="h1"
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, #00A3E0, #34C759)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Electric Vehicle Charging Made Simple
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', position: 'relative', zIndex: 1, mb: 4 }}>
            Find, book, and charge your electric vehicle with ease. Our smart platform helps you manage your charging time efficiently.
          </Typography>
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box
              component="button"
              onClick={handleGetStarted}
              sx={{
                mt: 2,
                px: 5,
                py: 1.5,
                fontSize: 22,
                fontWeight: 700,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #00A3E0, #34C759)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 24px rgba(0,163,224,0.10)',
                cursor: 'pointer',
                transition: 'background 0.3s',
                '&:hover': {
                  background: 'linear-gradient(135deg, #34C759, #00A3E0)',
                },
              }}
            >
              Get Started
            </Box>
          </Box>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard>
                <Box sx={{ mb: 2 }}>
                  <img
                    src={featureImages[feature.title]}
                    alt={feature.title}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
                  />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            mb: 6,
            background: 'linear-gradient(135deg, #00A3E0, #34C759)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          How It Works
        </Typography>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 4,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                1. Find a Station
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Use our interactive map to locate the nearest charging station. View real-time availability and rates.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                2. Book Your Slot
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Reserve your charging slot in advance. Our system ensures your spot is available when you arrive.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                3. Charge & Go
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Connect your vehicle and start charging. Our system automatically tracks your session and handles payments.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 4,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 320,
              }}
            >
              <img
                src="/smarttimemanagement.png"
                alt="Smart Time Management"
                style={{ width: '80%', maxWidth: 320, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Footer Section */}
      <Footer>
        <Container maxWidth="sm">
          <Grid container spacing={3} direction="column">
            <Grid item>
              <SocialLink href="mailto:krishna.8.sevak@gmail.com" target="_blank" rel="noopener noreferrer">
                <EmailIcon sx={{ fontSize: 28, color: '#34C759' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>Email</Typography>
                  <Typography variant="body2" color="text.secondary">krishna.8.sevak@gmail.com</Typography>
                </Box>
              </SocialLink>
            </Grid>
            <Grid item>
              <SocialLink href="https://www.linkedin.com/in/krishna-sevak" target="_blank" rel="noopener noreferrer">
                <LinkedInIcon sx={{ fontSize: 28, color: '#0077b5' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>LinkedIn</Typography>
                  <Typography variant="body2" color="text.secondary">linkedin.com/in/krishna-sevak</Typography>
                </Box>
              </SocialLink>
            </Grid>
            <Grid item>
              <SocialLink href="https://github.com/krishna142-tech" target="_blank" rel="noopener noreferrer">
                <GitHubIcon sx={{ fontSize: 28, color: '#2ea44f' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>GitHub</Typography>
                  <Typography variant="body2" color="text.secondary">github.com/krishna142-tech</Typography>
                </Box>
              </SocialLink>
            </Grid>
            <Grid item textAlign="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Electric Vehicle Charging Bunk. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Footer>
    </Box>
  );
};

export default Home; 