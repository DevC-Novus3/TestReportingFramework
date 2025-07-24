import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  PaletteMode, 
  IconButton, 
  Box, 
  Tooltip,
  Fade,
  useMediaQuery
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReportBuilder } from './components/ReportBuilder';

interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'light',
});

export const useColorMode = () => useContext(ColorModeContext);

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
  const [mode, setMode] = useState<PaletteMode>(
    savedMode || (prefersDarkMode ? 'dark' : 'light')
  );

  useEffect(() => {
    if (!savedMode) {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode, savedMode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: {
                  main: '#6366f1',
                  light: '#818cf8',
                  dark: '#4f46e5',
                },
                secondary: {
                  main: '#ec4899',
                  light: '#f472b6',
                  dark: '#db2777',
                },
                background: {
                  default: '#f8fafc',
                  paper: '#ffffff',
                },
                success: {
                  main: '#10b981',
                },
                error: {
                  main: '#ef4444',
                },
                info: {
                  main: '#3b82f6',
                },
                warning: {
                  main: '#f59e0b',
                },
              }
            : {
                primary: {
                  main: '#818cf8',
                  light: '#a5b4fc',
                  dark: '#6366f1',
                },
                secondary: {
                  main: '#f472b6',
                  light: '#f9a8d4',
                  dark: '#ec4899',
                },
                background: {
                  default: '#0f172a',
                  paper: '#1e293b',
                },
                success: {
                  main: '#34d399',
                },
                error: {
                  main: '#f87171',
                },
                info: {
                  main: '#60a5fa',
                },
                warning: {
                  main: '#fbbf24',
                },
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
          h5: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h6: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                boxShadow: mode === 'light' 
                  ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  : '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light'
                  ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  : '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
                '&:hover': {
                  boxShadow: mode === 'light'
                    ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                    : '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
                },
                transition: 'all 0.3s ease-in-out',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DndProvider backend={HTML5Backend}>
          <Box 
            sx={{ 
              position: 'relative', 
              minHeight: '100vh',
              bgcolor: 'background.default',
              overflow: 'hidden',
            }}
          >
            {/* Background Decoration */}
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              {/* Gradient Orbs */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '10%',
                  left: '5%',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: mode === 'light'
                    ? 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  right: '10%',
                  width: '400px',
                  height: '400px',
                  borderRadius: '50%',
                  background: mode === 'light'
                    ? 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: '5%',
                  width: '250px',
                  height: '250px',
                  borderRadius: '50%',
                  background: mode === 'light'
                    ? 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
            </Box>

            {/* Theme Toggle Button */}
            <Fade in={true}>
              <Tooltip 
                title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                placement="left"
              >
                <IconButton
                  sx={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 1200,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={colorMode.toggleColorMode}
                  color="inherit"
                  size="large"
                >
                  {mode === 'dark' ? (
                    <Brightness7Icon sx={{ color: 'warning.main' }} />
                  ) : (
                    <Brightness4Icon sx={{ color: 'primary.main' }} />
                  )}
                </IconButton>
              </Tooltip>
            </Fade>
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <ReportBuilder />
            </Box>
          </Box>
        </DndProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;