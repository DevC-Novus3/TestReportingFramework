import React, { useState, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  IconButton,
  Chip,
  SelectChangeEvent,
  Snackbar,
  Checkbox,
  alpha,
  Grow,
  Slide,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import TableViewIcon from '@mui/icons-material/TableView';
import BarChartIcon from '@mui/icons-material/BarChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LoadingOverlay } from './LoadingOverlay';
import { Database, Layers } from 'lucide-react'; // Add this import
import { DragDropField } from './DragDropField';
import { ChartBuilder } from './ChartBuilder';
import { DataPreview } from './DataPreview';
import { DataSourceSelector } from './DataSourceSelector';
// import { FilterPanel } from './FilterPanel';
import { SidePanel } from './SidePanel';
import { dataService } from '../services/api';
import { 
  NodeRedData, 
  ReportRequest, 
  ChartConfiguration, 
  DragItem, 
  DataSourceRequest,
  DataSourceFilter 
} from '../types';

export const ReportBuilder: React.FC = () => {
  // ... (keep all the existing state and logic)
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [reportTitle, setReportTitle] = useState('My Report');
  const [reportType, setReportType] = useState<'excel' | 'word'>('excel');
  const [charts, setCharts] = useState<ChartConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedAvailableFields, setSelectedAvailableFields] = useState<string[]>([]);
  const [outputType, setOutputType] = useState<'table' | 'chart'>('table');
  const [showPreview, setShowPreview] = useState(false);
  const [currentDataSource, setCurrentDataSource] = useState<string>('');
  // const [availableFilterValues, setAvailableFilterValues] = useState<Record<string, string[]>>({});
  // const [selectedFilters, setSelectedFilters] = useState<DataSourceFilter[]>([]);
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(true);

  const dropRef = useRef<HTMLDivElement>(null);

  // ... (keep all the existing functions)
  useEffect(() => {
    dataService.testConnection().then(connected => {
      if (!connected) {
        setError('Cannot connect to backend API. Make sure it is running on http://localhost:5080');
      }
    });
  }, []);

  const loadData = async (dataSourceId: string, filters: DataSourceFilter[] = []) => {
    setLoading(true);
    setError(null);
    setCurrentDataSource(dataSourceId);
    
    try {
      const request: DataSourceRequest = {
        dataSourceId: dataSourceId,
        filters: filters
      };

      const schema = await dataService.getSchema(request);
      setAvailableFields(schema.availableFields);
      
      const fullData = await dataService.getData(request);
      setData(fullData);
      
      const filterText = filters.length > 0 
        ? ` with ${filters.length} filter${filters.length > 1 ? 's' : ''} applied`
        : '';
      
      setSuccessMessage(`Loaded ${fullData.length} records with ${schema.availableFields.length} fields${filterText}`);
      setShowDataSourceSelector(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Error loading data. Check connection and filter values.';
      setError(errorMessage);
      setAvailableFields([]);
      setData([]);
      // Don't hide the data source selector on error so user can fix filters
    } finally {
      setLoading(false);
    }
  };

  // const handleApplyFilters = async () => {
  //   if (currentDataSource) {
  //     await loadData(currentDataSource, selectedFilters);
  //   }
  // };

  const handleChangeDataSource = () => {
    setShowDataSourceSelector(true);
    setAvailableFields([]);
    setSelectedFields([]);
    setData([]);
    setCharts([]);
  };

  const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>(() => ({
    accept: 'field',
    drop: (item: DragItem) => {
      if (!selectedFields.includes(item.field)) {
        setSelectedFields([...selectedFields, item.field]);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  const handleFieldCheckbox = (field: string, checked: boolean) => {
    if (checked) {
      setSelectedAvailableFields([...selectedAvailableFields, field]);
    } else {
      setSelectedAvailableFields(selectedAvailableFields.filter(f => f !== field));
    }
  };

  const addSelectedFields = () => {
    const newFields = selectedAvailableFields.filter(f => !selectedFields.includes(f));
    setSelectedFields([...selectedFields, ...newFields]);
    setSelectedAvailableFields([]);
  };

  const removeField = (field: string) => {
    setSelectedFields(selectedFields.filter(f => f !== field));
    setCharts(charts.filter(chart => chart.xAxis !== field && chart.yAxis !== field));
  };

  const removeAllFields = () => {
    setSelectedFields([]);
    setCharts([]);
  };

  const generateReport = async () => {
    if (selectedFields.length === 0) {
      setError('Please select at least one field for the report');
      return;
    }

    if (data.length === 0) {
      setError('No data available to generate report');
      return;
    }

    setLoading(true);
    setError(null);

    const request: ReportRequest = {
      reportType,
      selectedFields,
      data,
      configuration: {
        title: reportTitle,
        fieldMappings: {},
        charts: reportType === 'excel' && outputType === 'chart' ? charts : [],
      },
    };

    try {
      const blob = await dataService.generateReport(request);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${reportType === 'excel' ? 'xlsx' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('Report downloaded successfully!');
    } catch (error: any) {
      setError(error.response?.data?.details || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const addChart = (chart: ChartConfiguration) => {
    setCharts([...charts, chart]);
  };

  const removeChart = (index: number) => {
    setCharts(charts.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    if (selectedFields.length === 0) {
      setError('Please select at least one field to preview');
      return;
    }
    setShowPreview(true);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Side Panel - Only show on larger screens */}
      <Box
        sx={{
          width: { xs: 0, lg: 320 },
          flexShrink: 0,
          display: { xs: 'none', lg: 'block' },
        }}
      >
        <SidePanel />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Grow in={true} timeout={500}>
            <Box>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  mb: 4,
                  background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Report Builder
              </Typography>

              {showDataSourceSelector ? (
                <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                  <Paper 
                    sx={{ 
                      p: 4, 
                      mb: 3,
                      borderRadius: 2,
                      background: (theme) => alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                      Select Data Source
                    </Typography>
                    <DataSourceSelector 
                      onSelectDataSource={loadData}
                      loading={loading}
                    />
                  </Paper>
                </Slide>
              ) : (
                <>
                  <Slide direction="down" in={true} mountOnEnter unmountOnExit>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        mb: 3,
                        borderRadius: 2,
                        background: (theme) => alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6">
                            Data Source: {currentDataSource}
                          </Typography>
                          {data.length > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <Chip
                                label={`${data.length} records`}
                                color="success"
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={handleChangeDataSource}
                          disabled={loading}
                          sx={{ borderRadius: 2 }}
                        >
                          Change Source
                        </Button>
                      </Box>
                    </Paper>
                  </Slide>

                  {/* {Object.keys(availableFilterValues).length > 0 && (
                    <Grow in={true} timeout={700}>
                      <Box>
                        <FilterPanel
                          availableFilterValues={availableFilterValues}
                          selectedFilters={selectedFilters}
                          onFiltersChange={setSelectedFilters}
                          onApplyFilters={handleApplyFilters}
                        />
                      </Box>
                    </Grow>
                  )} */}
                </>
              )}

              {error && (
                <Grow in={true}>
                  <Alert 
                    severity="error" 
                    sx={{ mb: 2, borderRadius: 2 }} 
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                </Grow>
              )}

              {!showDataSourceSelector && (
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  <Grow in={true} timeout={800}>
                    <Box sx={{ flex: { xs: '1', md: '0 0 35%' } }}>
                      <Paper 
                        sx={{ 
                          p: 3, 
                          height: '100%',
                          borderRadius: 2,
                          background: (theme) => alpha(theme.palette.background.paper, 0.8),
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                          Available Fields
                        </Typography>
                        
                        {selectedAvailableFields.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={addSelectedFields}
                              fullWidth
                              sx={{ borderRadius: 2, py: 1 }}
                            >
                              Add {selectedAvailableFields.length} Selected Fields
                            </Button>
                          </Box>
                        )}
                        
                        {availableFields.length === 0 ? (
                          <Box 
                            sx={{ 
                              textAlign: 'center', 
                              py: 8,
                              opacity: 0.6,
                            }}
                          >
                            <Database size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                            <Typography variant="body2" color="text.secondary">
                              No fields available. Select a data source first.
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {availableFields.map((field, index) => (
                              <Grow in={true} timeout={100 * (index + 1)} key={field}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Checkbox
                                    checked={selectedAvailableFields.includes(field)}
                                    onChange={(e) => handleFieldCheckbox(field, e.target.checked)}
                                    disabled={selectedFields.includes(field)}
                                  />
                                  <Box sx={{ flex: 1 }}>
                                    <DragDropField field={field} disabled={selectedFields.includes(field)} />
                                  </Box>
                                </Box>
                              </Grow>
                            ))}
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  </Grow>

                  <Grow in={true} timeout={900}>
                    <Box sx={{ flex: { xs: '1', md: '0 0 65%' } }}>
                      <Paper 
                        sx={{ 
                          p: 3,
                          borderRadius: 2,
                          background: (theme) => alpha(theme.palette.background.paper, 0.8),
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                          Report Configuration
                        </Typography>

                        <TextField
                          label="Report Title"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          fullWidth
                          sx={{ mb: 3 }}
                          variant="outlined"
                        />

                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                          <FormControl sx={{ flex: 1 }}>
                            <InputLabel>Report Format</InputLabel>
                            <Select
                              value={reportType}
                              onChange={(e: SelectChangeEvent) => setReportType(e.target.value as 'excel' | 'word')}
                              label="Report Format"
                            >
                              <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                              <MenuItem value="word">Word (.docx)</MenuItem>
                            </Select>
                          </FormControl>

                          <FormControl sx={{ flex: 1 }}>
                            <InputLabel>Output Type</InputLabel>
                            <Select
                              value={outputType}
                              onChange={(e: SelectChangeEvent) => setOutputType(e.target.value as 'table' | 'chart')}
                              label="Output Type"
                            >
                              <MenuItem value="table">Table</MenuItem>
                              <MenuItem value="chart">Chart</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        <Paper
                          ref={dropRef}
                          sx={{
                            p: 3,
                            mb: 3,
                            minHeight: 150,
                            backgroundColor: (theme) => isOver 
                              ? alpha(theme.palette.primary.main, 0.08) 
                              : alpha(theme.palette.background.default, 0.5),
                            border: '2px dashed',
                            borderColor: (theme) => isOver 
                              ? theme.palette.primary.main 
                              : alpha(theme.palette.divider, 0.3),
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                          }}
                          elevation={0}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Selected Fields
                            </Typography>
                            {selectedFields.length > 0 && (
                              <Button
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={removeAllFields}
                                color="error"
                                sx={{ borderRadius: 2 }}
                              >
                                Remove All
                              </Button>
                            )}
                          </Box>
                          
                          {selectedFields.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
                              <Layers size={40} style={{ marginBottom: 8, opacity: 0.3 }} />
                              <Typography variant="body2" color="text.secondary">
                                Drag and drop fields here or use checkboxes
                              </Typography>
                            </Box>
                          ) : (
                            <List dense sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {selectedFields.map(field => (
                                <Grow in={true} key={field}>
                                  <ListItem
                                    sx={{
                                      width: 'auto',
                                      p: 0,
                                    }}
                                  >
                                    <Chip
                                      label={field}
                                      onDelete={() => removeField(field)}
                                      color="primary"
                                      sx={{ fontWeight: 500 }}
                                    />
                                  </ListItem>
                                </Grow>
                              ))}
                            </List>
                          )}
                        </Paper>

                        {outputType === 'chart' && selectedFields.length > 0 && (
                          <Grow in={true}>
                            <Box>
                              <ChartBuilder
                                availableFields={selectedFields}
                                onAddChart={addChart}
                              />

                              {charts.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    Configured Charts ({charts.length})
                                  </Typography>
                                  {charts.map((chart, index) => (
                                    <Slide direction="left" in={true} key={index}>
                                      <Paper 
                                        sx={{ 
                                          p: 2.5, 
                                          mb: 1.5, 
                                          display: 'flex', 
                                          justifyContent: 'space-between', 
                                          alignItems: 'center',
                                          borderRadius: 2,
                                          transition: 'all 0.3s ease',
                                          '&:hover': {
                                            transform: 'translateX(4px)',
                                            boxShadow: 2,
                                          },
                                        }}
                                      >
                                        <Box>
                                          <Typography variant="body1" fontWeight="bold">
                                            {chart.title}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {chart.type} chart: {chart.xAxis} vs {chart.yAxis}
                                          </Typography>
                                        </Box>
                                        <IconButton 
                                          onClick={() => removeChart(index)} 
                                          size="small"
                                          sx={{ 
                                            '&:hover': { 
                                              color: 'error.main',
                                              transform: 'scale(1.1)',
                                            },
                                            transition: 'all 0.2s ease',
                                          }}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Paper>
                                    </Slide>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Grow>
                        )}

                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={handlePreview}
                            disabled={selectedFields.length === 0}
                            startIcon={outputType === 'table' ? <TableViewIcon /> : <BarChartIcon />}
                            size="large"
                            sx={{ 
                              borderRadius: 2, 
                              px: 3,
                              boxShadow: 2,
                              '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Preview {outputType === 'table' ? 'Table' : 'Charts'}
                          </Button>
                          
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={generateReport}
                            disabled={selectedFields.length === 0 || loading}
                            startIcon={<DownloadIcon />}
                            size="large"
                            sx={{ 
                              borderRadius: 2, 
                              px: 3,
                              boxShadow: 2,
                              '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Download Report
                          </Button>
                          
                          {data.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                {data.length} records available
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    </Box>
                  </Grow>
                </Box>
              )}
            </Box>
          </Grow>

          <LoadingOverlay 
            open={loading} 
            message={currentDataSource ? `Loading ${currentDataSource} data...` : 'Loading data...'} 
          />

          {showPreview && (
            <DataPreview
              data={data}
              selectedFields={selectedFields}
              charts={charts}
              outputType={outputType}
              reportTitle={reportTitle}
              onClose={() => setShowPreview(false)}
            />
          )}

          <Snackbar
            open={!!successMessage}
            autoHideDuration={6000}
            onClose={() => setSuccessMessage(null)}
            message={successMessage}
            sx={{
              '& .MuiSnackbarContent-root': {
                borderRadius: 2,
                boxShadow: 4,
              },
            }}
          />
        </Container>
      </Box>
    </Box>
  );
};