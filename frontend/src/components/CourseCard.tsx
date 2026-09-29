import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Rating, Chip, Avatar, LinearProgress, useTheme, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export interface CourseCardData {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
  image_url: string;
  progress?: number;
}

interface CourseCardProps {
  course: CourseCardData;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const theme = useTheme();

  return (
    <Card 
      component={RouterLink}
      to={`/courses/${course.id}`}
      className="glass-card"
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
        borderRadius: 4,
        background: '#FFFFFF',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 25px -5px ${alpha(theme.palette.primary.main, 0.12)}, 0 8px 10px -6px rgba(0, 0, 0, 0.04)`,
          borderColor: alpha(theme.palette.primary.main, 0.3),
        },
        '&:hover .course-img': {
          transform: 'scale(1.06)',
        },
        '&:hover .course-overlay': {
          opacity: 0.2,
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        }
      }}
    >
      <Box sx={{ position: 'relative', pt: '56.25%', overflow: 'hidden' }}>
        <CardMedia
          className="course-img"
          component="img"
          image={course.image_url || `https://picsum.photos/seed/${course.id}/800/450`}
          alt={course.title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transition: 'transform 0.4s ease-in-out',
            objectFit: 'cover'
          }}
        />
        <Box 
          className="course-overlay"
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(15,23,42,0.6) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease'
          }}
        />
        <Chip 
          label="Featured" 
          size="small" 
          sx={{ 
            position: 'absolute', 
            top: 14, 
            left: 14, 
            fontWeight: 700,
            fontSize: '0.7rem',
            bgcolor: alpha(theme.palette.primary.main, 0.9),
            color: '#FFFFFF',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`
          }} 
        />
      </Box>

      {course.progress !== undefined && (
        <Box sx={{ width: '100%', bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
          <LinearProgress 
            variant="determinate" 
            value={course.progress} 
            sx={{ 
              height: 5, 
              backgroundColor: 'transparent',
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
              }
            }} 
          />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="h2" 
          sx={{ 
            fontWeight: 700,
            fontSize: '1.05rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'text.primary',
            mb: 1
          }}
        >
          {course.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 26, 
              height: 26, 
              fontSize: '0.75rem', 
              bgcolor: 'primary.main', 
              color: '#FFFFFF',
              fontWeight: 700 
            }}
          >
            {course.instructor_name ? course.instructor_name.charAt(0).toUpperCase() : 'I'}
          </Avatar>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {course.instructor_name || 'Expert Instructor'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
            4.9
          </Typography>
          <Rating value={4.9} precision={0.1} readOnly size="small" sx={{ color: '#F59E0B' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            (1.4k reviews)
          </Typography>
        </Box>

        <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                12 Modules
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MenuBookIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Self-Paced
              </Typography>
            </Box>
          </Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 800, 
              color: course.progress !== undefined ? 'primary.main' : 'success.main' 
            }}
          >
            {course.progress !== undefined ? `${course.progress}%` : 'Free'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
