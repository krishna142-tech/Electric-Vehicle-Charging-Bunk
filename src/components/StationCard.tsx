import { FC } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  keyframes,
  styled
} from '@mui/material';
import { EvStation, AccessTime, Speed } from '@mui/icons-material';

interface StationCardProps {
  name: string;
  location: string;
  rate: string;
  hours: string;
  slots: string;
  status: 'operational' | 'maintenance' | 'offline';
  onBook: () => void;
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  borderRadius: '20px',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(38, 198, 218, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '200%',
    height: '100%',
    background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transform: 'skewX(-15deg)',
    transition: 'all 0.75s ease-in-out',
  },
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(38, 198, 218, 0.15)',
    '&::before': {
      animation: `${shimmer} 1.5s infinite`,
    },
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  borderRadius: '8px',
  fontWeight: 600,
  textTransform: 'capitalize',
  padding: '0 12px',
  height: '28px',
  ...(status === 'operational' && {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    color: theme.palette.success.main,
  }),
  ...(status === 'maintenance' && {
    backgroundColor: 'rgba(237, 108, 2, 0.1)',
    color: theme.palette.warning.main,
  }),
  ...(status === 'offline' && {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    color: theme.palette.error.main,
  }),
}));

const BookButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
  color: '#fff',
  transition: 'all 0.3s ease',
  marginTop: 'auto',
  '&:hover': {
    background: 'linear-gradient(135deg, #4DD0E1, #64B5F6)',
    transform: 'scale(1.02)',
  },
  '&:disabled': {
    background: 'rgba(0, 0, 0, 0.12)',
    color: 'rgba(0, 0, 0, 0.26)',
  },
}));

const StationCard: FC<StationCardProps> = ({
  name,
  location,
  rate,
  hours,
  slots,
  status,
  onBook
}) => {
  return (
    <StyledCard>
      <CardContent sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
        }}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #26C6DA, #2196F3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}>
              {name}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {location}
            </Typography>
          </Box>
          <StatusChip
            label={status}
            status={status}
            size="small"
          />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          flex: 1
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(38, 198, 218, 0.05)',
          }}>
            <Speed sx={{ color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Rate: {rate}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(38, 198, 218, 0.05)',
          }}>
            <AccessTime sx={{ color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Hours: {hours}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(38, 198, 218, 0.05)',
          }}>
            <EvStation sx={{ color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Available Slots: {slots}
            </Typography>
          </Box>
        </Box>

        <BookButton
          variant="contained"
          onClick={onBook}
          disabled={status !== 'operational'}
        >
          Book Now
        </BookButton>
      </CardContent>
    </StyledCard>
  );
};

export default StationCard; 