import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  alpha,
  TextField,
  Collapse,
  IconButton,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DataSource, DataSourceFilter } from '../types';
import { dataService } from '../services/api';

interface DataSourceSelectorProps {
  onSelectDataSource: (dataSourceId: string, filters: DataSourceFilter[]) => void;
  loading: boolean;
}

export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ onSelectDataSource, loading }) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loadingDataSources, setLoadingDataSources] = useState(true);
  
  // Store filters for each data source
  const [dataSourceFilters, setDataSourceFilters] = useState<Record<string, Record<string, string>>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      const [sources, cats] = await Promise.all([
        dataService.getDataSources(),
        dataService.getCategories()
      ]);
      setDataSources(sources);
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0]);
      }
      
      // Initialize empty filters for each data source
      const initialFilters: Record<string, Record<string, string>> = {};
      sources.forEach(source => {
        initialFilters[source.id] = {};
        source.availableFilters.forEach(filter => {
          initialFilters[source.id][filter] = '';
        });
      });
      setDataSourceFilters(initialFilters);
    } catch (error) {
      console.error('Error loading data sources:', error);
    } finally {
      setLoadingDataSources(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleFilterChange = (dataSourceId: string, filterName: string, value: string) => {
    setDataSourceFilters(prev => ({
      ...prev,
      [dataSourceId]: {
        ...prev[dataSourceId],
        [filterName]: value
      }
    }));
  };

  const handleSelectDataSource = (dataSourceId: string) => {
    const filters = Object.entries(dataSourceFilters[dataSourceId] || {})
      .filter(([_, value]) => value !== '')
      .map(([filterName, filterValue]) => ({
        filterName,
        filterValue
      }));
    
    onSelectDataSource(dataSourceId, filters);
  };

  const toggleExpanded = (dataSourceId: string) => {
    setExpandedCard(expandedCard === dataSourceId ? null : dataSourceId);
  };

  const getActiveFilterCount = (dataSourceId: string) => {
    return Object.values(dataSourceFilters[dataSourceId] || {}).filter(v => v !== '').length;
  };

  const filteredDataSources = selectedCategory 
    ? dataSources.filter(ds => ds.category === selectedCategory)
    : dataSources;

  if (loadingDataSources) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Data Category</InputLabel>
        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          label="Data Category"
        >
          {categories.map(category => (
            <MenuItem key={category} value={category}>{category}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {filteredDataSources.map(dataSource => {
          const isExpanded = expandedCard === dataSource.id;
          const activeFilters = getActiveFilterCount(dataSource.id);
          
          return (
            <Box key={dataSource.id} sx={{ 
              flexBasis: { xs: '100%', md: 'calc(50% - 8px)' },
              flexGrow: 0,
              flexShrink: 0
            }}>
              <Card 
                sx={{ 
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ flex: 1 }}>{dataSource.name}</Typography>
                    {dataSource.availableFilters.length > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => toggleExpanded(dataSource.id)}
                        sx={{ ml: 1 }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {dataSource.description}
                  </Typography>

                  {dataSource.availableFilters.length > 0 && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FilterListIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Available Filters {activeFilters > 0 && `(${activeFilters} active)`}
                        </Typography>
                      </Box>

                      {!isExpanded && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {dataSource.availableFilters.map(filter => (
                            <Chip 
                              key={filter} 
                              label={filter} 
                              size="small" 
                              variant={dataSourceFilters[dataSource.id]?.[filter] ? "filled" : "outlined"}
                              color={dataSourceFilters[dataSource.id]?.[filter] ? "primary" : "default"}
                            />
                          ))}
                        </Box>
                      )}

                      <Collapse in={isExpanded}>
                        <Box sx={{ mt: 2, mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Configure Filters (Optional)
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {dataSource.availableFilters.map(filter => (
                              <TextField
                                key={filter}
                                label={filter}
                                value={dataSourceFilters[dataSource.id]?.[filter] || ''}
                                onChange={(e) => handleFilterChange(dataSource.id, filter, e.target.value)}
                                size="small"
                                fullWidth
                                placeholder={`Enter ${filter} value`}
                                helperText={`Filter by ${filter} (leave empty to load all)`}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Collapse>
                    </>
                  )}

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleSelectDataSource(dataSource.id)}
                    disabled={loading}
                    sx={{
                      position: 'relative',
                      '&.Mui-disabled': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                      },
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        <span>Loading...</span>
                      </Box>
                    ) : (
                      `Load ${dataSource.name}${activeFilters > 0 ? ` with ${activeFilters} filter${activeFilters > 1 ? 's' : ''}` : ''}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};