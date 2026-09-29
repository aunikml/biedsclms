import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'search' | 'books';
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  actionText, 
  onAction,
  icon = 'search'
}) => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 6, 
        textAlign: 'center', 
        borderRadius: 4, 
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px dashed rgba(226, 232, 240, 0.8)'
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2, display: 'flex', justifyContent: 'center' }}>
        {icon === 'search' ? (
          <SearchOffIcon sx={{ fontSize: 64, opacity: 0.5 }} />
        ) : (
          <LibraryBooksIcon sx={{ fontSize: 64, opacity: 0.5 }} />
        )}
      </Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {actionText && onAction && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onAction}
          sx={{ borderRadius: 8, px: 4, py: 1 }}
        >
          {actionText}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
