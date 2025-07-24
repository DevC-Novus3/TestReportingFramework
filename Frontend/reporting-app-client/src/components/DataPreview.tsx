import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Tab,
  Tabs,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartConfiguration } from '../types';

interface DataPreviewProps {
  data: Record<string, any>[];
  selectedFields: string[];
  charts: ChartConfiguration[];
  outputType: 'table' | 'chart';
  reportTitle: string;
  onClose: () => void;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  selectedFields,
  charts,
  outputType,
  reportTitle,
  onClose,
}) => {
  const [currentTab, setCurrentTab] = React.useState(0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderTable = () => {
    // Show only first 50 rows for preview
    const previewData = data.slice(0, 50);
    
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {selectedFields.map((field) => (
                <TableCell key={field} sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  {field}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.map((row, index) => (
              <TableRow key={index} hover>
                {selectedFields.map((field) => (
                  <TableCell key={field}>
                    {row[field]?.toString() || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length > 50 && (
          <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
              Showing first 50 of {data.length} records
            </Typography>
          </Box>
        )}
      </TableContainer>
    );
  };

  const renderChart = (chart: ChartConfiguration, index: number) => {
    const chartData = data.slice(0, 100); // Limit data for performance

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={chart.yAxis} fill={COLORS[index % COLORS.length]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={chart.yAxis} 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const pieData = chartData.reduce((acc: any[], item) => {
          const existingItem = acc.find(d => d.name === item[chart.xAxis]);
          if (existingItem) {
            existingItem.value += parseFloat(item[chart.yAxis] || 0);
          } else {
            acc.push({
              name: item[chart.xAxis],
              value: parseFloat(item[chart.yAxis] || 0),
            });
          }
          return acc;
        }, []);

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle>
        <Typography variant="h6">{reportTitle} - Preview</Typography>
      </DialogTitle>
      
      <DialogContent>
        {outputType === 'table' ? (
          renderTable()
        ) : charts.length > 0 ? (
          <>
            {charts.length > 1 && (
              <Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)} sx={{ mb: 2 }}>
                {charts.map((chart, index) => (
                  <Tab key={index} label={chart.title} />
                ))}
              </Tabs>
            )}
            <Box sx={{ p: 2 }}>
              {charts[currentTab] && (
                <>
                  <Typography variant="h6" gutterBottom align="center">
                    {charts[currentTab].title}
                  </Typography>
                  {renderChart(charts[currentTab], currentTab)}
                </>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No charts configured. Please add charts using the Chart Builder.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};