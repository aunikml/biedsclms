import { createTheme } from '@mui/material/styles';

export const getThemeOptions = (customPrimary?: string, customSecondary?: string): any => {
  const primaryMain = customPrimary || '#2563EB';
  const secondaryMain = customSecondary || '#F43F5E';

  return {
    palette: {
      mode: 'light',
      primary: {
        main: primaryMain,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: secondaryMain,
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#F8FAFC', // Slate 50
        paper: '#FFFFFF',
      },
    text: {
      primary: '#0F172A', // Slate 900
      secondary: '#64748B', // Slate 500
      disabled: '#94A3B8', // Slate 400
    },
    divider: '#E2E8F0', // Slate 200
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#047857',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#B91C1C',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#B45309',
    },
    info: {
      main: '#0EA5E9',
      light: '#38BDF8',
      dark: '#0369A1',
    },
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.015em',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      letterSpacing: 0,
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: 0,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#475569',
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      color: '#475569',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#334155',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      color: '#475569',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
      color: '#64748B',
    },
    overline: {
      fontWeight: 700,
      fontSize: '0.75rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.04)',
    '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.03)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.03)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -2px rgba(0, 0, 0, 0.03)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.05), 0px 10px 10px -5px rgba(0, 0, 0, 0.02)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.1)',
    // Fill the rest of MUI's 25 shadows with a standard elevation
    ...Array(18).fill('0px 25px 50px -12px rgba(0, 0, 0, 0.1)')
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html, body {
          background-color: #F8FAFC;
          color: #0F172A;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        ::selection {
          background-color: ${primaryMain};
          color: #FFFFFF;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #F1F5F9;
        }
        ::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontWeight: 600,
          '&:active': {
            transform: 'scale(0.98)',
          },
          '&:focus-visible': {
            outline: `2px solid ${primaryMain}`,
            outlineOffset: 2,
          },
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          backgroundColor: primaryMain,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: primaryMain,
            filter: 'brightness(0.9)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          borderColor: primaryMain,
          color: primaryMain,
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: `${primaryMain}10`, // 10% opacity hex
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: '#FFFFFF',
          '&:hover': {
            boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -2px rgba(0, 0, 0, 0.03)',
            borderColor: '#CBD5E1',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.03)',
        },
        elevation2: {
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.03)',
        },
        elevation3: {
          boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -2px rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: '#E2E8F0',
            },
            '&:hover fieldset': {
              borderColor: '#94A3B8',
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
              borderColor: primaryMain,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${primaryMain}20`,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8) !important',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: 'none',
          color: '#0F172A',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          boxShadow: '1px 0px 3px rgba(0, 0, 0, 0.02)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
        filled: {
          border: '1px solid transparent',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E2E8F0',
          padding: '16px 24px',
        },
        head: {
          fontWeight: 600,
          color: '#475569',
          backgroundColor: '#F8FAFC',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
  },
  };
};

const theme = createTheme(getThemeOptions());

export default theme;
