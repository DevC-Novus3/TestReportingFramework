import React from 'react';
import { Box, Typography, Paper, useTheme, alpha } from '@mui/material';
import { 
  BarChart3, 
  FileSpreadsheet, 
  TrendingUp, 
  Database,
  Sparkles,
  Layers
} from 'lucide-react';

export const SidePanel: React.FC = () => {
  const theme = useTheme();

  const stats = [
    { label: 'Reports Generated', value: '1,234', icon: FileSpreadsheet, color: theme.palette.primary.main },
    { label: 'Data Sources', value: '8', icon: Database, color: theme.palette.secondary.main },
    { label: 'Active Filters', value: '3', icon: Layers, color: theme.palette.info.main },
    { label: 'Charts Created', value: '456', icon: BarChart3, color: theme.palette.success.main },
  ];

  return (
    <Box sx={{ height: '100%', p: 3 }}>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Sparkles size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" sx={{ ml: 1 }}>
              Welcome Back!
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Create beautiful reports with drag-and-drop simplicity. Your data, your way.
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: alpha(theme.palette.primary.main, 0.1),
            filter: 'blur(30px)',
          }}
        />
      </Paper>

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Paper
              key={index}
              sx={{
                p: 2.5,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {stat.label}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(stat.color, 0.1),
                  }}
                >
                  <Icon size={24} color={stat.color} />
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Tips Section */}
      <Paper
        sx={{
          p: 3,
          background: alpha(theme.palette.info.main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette.info.main, 0.2),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUp size={20} color={theme.palette.info.main} />
          <Typography variant="subtitle2" fontWeight="bold" sx={{ ml: 1 }}>
            Pro Tip
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Hold Ctrl/Cmd while clicking to select multiple fields at once, or use the checkboxes for batch selection.
        </Typography>
      </Paper>

      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: 200,
          background: `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          borderRadius: '50% 50% 0 0',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};