import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Backdrop,
  Paper,
  alpha
} from '@mui/material';
import { Database } from 'lucide-react';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  open, 
  message = 'Loading data...' 
}) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(4px)',
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.7),
      }}
      open={open}
    >
      <Paper
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          borderRadius: 2,
          background: (theme) => alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.divider, 0.1),
          boxShadow: (theme) => theme.shadows[20],
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{
              color: (theme) => theme.palette.primary.main,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Database size={24} style={{ opacity: 0.5 }} />
          </Box>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we fetch your data...
          </Typography>
        </Box>

        {/* Animated dots */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                animation: 'pulse 1.4s infinite ease-in-out both',
                animationDelay: `${index * 0.16}s`,
                '@keyframes pulse': {
                  '0%, 80%, 100%': {
                    transform: 'scale(0)',
                    opacity: 0.5,
                  },
                  '40%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>
      </Paper>
    </Backdrop>
  );
};