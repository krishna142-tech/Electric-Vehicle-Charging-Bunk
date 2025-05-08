import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    energy: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
  interface PaletteOptions {
    energy: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#00A3E0', // Tesla blue
      light: '#33B5E6',
      dark: '#0072A3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#34C759', // Modern green
      light: '#5CD679',
      dark: '#2A9D47',
      contrastText: '#FFFFFF',
    },
    energy: {
      main: '#00A3E0',
      light: '#33B5E6',
      dark: '#0072A3',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#34C759',
      light: '#5CD679',
      dark: '#2A9D47',
    },
    warning: {
      main: '#FF9500',
      light: '#FFAA33',
      dark: '#CC7700',
    },
    error: {
      main: '#FF3B30',
      light: '#FF6259',
      dark: '#CC2F26',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F7',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #00A3E0, #34C759)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#1D1D1F',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#86868B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 32px',
          fontSize: '0.9375rem',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 12px rgba(0, 163, 224, 0.2)',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(135deg, #00A3E0, #34C759)',
            '&:hover': {
              background: 'linear-gradient(135deg, #33B5E6, #5CD679)',
            },
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(0, 163, 224, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(52, 199, 89, 0.1)',
            color: '#34C759',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(255, 149, 0, 0.1)',
            color: '#FF9500',
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            color: '#FF3B30',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00A3E0',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00A3E0',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0px 12px 48px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          color: '#1D1D1F',
          boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 163, 224, 0.08)',
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(0, 163, 224, 0.04)',
          color: '#1D1D1F',
        },
      },
    },
  },
});

export default theme; 