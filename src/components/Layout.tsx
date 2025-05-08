import { FC, ReactNode } from 'react';
import { Box } from '@mui/material';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'background.default',
      }}
    >
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          paddingTop: { xs: '80px', sm: '90px', md: '100px' },
          position: 'relative',
          zIndex: 1,
          '& > *': {
            position: 'relative',
            zIndex: 2
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 