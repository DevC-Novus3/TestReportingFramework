import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Paper, Typography } from '@mui/material';
import { DragItem } from '../types';

interface DragDropFieldProps {
  field: string;
  disabled?: boolean;
}

export const DragDropField: React.FC<DragDropFieldProps> = ({ field, disabled = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>(() => ({
    type: 'field',
    item: { field, type: 'field' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !disabled,
  }));

  // Connect the drag source
  useEffect(() => {
    if (ref.current && !disabled) {
      drag(ref.current);
    }
  }, [drag, disabled]);

  return (
    <Paper
      ref={ref}
      sx={{
        p: 1.5,
        m: 0.5,
        cursor: disabled ? 'default' : 'move',
        opacity: isDragging ? 0.5 : (disabled ? 0.6 : 1),
        backgroundColor: disabled ? '#e0e0e0' : '#f5f5f5',
        '&:hover': {
          backgroundColor: disabled ? '#e0e0e0' : '#e0e0e0',
        },
        transition: 'all 0.2s ease',
      }}
      elevation={isDragging ? 4 : 1}
    >
      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
        {field} {disabled && '(selected)'}
      </Typography>
    </Paper>
  );
};