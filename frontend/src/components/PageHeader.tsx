import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, action }) => {
  return (
    <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
      <Box sx={{ flex: 1, minWidth: 280 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" sx={{ color: 'primary.light', fontSize: 16 }} />} 
            aria-label="breadcrumb"
            sx={{ mb: 1.5, '& .MuiBreadcrumbs-separator': { margin: '0 4px' } }}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast || !crumb.path ? (
                <Typography key={index} color="text.primary" variant="body2" sx={{ fontWeight: 600 }}>
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={index}
                  component={RouterLink}
                  to={crumb.path}
                  color="text.secondary"
                  variant="body2"
                  sx={{ 
                    textDecoration: 'none', 
                    fontWeight: 500,
                    transition: 'color 0.2s ease',
                    '&:hover': { color: 'primary.main' } 
                  }}
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
            letterSpacing: '-0.02em',
            mb: subtitle ? 0.75 : 0
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400, maxWidth: '750px', lineHeight: 1.6 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Box sx={{ mt: { xs: 1, sm: 0 }, display: 'flex', alignItems: 'center' }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
