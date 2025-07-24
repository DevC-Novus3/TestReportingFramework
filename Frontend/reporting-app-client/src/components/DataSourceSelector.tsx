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
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
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
  const [selectedFilters, setSelectedFilters] = useState<Record<string, DataSourceFilter>>({});
  const [loadingDataSources, setLoadingDataSources] = useState(true);

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
    } catch (error) {
      console.error('Error loading data sources:', error);
    } finally {
      setLoadingDataSources(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
    setSelectedFilters({});
  };

  const handleSelectDataSource = (dataSourceId: string) => {
    const filters = Object.values(selectedFilters).filter(f => 
      f.filterName && f.filterValue && 
      dataSources.find(ds => ds.id === dataSourceId)?.availableFilters.includes(f.filterName)
    );
    onSelectDataSource(dataSourceId, filters);
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
        {filteredDataSources.map(dataSource => (
          <Box key={dataSource.id} sx={{ 
            flexBasis: { xs: '100%', md: 'calc(50% - 8px)' },
            flexGrow: 0,
            flexShrink: 0
          }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{dataSource.name}</Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {dataSource.description}
                </Typography>

                {dataSource.availableFilters.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Available Filters:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {dataSource.availableFilters.map(filter => (
                        <Chip 
                          key={filter} 
                          label={filter} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
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
                    `Load ${dataSource.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};