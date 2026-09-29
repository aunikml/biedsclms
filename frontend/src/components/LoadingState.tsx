import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'cards' | 'table';
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading content...', variant = 'spinner' }) => {
  if (variant === 'cards') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Box key={item} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #E2E8F0', p: 2, bgcolor: '#FFFFFF' }}>
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 2 }} />
            <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '350px',
        width: '100%',
        p: 4
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2.5 }}>
        <CircularProgress size={56} thickness={4} sx={{ color: 'primary.main' }} />
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.01em' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingState;
