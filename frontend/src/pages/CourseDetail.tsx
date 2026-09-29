import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Typography, Box, Card, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  Select, MenuItem, InputLabel, FormControl, 
  Paper, Tooltip, FormControlLabel, Chip, Tabs, Tab,
  LinearProgress, Divider, Avatar, Switch,
  CircularProgress, Breadcrumbs, Link, alpha, useTheme
} from '@mui/material';
import { 
  MenuBook as BookIcon,
  Forum as DiscussionIcon, 
  Assessment as ProgressIcon, 
  CloudUpload as UploadIcon,
  Fullscreen as TheaterIcon,
  FullscreenExit as TheaterExitIcon,
  Groups as GroupsIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import CourseBatchDialog from '../components/CourseBatchDialog';
import ActivityResourcePickerModal from '../components/course-detail/ActivityResourcePickerModal';
import type { 
  Course, Topic, ContentComponent, DiscussionPost, StudentNote 
} from '../components/course-detail/courseTypes';
import ContentPlayer, { type ContentPlayerRef } from '../components/course-detail/ContentPlayer';
import CurriculumSidebar from '../components/course-detail/CurriculumSidebar';
import ActiveLearningPanel from '../components/course-detail/ActiveLearningPanel';
import LessonActionDock from '../components/course-detail/LessonActionDock';
import NotesSidebar from '../components/course-detail/NotesSidebar';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedCompId, setSelectedCompId] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState<number>(0);

  // Focus / Theater Mode
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0);
  const [triggerAutoAdvance, setTriggerAutoAdvance] = useState<boolean>(false);

  // Collapsible Right Notes Sidebar State
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState<boolean>(false);

  // Moodle-style Studio Edit Mode
  const [editMode, setEditMode] = useState<boolean>(false);
  const [pickerModalOpen, setPickerModalOpen] = useState<boolean>(false);
  const [pickerTopicId, setPickerTopicId] = useState<number | null>(null);

  // Player Ref for timestamp note click-to-seek
  const playerRef = useRef<ContentPlayerRef | null>(null);

  // Student Timestamped Notes State
  const [notes, setNotes] = useState<StudentNote[]>([

    {
      id: '1',
      compId: 1,
      unitTitle: 'Course Introduction',
      timestampSeconds: 45,
      timestampText: '00:45',
      noteText: 'Important note on architectural paradigms and micro-frontend separation.',
      createdAt: 'Today, 2:15 PM'
    }
  ]);

  // Unit Q&A Discussion State
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([
    { 
      id: '1', 
      author: 'Sarah Jenkins', 
      role: 'Student', 
      text: 'Does this architecture model apply to serverless edge functions as well?', 
      time: '2 hours ago',
      unitId: 1,
      unitTitle: 'Architecture Overview'
    },
    { 
      id: '2', 
      author: 'Dr. Admin (Instructor)', 
      role: 'Instructor', 
      text: 'Yes! Edge functions follow the same request-response cycle but execute closer to the client.', 
      time: '1 hour ago',
      unitId: 1,
      unitTitle: 'Architecture Overview'
    }
  ]);

  // Batch Management Modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  // Topic (Section) Modal
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicName, setTopicName] = useState('');
  const [topicSequentialLock, setTopicSequentialLock] = useState(false);

  // Component (Resource) Modal
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [activeTopicForComp, setActiveTopicForComp] = useState<number | null>(null);
  const [editingComp, setEditingComp] = useState<ContentComponent | null>(null);
  const [compTitle, setCompTitle] = useState('');
  const [compType, setCompType] = useState<ContentComponent['type']>('YOUTUBE');
  const [compUrl, setCompUrl] = useState('');
  const [compStrict, setCompStrict] = useState(false);
  const [compSequentialLock, setCompSequentialLock] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);

  // Fetch course details
  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`courses/${id}/`);
      setCourse(res.data);
      if (res.data.topics && res.data.topics.length > 0) {
        if (!selectedTopicId) {
          const firstTopic = res.data.topics[0];
          setSelectedTopicId(firstTopic.id);
          if (firstTopic.components && firstTopic.components.length > 0) {
            setSelectedCompId(firstTopic.components[0].id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 16, gap: 2 }}>
        <CircularProgress size={48} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Loading learning studio...
        </Typography>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Course Not Found</Typography>
        <Button variant="contained" onClick={() => navigate('/courses')}>Back to Catalog</Button>
      </Box>
    );
  }

  const isInstructorOrStaff = user 
    ? (user?.role === 'ADMIN' || user?.role === 'MANAGER' || Number(user?.id) === Number(course.instructor)) 
    : false;

  // Active topic & components computation
  const activeTopic = course.topics.find(t => t.id === selectedTopicId) || course.topics[0];
  const sortedComponents = activeTopic?.components ? [...activeTopic.components].sort((a, b) => a.order - b.order) : [];
  const activeComp = sortedComponents.find(c => c.id === selectedCompId) || sortedComponents[0];

  // Flat list of all components for resources and navigation
  const allComponents = course.topics.flatMap(t => t.components || []);

  // Overall progress
  const totalComps = allComponents.length;
  const completedComps = allComponents.filter(c => c.completed).length;
  const overallProgress = totalComps > 0 ? Math.round((completedComps / totalComps) * 100) : 0;

  // Toggle completion
  const handleToggleComplete = async (compId: number) => {
    try {
      await api.post(`components/${compId}/toggle_complete/`);
      // Trigger auto-advance countdown if this was marking completed
      if (activeComp && activeComp.id === compId && !activeComp.completed) {
        setTriggerAutoAdvance(true);
      }
      fetchCourseDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Unit navigation
  const activeCompIndex = sortedComponents.findIndex(c => c.id === activeComp?.id);
  const sortedTopics = [...course.topics].sort((a, b) => a.order - b.order);
  const currentTopicIdx = sortedTopics.findIndex(t => t.id === selectedTopicId);

  const hasNext = (activeCompIndex < sortedComponents.length - 1) || (currentTopicIdx < sortedTopics.length - 1);
  const hasPrev = activeCompIndex > 0 || currentTopicIdx > 0;

  const handleNextUnit = () => {
    setTriggerAutoAdvance(false);
    if (activeCompIndex < sortedComponents.length - 1) {
      setSelectedCompId(sortedComponents[activeCompIndex + 1].id);
    } else if (currentTopicIdx < sortedTopics.length - 1) {
      const nextT = sortedTopics[currentTopicIdx + 1];
      setSelectedTopicId(nextT.id);
      if (nextT.components && nextT.components.length > 0) {
        setSelectedCompId(nextT.components[0].id);
      }
    }
  };

  const handlePrevUnit = () => {
    setTriggerAutoAdvance(false);
    if (activeCompIndex > 0) {
      setSelectedCompId(sortedComponents[activeCompIndex - 1].id);
    } else if (currentTopicIdx > 0) {
      const prevT = sortedTopics[currentTopicIdx - 1];
      setSelectedTopicId(prevT.id);
      if (prevT.components && prevT.components.length > 0) {
        setSelectedCompId(prevT.components[prevT.components.length - 1].id);
      }
    }
  };

  // Notes handlers
  const handleAddNote = (noteText: string, timestampSeconds: number) => {
    if (!activeComp) return;
    const formatMMS = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const newNote: StudentNote = {
      id: Date.now().toString(),
      compId: activeComp.id,
      unitTitle: activeComp.title,
      timestampSeconds,
      timestampText: formatMMS(timestampSeconds),
      noteText,
      createdAt: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleSeekTo = (timestampSeconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(timestampSeconds);
    }
  };

  // Discussion handler
  const handleAddDiscussionPost = (text: string) => {
    const post: DiscussionPost = {
      id: Date.now().toString(),
      author: user?.username || 'Student',
      role: user?.role || 'Student',
      text,
      time: 'Just now',
      unitId: activeComp?.id,
      unitTitle: activeComp?.title
    };
    setDiscussions(prev => [post, ...prev]);
  };

  // Section (Topic) Modals
  const handleOpenTopicModal = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setTopicName(topic.name);
      setTopicSequentialLock(topic.sequential_lock || false);
    } else {
      setEditingTopic(null);
      setTopicName('');
      setTopicSequentialLock(false);
    }
    setTopicModalOpen(true);
  };

  const handleSaveTopic = async () => {
    if (!topicName.trim() || !course) return;
    try {
      if (editingTopic) {
        await api.put(`topics/${editingTopic.id}/`, {
          course: course.id,
          name: topicName,
          order: editingTopic.order,
          sequential_lock: topicSequentialLock
        });
      } else {
        const nextOrder = course.topics.length;
        await api.post('topics/', {
          course: course.id,
          name: topicName,
          order: nextOrder,
          sequential_lock: topicSequentialLock
        });
      }
      fetchCourseDetails();
      setTopicModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!window.confirm('Delete this section and all associated contents?')) return;
    try {
      await api.delete(`topics/${topicId}/`);
      if (selectedTopicId === topicId) setSelectedTopicId(null);
      fetchCourseDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Resource (Component) Modals
  const handleOpenCompModal = (comp?: ContentComponent, topicId?: number) => {
    setActiveTopicForComp(topicId || selectedTopicId || (course.topics[0]?.id ?? null));
    if (comp) {
      setEditingComp(comp);
      setCompTitle(comp.title);
      setCompType(comp.type);
      setCompUrl(comp.url);
      setCompStrict(comp.strict_completion || false);
      setCompSequentialLock(comp.sequential_lock || false);
    } else {
      setEditingComp(null);
      setCompTitle('');
      setCompType('YOUTUBE');
      setCompUrl('');
      setCompStrict(false);
      setCompSequentialLock(false);
    }
    setCompModalOpen(true);
  };

  const handleSaveComponent = async () => {
    const targetTopicId = activeTopicForComp || selectedTopicId;
    if (!compTitle.trim() || !compUrl.trim() || !targetTopicId) return;

    try {
      if (editingComp) {
        await api.put(`components/${editingComp.id}/`, {
          topic: targetTopicId,
          type: compType,
          title: compTitle,
          url: compUrl,
          strict_completion: compStrict,
          sequential_lock: compSequentialLock,
          order: editingComp.order
        });
      } else {
        const targetTopic = course.topics.find(t => t.id === targetTopicId);
        const nextOrder = targetTopic?.components ? targetTopic.components.length : 0;
        await api.post('components/', {
          topic: targetTopicId,
          type: compType,
          title: compTitle,
          url: compUrl,
          strict_completion: compStrict,
          sequential_lock: compSequentialLock,
          order: nextOrder
        });
      }
      fetchCourseDetails();
      setCompModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComponent = async (compId: number) => {
    if (!window.confirm('Delete this resource component?')) return;
    try {
      await api.delete(`components/${compId}/`);
      if (selectedCompId === compId) setSelectedCompId(null);
      fetchCourseDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Moodle-style Activity & Resource Picker Handlers
  const handleOpenActivityPicker = (topicId: number) => {
    setPickerTopicId(topicId);
    setPickerModalOpen(true);
  };

  const handleSelectActivityType = (type: ContentComponent['type']) => {
    setActiveTopicForComp(pickerTopicId);
    setEditingComp(null);
    setCompTitle('');
    setCompType(type);
    setCompUrl('');
    setCompStrict(false);
    setCompSequentialLock(false);
    setCompModalOpen(true);
  };

  // Upload file resource helper
  const handleUploadResourceFile = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      setUploadingResource(true);
      const res = await api.post('components/upload_file/', uploadData);
      setCompUrl(res.data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingResource(false);
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 8 }}>
      {/* ======================================================== */}
      {/* 1. TOP STUDIO HEADER & BREADCRUMBS                        */}
      {/* ======================================================== */}
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', mb: 3 }}>
        <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, pt: 2.5, pb: 0 }}>
          
          {/* TOP UTILITY ROW: BREADCRUMBS ON LEFT, INSTRUCTOR & VIEW CONTROLS ON RIGHT */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" sx={{ color: 'primary.light', fontSize: 16 }} />} 
              aria-label="breadcrumb"
            >
              <Link component={RouterLink} to="/" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                Home
              </Link>
              <Link component={RouterLink} to="/courses" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                Courses
              </Link>
              <Typography color="text.primary" variant="body2" sx={{ fontWeight: 600 }}>
                {course.title}
              </Typography>
            </Breadcrumbs>

            {/* ACTION CONTROLS */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {isInstructorOrStaff && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    startIcon={<GroupsIcon />}
                    onClick={() => setBatchModalOpen(true)}
                    sx={{ borderRadius: 2.5, fontWeight: 700, px: 1.75, py: 0.6 }}
                  >
                    Batches ({course.batches ? course.batches.length : 0})
                  </Button>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={editMode}
                        onChange={(e) => setEditMode(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: editMode ? 'primary.main' : 'text.primary', fontSize: '0.85rem' }}>
                          Edit mode
                        </Typography>
                        <Chip 
                          label={editMode ? "ON" : "OFF"} 
                          size="small" 
                          color={editMode ? "primary" : "default"} 
                          sx={{ fontWeight: 800, height: 18, fontSize: '0.65rem' }} 
                        />
                      </Box>
                    }
                    sx={{ 
                      bgcolor: editMode ? alpha(theme.palette.primary.main, 0.08) : '#F8FAFC', 
                      px: 1.25, 
                      py: 0.35, 
                      borderRadius: 2.5, 
                      m: 0, 
                      border: '1.5px solid', 
                      borderColor: editMode ? 'primary.main' : '#CBD5E1',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </>
              )}

              {/* THEATER MODE TOGGLE BUTTON */}
              <Tooltip title={isTheaterMode ? "Exit Cinema Focus Mode" : "Cinema Focus Mode"}>
                <Button
                  size="small"
                  variant={isTheaterMode ? "contained" : "outlined"}
                  color="primary"
                  startIcon={isTheaterMode ? <TheaterExitIcon /> : <TheaterIcon />}
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  sx={{ borderRadius: 2.5, fontWeight: 700, px: 1.75, py: 0.6 }}
                >
                  {isTheaterMode ? "Standard View" : "Focus Mode"}
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* MAIN COURSE TITLE & PROGRESS ROW (SPACIOUS FULL WIDTH) */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2.5, mb: 3 }}>
            <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 450 } }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800, 
                  fontSize: { xs: '1.75rem', sm: '2.15rem', md: '2.45rem' }, 
                  letterSpacing: '-0.025em', 
                  color: '#0F172A',
                  lineHeight: 1.25,
                  mb: 1.25
                }}
              >
                {course.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Lead Faculty:{' '}
                  <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
                    {course.instructor_details?.first_name 
                      ? `${course.instructor_details.first_name} ${course.instructor_details.last_name}` 
                      : (course.instructor_details?.username || 'Instructor')}
                  </Box>
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ height: 14, my: 'auto' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {course.topics?.length || 0} Sections
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ height: 14, my: 'auto' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {totalComps} Units
                </Typography>
              </Box>
            </Box>

            {/* PROGRESS BAR WIDGET */}
            <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, px: 2.5, borderRadius: 3, minWidth: 260, border: '1px solid #E2E8F0', flexShrink: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Course Progress
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {completedComps}/{totalComps} Units ({overallProgress}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={overallProgress} 
                sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
              />
            </Box>
          </Box>

          {/* NAVIGATION TABS */}
          <Tabs 
            value={currentTab} 
            onChange={(_, val) => { setCurrentTab(val); if (val !== 0) setIsTheaterMode(false); }}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.92rem', minHeight: 48, textTransform: 'none', color: 'text.secondary' },
              '& .Mui-selected': { color: 'primary.main' },
              '& .MuiTabs-indicator': { height: 3 }
            }}
          >
            <Tab icon={<BookIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label="Learning Studio" />
            <Tab icon={<DiscussionIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label="Forum & Q&A" />
            <Tab icon={<ProgressIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label="Grades & Progress" />
          </Tabs>
        </Box>
      </Box>

      {/* ======================================================== */}
      {/* 2. TAB 0: LEARNING STUDIO (COURSEWARE & FOCUS MODE)      */}
      {/* ======================================================== */}
      {currentTab === 0 && (
        <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 } }}>
          {isTheaterMode ? (
            /* THEATER / CINEMA FULL-WIDTH FOCUS CANVAS */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ bgcolor: '#000000', p: { xs: 1, md: 3 }, borderRadius: 4, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                {activeComp ? (
                  <ContentPlayer 
                    ref={playerRef}
                    comp={activeComp} 
                    onComplete={handleToggleComplete}
                    isTheaterMode={true}
                    onTimeUpdate={(t) => setCurrentPlaybackTime(t)}
                  />
                ) : (
                  <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', py: 8 }}>
                    Select a unit from the curriculum.
                  </Typography>
                )}
              </Box>

              {/* ACTION DOCK & ACTIVE LEARNING TOOLS IN THEATER MODE */}
              <LessonActionDock 
                activeComp={activeComp}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={handlePrevUnit}
                onNext={handleNextUnit}
                onToggleComplete={() => activeComp && handleToggleComplete(activeComp.id)}
                isTheaterMode={isTheaterMode}
                onToggleTheaterMode={() => setIsTheaterMode(false)}
                triggerAutoAdvance={triggerAutoAdvance}
                isEditMode={editMode}
                onEditComponent={() => activeComp && handleOpenCompModal(activeComp, selectedTopicId || undefined)}
                onDeleteComponent={() => activeComp && handleDeleteComponent(activeComp.id)}
                onToggleNotes={() => setIsNotesSidebarOpen(prev => !prev)}
                notesCount={notes.length}
              />


              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '360px 1fr' }, gap: 3, mt: 1 }}>
                <CurriculumSidebar 
                  topics={course.topics}
                  selectedTopicId={selectedTopicId}
                  selectedCompId={selectedCompId}
                  onSelectTopic={(tId) => setSelectedTopicId(tId)}
                  onSelectComponent={(cId, tId) => {
                    setSelectedCompId(cId);
                    setSelectedTopicId(tId);
                    setTriggerAutoAdvance(false);
                  }}
                />
                <ActiveLearningPanel 
                  activeComp={activeComp}
                  discussions={discussions}
                  onAddDiscussionPost={handleAddDiscussionPost}
                  allComponents={allComponents}
                />

              </Box>
            </Box>
          ) : (
            /* STANDARD 2-COLUMN LEARNING STUDIO */
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '360px 1fr' }, gap: 3.5, alignItems: 'start' }}>
              {/* LEFT: CURRICULUM ACCORDION SIDEBAR WITH MOODLE EDIT CONTROLS */}
              <CurriculumSidebar 
                topics={course.topics}
                selectedTopicId={selectedTopicId}
                selectedCompId={selectedCompId}
                onSelectTopic={(tId) => setSelectedTopicId(tId)}
                onSelectComponent={(cId, tId) => {
                  setSelectedCompId(cId);
                  setSelectedTopicId(tId);
                  setTriggerAutoAdvance(false);
                }}
                isEditMode={editMode}
                onAddSection={() => handleOpenTopicModal()}
                onEditSection={(t) => handleOpenTopicModal(t)}
                onDeleteSection={(tId) => handleDeleteTopic(tId)}
                onAddActivityOrResource={(tId) => handleOpenActivityPicker(tId)}
                onEditComponent={(c, tId) => handleOpenCompModal(c, tId)}
                onDeleteComponent={(cId) => handleDeleteComponent(cId)}
              />

              {/* RIGHT: PLAYER, ACTION DOCK & ACTIVE LEARNING HUB */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
                {activeComp ? (
                  <>
                    {/* PLAYER STAGE */}
                    <Box sx={{ bgcolor: '#FFFFFF', p: { xs: 1.5, sm: 2 }, borderRadius: 3.5, border: '1px solid #E2E8F0' }}>
                      <ContentPlayer 
                        ref={playerRef}
                        comp={activeComp} 
                        onComplete={handleToggleComplete}
                        isTheaterMode={false}
                        onTimeUpdate={(t) => setCurrentPlaybackTime(t)}
                      />
                    </Box>

                    {/* FLOATING ACTION DOCK */}
                    <LessonActionDock 
                      activeComp={activeComp}
                      hasPrev={hasPrev}
                      hasNext={hasNext}
                      onPrev={handlePrevUnit}
                      onNext={handleNextUnit}
                      onToggleComplete={() => handleToggleComplete(activeComp.id)}
                      isTheaterMode={isTheaterMode}
                      onToggleTheaterMode={() => setIsTheaterMode(true)}
                      triggerAutoAdvance={triggerAutoAdvance}
                      isEditMode={editMode}
                      onEditComponent={() => handleOpenCompModal(activeComp, selectedTopicId || undefined)}
                      onDeleteComponent={() => handleDeleteComponent(activeComp.id)}
                      onToggleNotes={() => setIsNotesSidebarOpen(prev => !prev)}
                      notesCount={notes.length}
                    />


                    {/* ACTIVE LEARNING PANEL (Q&A, DOWNLOADS) */}
                    <ActiveLearningPanel 
                      activeComp={activeComp}
                      discussions={discussions}
                      onAddDiscussionPost={handleAddDiscussionPost}
                      allComponents={allComponents}
                    />

                  </>
                ) : (
                  <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
                    <Typography variant="h6" color="text.secondary">
                      Select a unit from the curriculum outline on the left to begin learning.
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* ======================================================== */}
      {/* 3. TAB 1: DISCUSSION & Q&A BOARD                         */}
      {/* ======================================================== */}
      {currentTab === 1 && (
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3.5, borderColor: '#CBD5E1', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Course Discussion Forum
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect with fellow learners and instructors. Questions posted inside units appear here too.
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<DiscussionIcon />} sx={{ bgcolor: '#007582', borderRadius: 2.5, fontWeight: 700 }}>
                Start Discussion
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {discussions.map((post) => (
                  <Paper 
                    key={post.id} 
                    variant="outlined" 
                    sx={{ p: 2.5, borderRadius: 2.5, transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' } }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: '0.8rem', bgcolor: 'primary.main', fontWeight: 800 }}>
                          {post.author.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {post.author}
                        </Typography>
                        <Chip label={post.role} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">{post.time}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#334155', pl: 4.75, mb: 1.5 }}>
                      {post.text}
                    </Typography>
                    {post.unitTitle && (
                      <Chip label={`Unit: ${post.unitTitle}`} size="small" variant="outlined" sx={{ ml: 4.75, fontSize: '0.7rem' }} />
                    )}
                  </Paper>
                ))}
              </Box>

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#F8FAFC', height: 'fit-content' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: '#0F172A' }}>Community Guidelines</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  • Be respectful and constructive to peers and staff.<br />
                  • Avoid posting direct answers to graded quizzes.<br />
                  • Tag questions with relevant unit context.<br />
                  • Provide helpful explanations and code snippets.
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ======================================================== */}
      {/* 4. TAB 2: PROGRESS & GRADES DASHBOARD                    */}
      {/* ======================================================== */}
      {currentTab === 2 && (
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3.5, borderColor: '#CBD5E1', bgcolor: 'white' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#0F172A' }}>
              Academic Progress & Completion Scorecard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Monitor completed units, quizzes, and verified certification requirements.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
              <Card variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#EEF2FF', textAlign: 'center', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>{overallProgress}%</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>Curriculum Completed</Typography>
              </Card>

              <Card variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#FEF3C7', textAlign: 'center', borderColor: '#FDE68A' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#D97706', mb: 0.5 }}>100%</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>Assessment Passing Score</Typography>
              </Card>

              <Card variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#DCFCE7', textAlign: 'center', borderColor: '#BBF7D0' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#16A34A', mb: 0.5 }}>{overallProgress === 100 ? 'Eligible' : 'In Progress'}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>Certification Status</Typography>
              </Card>
            </Box>

            {/* SECTIONS BREAKDOWN */}
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Module Progress Breakdown</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {course.topics.map((t) => {
                const comps = t.components || [];
                const done = comps.filter(c => c.completed).length;
                const pct = comps.length > 0 ? Math.round((done / comps.length) * 100) : 0;

                return (
                  <Box key={t.id} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>{t.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {done}/{comps.length} completed ({pct}%)
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4, bgcolor: '#E2E8F0' }} />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>
      )}

      {/* ======================================================== */}
      {/* 5. DIALOGS (BATCHES, SECTION MODAL, COMPONENT MODAL)     */}
      {/* ======================================================== */}
      {/* BATCHES & CSV ENROLLMENT DIALOG */}
      <CourseBatchDialog
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
      />

      {/* MOODLE STYLE: ADD AN ACTIVITY OR RESOURCE PICKER MODAL */}
      <ActivityResourcePickerModal
        open={pickerModalOpen}
        onClose={() => setPickerModalOpen(false)}
        sectionName={course.topics.find(t => t.id === pickerTopicId)?.name}
        onSelect={handleSelectActivityType}
      />

      {/* SECTION (TOPIC) MODAL */}
      <Dialog open={topicModalOpen} onClose={() => setTopicModalOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingTopic ? "Edit Section" : "Add New Section"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
          <TextField 
            autoFocus 
            fullWidth 
            label="Section Title" 
            value={topicName} 
            onChange={(e) => setTopicName(e.target.value)} 
          />
          <FormControlLabel
            control={
              <Switch 
                checked={topicSequentialLock} 
                onChange={(e) => setTopicSequentialLock(e.target.checked)} 
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Sequential Unit Progression Lock</Typography>
                <Typography variant="caption" color="text.secondary">Students must finish preceding units in order</Typography>
              </Box>
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTopicModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTopic} sx={{ borderRadius: 2, fontWeight: 700 }}>Save Section</Button>
        </DialogActions>
      </Dialog>

      {/* RESOURCE (COMPONENT) MODAL */}
      <Dialog open={compModalOpen} onClose={() => setCompModalOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingComp ? "Edit Resource Component" : "Add Resource Component"}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '10px !important' }}>
          <TextField 
            autoFocus 
            fullWidth 
            label="Resource Title" 
            value={compTitle} 
            onChange={(e) => setCompTitle(e.target.value)} 
          />

          <FormControl fullWidth>
            <InputLabel>Resource Type</InputLabel>
            <Select value={compType} label="Resource Type" onChange={(e: any) => setCompType(e.target.value)}>
              <MenuItem value="YOUTUBE">YouTube Video</MenuItem>
              <MenuItem value="VIDEO">Custom MP4 Video</MenuItem>
              <MenuItem value="AUDIO">Audio Lecture File</MenuItem>
              <MenuItem value="GOOGLE_DRIVE">Google Drive Video/Embed</MenuItem>
              <MenuItem value="PDF">PDF Document</MenuItem>
              <MenuItem value="DOCX">Word Document (.docx)</MenuItem>
              <MenuItem value="LINK">External Web Link</MenuItem>
              <MenuItem value="GOOGLE_SLIDES">Google Slides Presentation</MenuItem>
              <MenuItem value="POWERPOINT">PowerPoint Deck (.pptx)</MenuItem>
              <MenuItem value="ASSIGNMENT">Practical Assignment Task</MenuItem>
              <MenuItem value="QUIZ">Interactive Graded Quiz</MenuItem>
            </Select>
          </FormControl>

          {/* UPLOAD FILE OR URL */}
          <Box>
            <TextField 
              fullWidth 
              label="Resource URL / File Link / Direct Embed" 
              value={compUrl} 
              onChange={(e) => setCompUrl(e.target.value)} 
              multiline 
              rows={2} 
            />
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                component="label"
                size="small"
                disabled={uploadingResource}
                startIcon={uploadingResource ? <CircularProgress size={16} /> : <UploadIcon />}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                {uploadingResource ? "Uploading..." : "Upload File Asset"}
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadResourceFile(f);
                  }}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Upload video, audio, PDF, or slides directly
              </Typography>
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch 
                checked={compStrict} 
                onChange={(e) => setCompStrict(e.target.checked)} 
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Strict Playback / Anti-Skip Completion</Typography>
                <Typography variant="caption" color="text.secondary">Requires students to watch without fast-forwarding</Typography>
              </Box>
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCompModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveComponent} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Save Resource
          </Button>
        </DialogActions>
      </Dialog>

      {/* FLOATING RIGHT NOTES TRIGGER TAB */}
      <Box
        sx={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1100,
          display: isNotesSidebarOpen ? 'none' : 'block'
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsNotesSidebarOpen(true)}
          sx={{
            minWidth: 'auto',
            py: 1.6,
            px: 1,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontWeight: 800,
            fontSize: '0.82rem',
            letterSpacing: '0.04em',
            boxShadow: '-4px 4px 18px rgba(79, 70, 229, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'rotate(180deg) scale(1.05)',
              bgcolor: 'primary.dark'
            }
          }}
        >
          📝 Study Notes ({notes.length})
        </Button>
      </Box>

      {/* COLLAPSIBLE RIGHT NOTES SIDEBAR */}
      <NotesSidebar 
        open={isNotesSidebarOpen}
        onClose={() => setIsNotesSidebarOpen(false)}
        activeComp={activeComp}
        currentPlaybackTime={currentPlaybackTime}
        notes={notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        onSeekTo={handleSeekTo}
      />
    </Box>
  );
};

export default CourseDetail;

