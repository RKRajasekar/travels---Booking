import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#DC2626', // Vibrant Red / Crimson
      light: '#EF4444',
      dark: '#991B1B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#059669', // Premium Emerald Green
      light: '#10B981',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    maroon: {
      main: '#4A0E17',
      light: '#781D2D',
      dark: '#2A050C',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981', // Emerald 500
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Amber 500
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#E11D48', // Rose / Red
      light: '#F43F5E',
      dark: '#BE123C',
    },
    background: {
      default: '#F8FAFC', // Slate 50 background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569', // Slate 600
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 800,
      fontSize: '2rem',
      letterSpacing: '-0.021em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: '"Outfit", "Inter", sans-serif',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          boxShadow: 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '14px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
          '@media (min-width: 900px)': {
            paddingLeft: '36px',
            paddingRight: '36px',
          },
          '@media (min-width: 1200px)': {
            paddingLeft: '48px',
            paddingRight: '48px',
          },
          '@media (min-width: 1536px)': {
            paddingLeft: '64px',
            paddingRight: '64px',
          },
        },
        maxWidthLg: {
          '@media (min-width: 1200px)': {
            maxWidth: '100% !important',
          },
        },
        maxWidthXl: {
          '@media (min-width: 1200px)': {
            maxWidth: '100% !important',
          },
        },
      },
    },
  },
});

