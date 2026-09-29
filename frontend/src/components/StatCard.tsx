import React from 'react';
import { Card, Box, Typography, alpha, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export type StatCardColor = 'primary' | 'secondary' | 'success' | 'warning' | 'info';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: StatCardColor;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  subtitle,
}) => {
  const theme = useTheme();

  // Resolve palette color
  const paletteColor = theme.palette[color] || theme.palette.primary;
  const mainColor = paletteColor.main;
  const contrastText = paletteColor.contrastText || '#FFFFFF';

  // Compute accessible text colors and background tints using theme alpha
  const bgGradient = `linear-gradient(135deg, ${alpha(mainColor, 0.08)} 0%, ${alpha(mainColor, 0.03)} 100%)`;
  const borderColor = alpha(mainColor, 0.2);
  const iconBg = mainColor;
  const iconShadow = `0 6px 16px ${alpha(mainColor, 0.35)}`;

  return (
    <Card
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: bgGradient,
        borderColor: borderColor,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 12px 24px -8px ${alpha(mainColor, 0.18)}`,
          borderColor: alpha(mainColor, 0.4),
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            p: 1.75,
            borderRadius: 3,
            bgcolor: iconBg,
            color: contrastText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: iconShadow,
            transition: 'transform 0.2s ease',
            '& svg': { fontSize: 24 },
          }}
        >
          {icon}
        </Box>

        {trend && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: 2,
              bgcolor: trend.isPositive ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.error.main, 0.12),
              color: trend.isPositive ? theme.palette.success.dark : theme.palette.error.dark,
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            {trend.isPositive ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
            <span>{typeof trend.value === 'number' && trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}</span>
          </Box>
        )}
      </Box>

      <Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: 'text.secondary',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'block',
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mt: 0.75,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default StatCard;
