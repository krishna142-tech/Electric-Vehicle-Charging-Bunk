import { FC } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Box, Fab } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useTheme, useMediaQuery } from '@mui/material';

interface MobileBottomNavProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  onAddBooking: () => void;
}

const MobileBottomNav: FC<MobileBottomNavProps> = ({ value, onChange, onAddBooking }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  if (!isMobile) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1301,
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -2px 24px rgba(0,0,0,0.08)',
        bgcolor: '#F8F6F3',
        px: 2,
        pb: 1,
        pt: 0.5,
      }}
      elevation={3}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <BottomNavigation
          showLabels={false}
          value={value}
          onChange={onChange}
          sx={{
            width: '100%',
            bgcolor: 'transparent',
            boxShadow: 'none',
            justifyContent: 'space-between',
          }}
        >
          <BottomNavigationAction icon={<HomeIcon />} />
          <BottomNavigationAction icon={<ChatBubbleOutlineIcon />} />
          <Box sx={{ width: 56 }} /> {/* Spacer for center FAB */}
          <BottomNavigationAction icon={<BarChartIcon />} />
          <BottomNavigationAction icon={<PersonOutlineIcon />} />
        </BottomNavigation>
        <Fab
          color="default"
          aria-label="add"
          onClick={onAddBooking}
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            top: 0,
            zIndex: 2,
            width: 56,
            height: 56,
            bgcolor: '#232323',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            border: '4px solid #F8F6F3',
            '&:hover': {
              bgcolor: '#333',
            },
          }}
        >
          <AddIcon fontSize="large" />
        </Fab>
      </Box>
    </Paper>
  );
};

export default MobileBottomNav; 