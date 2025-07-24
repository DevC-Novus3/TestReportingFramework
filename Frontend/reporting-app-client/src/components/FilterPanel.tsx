import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Chip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DataSourceFilter } from '../types';

interface FilterPanelProps {
  availableFilterValues: Record<string, string[]>;
  selectedFilters: DataSourceFilter[];
  onFiltersChange: (filters: DataSourceFilter[]) => void;
  onApplyFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  availableFilterValues,
  selectedFilters,
  onFiltersChange,
  onApplyFilters,
}) => {
  const handleFilterChange = (filterName: string, filterValue: string) => {
    const newFilters = selectedFilters.filter(f => f.filterName !== filterName);
    if (filterValue) {
      newFilters.push({ filterName, filterValue });
    }
    onFiltersChange(newFilters);
  };

  const getSelectedValue = (filterName: string): string => {
    return selectedFilters.find(f => f.filterName === filterName)?.filterValue || '';
  };

  const clearFilters = () => {
    onFiltersChange([]);
  };

  if (Object.keys(availableFilterValues).length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Filters</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        {Object.entries(availableFilterValues).map(([filterName, values]) => (
          <FormControl key={filterName} size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{filterName}</InputLabel>
            <Select
              value={getSelectedValue(filterName)}
              onChange={(e: SelectChangeEvent) => handleFilterChange(filterName, e.target.value)}
              label={filterName}
            >
              <MenuItem value="">All</MenuItem>
              {values.map(value => (
                <MenuItem key={value} value={value}>{value}</MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>

      {selectedFilters.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Active filters:
          </Typography>
          {selectedFilters.map((filter, index) => (
            <Chip
              key={index}
              label={`${filter.filterName}: ${filter.filterValue}`}
              size="small"
              onDelete={() => handleFilterChange(filter.filterName, '')}
            />
          ))}
          <Button size="small" onClick={clearFilters}>
            Clear All
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={onApplyFilters}
          disabled={selectedFilters.length === 0}
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
};