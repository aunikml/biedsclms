import React, { useEffect, useState, useContext } from 'react';
import { 
  Box, Typography, Button, LinearProgress, Chip, Avatar, 
  Card, CardContent, CardMedia, Tab, Tabs, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Divider, useTheme, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

// Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import GroupsIcon from '@mui/icons-material/Groups';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';



interface NextComponent {
  id: number;
  title: string;
  type: string;
  topic_name: string;
  topic_id: number;
  completed: boolean;
}

interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  image_url: string;
  instructor: {
    id: number;
    username: string;
    name: string;
    email: string;
  };
  batch_names: string[];
  is_enrolled: boolean;
  total_topics: number;
  total_components: number;
  completed_components: number;
  progress_percentage: number;
  is_completed: boolean;
  next_component: NextComponent | null;
  created_at: string;
}

interface RecentCompletion {
  id: number;
  component_id: number;
  component_title: string;
  component_type: string;
  topic_name: string;
  course_id: number;
  course_title: string;
  completed_at: string;
}

interface BatchInfo {
  id: number;
  name: string;
  course_id: number;
  course_title: string;
  instructor_name: string;
  student_count: number;
  created_at: string;
}

interface DashboardData {
  student: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    date_joined: string;
  };
  stats: {
    total_enrolled: number;
    in_progress: number;
    completed: number;
    not_started: number;
    total_lessons_completed: number;
    total_lessons_available: number;
    average_progress: number;
    streak_days: number;
    certificates_count: number;
  };
  courses: EnrolledCourse[];
  recent_completions: RecentCompletion[];
  batches: BatchInfo[];
}

const UserDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed' | 'batches'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Certificate Modal State
  const [selectedCertCourse, setSelectedCertCourse] = useState<EnrolledCourse | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('users/dashboard/');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenCertificate = (course: EnrolledCourse) => {
    setSelectedCertCourse(course);
    setCertModalOpen(true);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  if (loading) {
    return <LoadingState message="Loading your personalized student workspace..." variant="cards" />;
  }

  const courses = dashboardData?.courses || [];
  const stats = dashboardData?.stats || {
    total_enrolled: 0,
    in_progress: 0,
    completed: 0,
    not_started: 0,
    total_lessons_completed: 0,
    total_lessons_available: 0,
    average_progress: 0,
    streak_days: 1,
    certificates_count: 0
  };
  const batches = dashboardData?.batches || [];
  const recentCompletions = dashboardData?.recent_completions || [];
  const student = dashboardData?.student || {
    id: user?.id || 0,
    username: user?.username || 'student',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    full_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Student',
    role: user?.role || 'STUDENT',
    date_joined: new Date().toISOString()
  };


  // Find the primary course to resume
  const activeResumeCourse = courses.find(c => c.progress_percentage > 0 && c.progress_percentage < 100) 
    || courses.find(c => c.progress_percentage === 0) 
    || courses[0];

  // Filter courses based on tab and search
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.batch_names.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'in_progress') {
      return course.progress_percentage > 0 && course.progress_percentage < 100;
    }
    if (activeTab === 'completed') {
      return course.is_completed;
    }
    return true;
  });

  const getComponentTypeIcon = (type: string) => {
    switch (type) {
      case 'YOUTUBE':
      case 'VIDEO':
        return <YouTubeIcon sx={{ color: '#EF4444', fontSize: 18 }} />;
      case 'ASSIGNMENT':
        return <AssignmentIcon sx={{ color: '#3B82F6', fontSize: 18 }} />;
      case 'QUIZ':
        return <QuizIcon sx={{ color: '#F59E0B', fontSize: 18 }} />;
      case 'PDF':
        return <PictureAsPdfIcon sx={{ color: '#EC4899', fontSize: 18 }} />;
      default:
        return <MenuBookIcon sx={{ color: '#6366F1', fontSize: 18 }} />;
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 8 }}>
      {/* HERO GREETING BANNER */}

      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4.5 },
          mb: 5,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          color: '#FFFFFF',
          boxShadow: '0 20px 30px -10px rgba(49, 46, 129, 0.35)',
        }}
      >
        {/* Glow Accent Circles */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -60, 
            right: -60, 
            width: 250, 
            height: 250, 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(129, 140, 248, 0.4) 0%, rgba(129, 140, 248, 0) 70%)',
            pointerEvents: 'none' 
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: -80, 
            left: '30%', 
            width: 220, 
            height: 220, 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0) 70%)',
            pointerEvents: 'none' 
          }} 
        />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' }, gap: 4, alignItems: 'center' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip 
                icon={<WhatshotIcon sx={{ '&&': { color: '#F59E0B' } }} />}
                label={`${stats.streak_days}-Day Streak! 🔥`} 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#FFFFFF', 
                  fontWeight: 700, 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)' 
                }} 
              />
              <Chip 
                icon={<SchoolIcon sx={{ '&&': { color: '#38BDF8' } }} />}
                label="Student Scholar" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.12)', 
                  color: '#FFFFFF', 
                  fontWeight: 600, 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)' 
                }} 
              />
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', mb: 1, letterSpacing: '-0.02em' }}>
              Welcome back, {student.first_name || student.username}! 👋
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 550, mb: 3, lineHeight: 1.6 }}>
              You have completed <b>{stats.total_lessons_completed}</b> lessons out of <b>{stats.total_lessons_available}</b> across your enrolled courses. Keep up the momentum!
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={() => {
                  if (activeResumeCourse) {
                    navigate(`/courses/${activeResumeCourse.id}`);
                  }
                }}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#312E81',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1.25,
                  borderRadius: 3,
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    bgcolor: '#F1F5F9',
                    color: '#1E1B4B',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {activeResumeCourse ? 'Continue Learning' : 'Explore Courses'}
              </Button>

              {stats.certificates_count > 0 && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<EmojiEventsIcon />}
                  onClick={() => {
                    const completedCourse = courses.find(c => c.is_completed);
                    if (completedCourse) handleOpenCertificate(completedCourse);
                  }}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    px: 3,
                    borderRadius: 3,
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      borderColor: '#FFFFFF',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  View Certificates ({stats.certificates_count})
                </Button>
              )}
            </Box>
          </Box>

          {/* QUICK RESUME CARD WIDGET */}
          {activeResumeCourse && (
            <Card
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3.5,
                color: '#FFFFFF',
                p: 2.5,
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#A5B4FC' }}>
                Next Up In Your Syllabus
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, mb: 1, color: '#FFFFFF', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {activeResumeCourse.title}
              </Typography>

              {activeResumeCourse.next_component && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, bgcolor: 'rgba(0, 0, 0, 0.2)', p: 1.25, borderRadius: 2 }}>
                  {getComponentTypeIcon(activeResumeCourse.next_component.type)}
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {activeResumeCourse.next_component.title}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                  Course Progress
                </Typography>
                <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800 }}>
                  {activeResumeCourse.progress_percentage}%
                </Typography>
              </Box>

              <LinearProgress 
                variant="determinate" 
                value={activeResumeCourse.progress_percentage} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  mb: 2,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #38BDF8 0%, #818CF8 100%)'
                  }
                }} 
              />

              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={() => navigate(`/courses/${activeResumeCourse.id}`)}
                sx={{
                  bgcolor: 'primary.main',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                Jump to Lesson →
              </Button>
            </Card>
          )}
        </Box>
      </Box>

      {/* STATS OVERVIEW CARDS */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 6 }}>
        <StatCard
          title="Enrolled Courses"
          value={stats.total_enrolled}
          icon={<MenuBookIcon />}
          color="primary"
          subtitle={`${stats.in_progress} actively in progress`}
        />

        <StatCard
          title="Completed Lessons"
          value={`${stats.total_lessons_completed} / ${stats.total_lessons_available}`}
          icon={<CheckCircleIcon />}
          color="info"
          subtitle="Total syllabus modules done"
        />

        <StatCard
          title="Average Progress"
          value={`${stats.average_progress}%`}
          icon={<AccessTimeIcon />}
          color="warning"
          trend={{ value: stats.average_progress, isPositive: stats.average_progress >= 50 }}
          subtitle="Across all courses"
        />

        <StatCard
          title="Certificates Unlocked"
          value={stats.certificates_count}
          icon={<EmojiEventsIcon />}
          color="success"
          subtitle={`${stats.completed} courses finished 100%`}
        />
      </Box>

      {/* MAIN CONTENT AREA: COURSES & SIDEBAR */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2.3fr 1fr' }, gap: 4.5 }}>
        {/* LEFT COLUMN: TABS & COURSE LIST */}
        <Box>
          {/* FILTER CONTROLS */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3.5 }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, val) => setActiveTab(val)}
              sx={{
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 1.5
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  minWidth: 'auto',
                  px: 2,
                }
              }}
            >
              <Tab 
                value="all" 
                label={`All Courses (${courses.length})`} 
              />
              <Tab 
                value="in_progress" 
                label={`In Progress (${stats.in_progress})`} 
              />
              <Tab 
                value="completed" 
                label={`Completed (${stats.completed})`} 
              />
              <Tab 
                value="batches" 
                label={`My Batches (${batches.length})`} 
              />
            </Tabs>

            <TextField
              size="small"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{
                minWidth: { xs: '100%', sm: 240 },
                bgcolor: '#FFFFFF',
                borderRadius: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                }
              }}
            />
          </Box>

          {/* TAB CONTENT: BATCHES */}
          {activeTab === 'batches' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {batches.length > 0 ? (
                batches.map(batch => (
                  <Card 
                    key={batch.id} 
                    sx={{ 
                      borderRadius: 3.5, 
                      p: 3, 
                      border: '1px solid #E2E8F0', 
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Chip 
                          icon={<GroupsIcon fontSize="small" />} 
                          label="Active Cohort" 
                          size="small" 
                          color="primary" 
                          sx={{ fontWeight: 700, fontSize: '0.75rem' }} 
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Enrolled on {new Date(batch.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                        {batch.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Course: <b>{batch.course_title}</b> • Instructor: <b>{batch.instructor_name}</b> • {batch.student_count} Peers
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate(`/courses/${batch.course_id}`)}
                      sx={{ borderRadius: 2.5, fontWeight: 700, px: 2.5, whiteSpace: 'nowrap' }}
                    >
                      Go to Courseroom
                    </Button>
                  </Card>
                ))
              ) : (
                <EmptyState
                  title="No Cohorts Assigned"
                  description="You have not been assigned to any specific batches yet. You can still access and learn from all published courses."
                  icon="books"
                />

              )}
            </Box>
          ) : (
            /* TAB CONTENT: COURSES GRID */
            <Box>
              {filteredCourses.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3.5 }}>
                  {filteredCourses.map(course => {
                    const isFullyDone = course.is_completed;
                    
                    return (
                      <Card
                        key={course.id}
                        sx={{
                          borderRadius: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          border: '1px solid',
                          borderColor: isFullyDone ? alpha(theme.palette.success.main, 0.3) : '#E2E8F0',
                          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                          transition: 'all 0.3s ease',
                          overflow: 'hidden',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 16px 24px -4px rgba(15, 23, 42, 0.08)',
                            borderColor: theme.palette.primary.main
                          }
                        }}
                      >
                        {/* Course Image Header */}
                        <Box sx={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            image={course.image_url || `https://picsum.photos/seed/${course.id}/600/300`}
                            alt={course.title}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              right: 0, 
                              bottom: 0, 
                              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.7) 100%)' 
                            }} 
                          />
                          
                          {/* Badges on top of image */}
                          <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
                            {course.batch_names.length > 0 ? (
                              <Chip 
                                label={course.batch_names[0]} 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(15, 23, 42, 0.8)', 
                                  color: '#FFFFFF', 
                                  fontWeight: 700, 
                                  fontSize: '0.7rem',
                                  backdropFilter: 'blur(6px)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)' 
                                }} 
                              />
                            ) : (
                              <Chip 
                                label="Self-Enrolled" 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(15, 23, 42, 0.8)', 
                                  color: '#FFFFFF', 
                                  fontWeight: 700, 
                                  fontSize: '0.7rem',
                                  backdropFilter: 'blur(6px)' 
                                }} 
                              />
                            )}
                          </Box>

                          {isFullyDone && (
                            <Chip 
                              icon={<VerifiedIcon sx={{ '&&': { color: '#FFFFFF', fontSize: 16 } }} />}
                              label="Completed" 
                              size="small" 
                              color="success"
                              sx={{ 
                                position: 'absolute', 
                                top: 12, 
                                right: 12, 
                                fontWeight: 800, 
                                fontSize: '0.7rem',
                                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)' 
                              }} 
                            />
                          )}

                          {/* Progress on Image Bottom */}
                          <Box sx={{ position: 'absolute', bottom: 10, left: 14, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                              {course.completed_components} of {course.total_components} Lessons Done
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800 }}>
                              {course.progress_percentage}%
                            </Typography>
                          </Box>
                        </Box>

                        {/* Progress Bar */}
                        <LinearProgress 
                          variant="determinate" 
                          value={course.progress_percentage} 
                          sx={{ 
                            height: 5, 
                            bgcolor: '#F1F5F9',
                            '& .MuiLinearProgress-bar': {
                              background: isFullyDone 
                                ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' 
                                : 'linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%)'
                            }
                          }} 
                        />

                        {/* Card Content */}
                        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, fontSize: '1.05rem', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {course.title}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.light', fontWeight: 700 }}>
                              {course.instructor.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {course.instructor.name}
                            </Typography>
                          </Box>

                          {/* Next Up Lesson Preview */}
                          {!isFullyDone && course.next_component && (
                            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 2.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                Next Lesson:
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getComponentTypeIcon(course.next_component.type)}
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {course.next_component.title}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {isFullyDone && (
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.08), border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.2), mb: 2.5, textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                                🎉 Congratulations! You mastered this course.
                              </Typography>
                            </Box>
                          )}

                          {/* Action Buttons */}
                          <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5 }}>
                            {isFullyDone ? (
                              <>
                                <Button
                                  fullWidth
                                  variant="contained"
                                  color="success"
                                  startIcon={<EmojiEventsIcon />}
                                  onClick={() => handleOpenCertificate(course)}
                                  sx={{ borderRadius: 2.5, fontWeight: 700, py: 1 }}
                                >
                                  Certificate
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={() => navigate(`/courses/${course.id}`)}
                                  sx={{ borderRadius: 2.5, fontWeight: 700, px: 2 }}
                                >
                                  Review
                                </Button>
                              </>
                            ) : (
                              <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                startIcon={<PlayArrowIcon />}
                                onClick={() => navigate(`/courses/${course.id}`)}
                                sx={{ borderRadius: 2.5, fontWeight: 700, py: 1 }}
                              >
                                {course.progress_percentage > 0 ? 'Resume Learning' : 'Start Course'}
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                <EmptyState
                  title={activeTab === 'completed' ? 'No Completed Courses Yet' : 'No Matching Courses'}
                  description={
                    activeTab === 'completed' 
                      ? 'Complete all modules and lessons in a course to earn your verified credential and certificate here!'
                      : 'Try refining your search query or check the other status tabs.'
                  }
                  actionText="Explore Catalog"
                  onAction={() => navigate('/')}
                  icon="books"
                />
              )}
            </Box>
          )}
        </Box>

        {/* RIGHT COLUMN: RECENT ACTIVITY & STUDENT PROFILE */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* STUDENT PROFILE CARD */}
          <Card sx={{ borderRadius: 4, p: 3, border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 800, boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)' }}>
                {student.full_name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  {student.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.email}
                </Typography>
                <Chip label="Verified Student" size="small" color="primary" sx={{ mt: 0.5, fontWeight: 700, fontSize: '0.65rem' }} />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, textAlign: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {stats.total_lessons_completed}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Lessons Finished
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
                  {stats.certificates_count}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Certificates
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* RECENT ACTIVITY TIMELINE */}
          <Card sx={{ borderRadius: 4, p: 3, border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ color: 'primary.main' }} />
              Recent Activity
            </Typography>

            {recentCompletions.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentCompletions.map((item, idx) => (
                  <Box key={item.id || idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box 
                      sx={{ 
                        mt: 0.5, 
                        width: 28, 
                        height: 28, 
                        borderRadius: '50%', 
                        bgcolor: alpha(theme.palette.success.main, 0.1), 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    </Box>

                    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.component_title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {item.course_title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                        {new Date(item.completed_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No recent completions yet. Start a lesson to see your live progress timeline!
                </Typography>
              </Box>
            )}
          </Card>
        </Box>
      </Box>

      {/* CERTIFICATE PREVIEW DIALOG MODAL */}
      <Dialog
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon sx={{ color: '#F59E0B' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Verified Certificate of Completion
            </Typography>
          </Box>
          <IconButton onClick={() => setCertModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#F8FAFC' }}>
          {selectedCertCourse && (
            <Box
              id="certificate-print-area"
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                p: { xs: 3, sm: 6 },
                border: '8px double #4F46E5',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Watermark Logo Accent */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.03,
                  pointerEvents: 'none',
                  fontSize: '20rem',
                  fontWeight: 900
                }}
              >
                ⚡
              </Box>

              <Typography variant="overline" sx={{ letterSpacing: '0.25em', fontWeight: 800, color: 'primary.main', fontSize: '0.85rem' }}>
                IED, BRACU COURSEWARE • THUNDERBOLT LMS
              </Typography>

              <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', my: 2, color: '#0F172A', letterSpacing: '-0.02em' }}>
                CERTIFICATE OF COMPLETION
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                This is proudly and formally awarded to
              </Typography>

              <Typography variant="h3" sx={{ fontWeight: 800, color: '#4F46E5', mb: 2, fontFamily: '"Outfit", sans-serif' }}>
                {student.full_name}
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto', mb: 4, lineHeight: 1.7 }}>
                for successfully mastering all curriculum topics, practical assignments, and assessments for the course
              </Typography>

              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 4 }}>
                {selectedCertCourse.title}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', px: { xs: 1, sm: 4 }, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Instructor
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {selectedCertCourse.instructor.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Course Faculty
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <VerifiedIcon sx={{ color: '#10B981', fontSize: 38, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    ID: TB-CERT-{selectedCertCourse.id}-{student.id}-2026
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Issue Date
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Academic Verification
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button onClick={() => setCertModalOpen(false)} sx={{ fontWeight: 700 }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintCertificate}
            sx={{ fontWeight: 700, borderRadius: 2.5, px: 3 }}
          >
            Print / Save PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;
