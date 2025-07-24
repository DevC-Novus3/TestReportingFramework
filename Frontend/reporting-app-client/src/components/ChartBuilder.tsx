import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { ChartConfiguration } from '../types';

interface ChartBuilderProps {
  availableFields: string[];
  onAddChart: (chart: ChartConfiguration) => void;
}

export const ChartBuilder: React.FC<ChartBuilderProps> = ({
  availableFields,
  onAddChart,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartTitle, setChartTitle] = useState('');

  const handleAddChart = () => {
    if (xAxis && yAxis && chartTitle) {
      onAddChart({
        type: chartType,
        xAxis,
        yAxis,
        title: chartTitle,
      });
      // Reset form
      setChartTitle('');
      setXAxis('');
      setYAxis('');
    }
  };

  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Add Chart (Excel Only)
      </Typography>

      <FormControl fullWidth sx={{ mb: 1 }} size="small">
        <InputLabel>Chart Type</InputLabel>
        <Select
          value={chartType}
          onChange={(e: SelectChangeEvent) => setChartType(e.target.value as any)}
          label="Chart Type"
        >
          <MenuItem value="bar">Bar Chart</MenuItem>
          <MenuItem value="line">Line Chart</MenuItem>
          <MenuItem value="pie">Pie Chart</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Chart Title"
        value={chartTitle}
        onChange={(e) => setChartTitle(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 1 }}
      />

      <FormControl fullWidth sx={{ mb: 1 }} size="small">
        <InputLabel>X Axis Field</InputLabel>
        <Select
          value={xAxis}
          onChange={(e: SelectChangeEvent) => setXAxis(e.target.value)}
          label="X Axis Field"
        >
          <MenuItem value="">None</MenuItem>
          {availableFields.map(field => (
            <MenuItem key={field} value={field}>{field}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 1 }} size="small">
        <InputLabel>Y Axis Field</InputLabel>
        <Select
          value={yAxis}
          onChange={(e: SelectChangeEvent) => setYAxis(e.target.value)}
          label="Y Axis Field"
        >
          <MenuItem value="">None</MenuItem>
          {availableFields.map(field => (
            <MenuItem key={field} value={field}>{field}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        onClick={handleAddChart}
        disabled={!xAxis || !yAxis || !chartTitle}
        size="small"
      >
        Add Chart
      </Button>
    </Box>
  );
};