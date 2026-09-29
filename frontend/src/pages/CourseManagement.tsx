import React, { useEffect, useState, useContext, useMemo } from 'react';
import { 
  Box, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, 
  IconButton, Tooltip, Select, MenuItem, InputLabel, FormControl, 
  Chip, Avatar, Snackbar, Alert, DialogContentText, Menu, 
  useMediaQuery, useTheme, TablePagination, InputAdornment, 
  ToggleButtonGroup, ToggleButton, Switch, FormControlLabel,
  Card, CardContent, CardMedia, Typography, alpha, CircularProgress
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Launch as LaunchIcon, 
  Add as AddIcon, 
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as DraftIcon,
  CloudUpload as CloudUploadIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CourseBatchDialog from '../components/CourseBatchDialog';

interface Course {
  id: number;
  title: string;
  description: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
  instructor: number;
  instructor_details?: {
    first_name: string;
    last_name: string;
    username: string;
  };
}

interface UserOption {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
}

const CourseManagement: React.FC = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state (Create / Edit)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    image_url: string;
    is_published: boolean;
    instructor: string | number;
  }>({
    title: '',
    description: '',
    image_url: '',
    is_published: false,
    instructor: '',
  });

  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  // UX Feedback state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    courseId: number | null;
    courseTitle?: string;
  }>({ open: false, courseId: null });

  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);

  // Batch Dialog state
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchCourse, setBatchCourse] = useState<{ id: number; title: string } | null>(null);

  const handleOpenBatches = (course: Course) => {
    setBatchCourse({ id: course.id, title: course.title });
    setBatchDialogOpen(true);
    handleActionMenuClose();
  };

  const canCreate = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('courses/');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to load courses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('users/');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, []);

  // Quick Action Menu Handlers
  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>, courseId: number) => {
    setActionMenuAnchor(event.currentTarget);
    setActiveCourseId(courseId);
  };
  
  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActiveCourseId(null);
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setDialogMode('create');
    setEditingCourseId(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      is_published: false,
      instructor: user?.id || '',
    });
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (course: Course) => {
    setDialogMode('edit');
    setEditingCourseId(course.id);
    setFormData({
      title: course.title,
      description: course.description || '',
      image_url: course.image_url || '',
      is_published: course.is_published,
      instructor: course.instructor || '',
    });
    setDialogOpen(true);
    handleActionMenuClose();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourseId(null);
    setFormData({ title: '', description: '', image_url: '', is_published: false, instructor: '' });
  };

  // Image Upload handler
  const handleImageUpload = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      setUploadingImage(true);
      const res = await api.post('components/upload_file/', uploadData);
      setFormData(prev => ({ ...prev, image_url: res.data.url }));
      showSnackbar('Course cover image uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to upload image. Please try again.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save (Create or Update)
  const handleSaveCourse = async () => {
    if (!formData.title.trim()) {
      showSnackbar('Course Title is required.', 'error');
      return;
    }

    const payload: any = {
      title: formData.title.trim(),
      description: formData.description,
      image_url: formData.image_url,
      is_published: formData.is_published,
    };

    if (formData.instructor) {
      payload.instructor = Number(formData.instructor);
    }

    try {
      if (dialogMode === 'create') {
        await api.post('courses/', payload);
        showSnackbar('Course created successfully!', 'success');
      } else if (editingCourseId !== null) {
        await api.put(`courses/${editingCourseId}/`, payload);
        showSnackbar('Course updated successfully!', 'success');
      }
      fetchCourses();
      handleCloseDialog();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save course.';
      showSnackbar(`Error: ${detail}`, 'error');
    }
  };

  // Quick Toggle Publish / Draft
  const handleTogglePublish = async (course: Course) => {
    const newStatus = !course.is_published;
    try {
      // Optimistic update
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_published: newStatus } : c));
      await api.patch(`courses/${course.id}/`, { is_published: newStatus });
      showSnackbar(
        `Course "${course.title}" is now ${newStatus ? 'Published' : 'in Draft'}.`,
        newStatus ? 'success' : 'info'
      );
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_published: !newStatus } : c));
      showSnackbar('Failed to update course status.', 'error');
    }
  };

  // Delete Handlers
  const confirmDelete = (course: Course) => {
    setDeleteDialog({ open: true, courseId: course.id, courseTitle: course.title });
    handleActionMenuClose();
  };

  const handleDelete = async () => {
    if (deleteDialog.courseId !== null) {
      try {
        await api.delete(`courses/${deleteDialog.courseId}/`);
        setCourses(prev => prev.filter(c => c.id !== deleteDialog.courseId));
        showSnackbar('Course deleted successfully.', 'success');
      } catch (err) {
        console.error(err);
        showSnackbar('Error deleting course.', 'error');
      }
    }
    setDeleteDialog({ open: false, courseId: null });
  };

  // Computed KPI Metrics
  const metrics = useMemo(() => {
    const total = courses.length;
    const published = courses.filter(c => c.is_published).length;
    const draft = total - published;
    return { total, published, draft };
  }, [courses]);

  // Filtered & Paginated Courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Status filter
      if (statusFilter === 'PUBLISHED' && !course.is_published) return false;
      if (statusFilter === 'DRAFT' && course.is_published) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const instructor = course.instructor_details 
          ? `${course.instructor_details.first_name} ${course.instructor_details.last_name} ${course.instructor_details.username}`.toLowerCase()
          : '';
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchDesc = (course.description || '').toLowerCase().includes(q);
        const matchInstructor = instructor.includes(q);
        return matchTitle || matchDesc || matchInstructor;
      }
      return true;
    });
  }, [courses, statusFilter, searchQuery]);

  const paginatedCourses = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCourses.slice(start, start + rowsPerPage);
  }, [filteredCourses, page, rowsPerPage]);

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader 
        title="Course Management" 
        subtitle="Create, configure, publish, and monitor all courses across your learning portal."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Course Management' }]}
        action={
          canCreate ? (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleOpenCreate}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2.5, px: 3, py: 1.1, fontWeight: 700, boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}
            >
              New Course
            </Button>
          ) : null
        }
      />

      {/* SEARCH, FILTER & VIEW CONTROLS TOOLBAR */}
      <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', flexGrow: 1 }}>
          <TextField
            size="small"
            placeholder="Search by title, description, or instructor..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            sx={{ minWidth: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }
            }}
          />

          {/* Status Filter Chips */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`All (${metrics.total})`} 
              clickable 
              color={statusFilter === 'ALL' ? 'primary' : 'default'}
              variant={statusFilter === 'ALL' ? 'filled' : 'outlined'}
              onClick={() => { setStatusFilter('ALL'); setPage(0); }}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            />
            <Chip 
              label={`Published (${metrics.published})`} 
              clickable 
              color={statusFilter === 'PUBLISHED' ? 'success' : 'default'}
              variant={statusFilter === 'PUBLISHED' ? 'filled' : 'outlined'}
              onClick={() => { setStatusFilter('PUBLISHED'); setPage(0); }}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            />
            <Chip 
              label={`Drafts (${metrics.draft})`} 
              clickable 
              color={statusFilter === 'DRAFT' ? 'warning' : 'default'}
              variant={statusFilter === 'DRAFT' ? 'filled' : 'outlined'}
              onClick={() => { setStatusFilter('DRAFT'); setPage(0); }}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            />
          </Box>
        </Box>

        {/* View Mode Switcher */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'flex-end', md: 'center' } }}>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            aria-label="view mode"
            sx={{ borderRadius: 2 }}
          >
            <ToggleButton value="table" aria-label="table view">
              <Tooltip title="Table View">
                <ViewListIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <Tooltip title="Card Grid View">
                <ViewModuleIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Card>

      {/* COURSE CONTENT (TABLE OR GRID) */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
          <CircularProgress size={44} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Loading courses...
          </Typography>
        </Box>
      ) : filteredCourses.length === 0 ? (
        <EmptyState 
          title="No Courses Found" 
          description={searchQuery ? `No courses matching "${searchQuery}" in this filter.` : "There are currently no courses available. Create a new course to get started."}
          actionText={canCreate ? "Create Course" : undefined}
          onAction={canCreate ? handleOpenCreate : undefined}
          icon="books"
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 2 }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 2 }}>Instructor</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 2 }}>Status (Click to Toggle)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCourses.map((course) => {
                const instructorName = course.instructor_details 
                  ? `${course.instructor_details.first_name || course.instructor_details.username} ${course.instructor_details.last_name || ''}`.trim()
                  : 'Unassigned';

                return (
                  <TableRow key={course.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    {/* Course Title & Cover */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {course.image_url ? (
                          <Avatar 
                            variant="rounded" 
                            src={course.image_url} 
                            sx={{ width: 52, height: 52, borderRadius: 2, border: '1px solid #E2E8F0', objectFit: 'cover' }} 
                          />
                        ) : (
                          <Avatar 
                            variant="rounded" 
                            sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', width: 52, height: 52, fontWeight: 800, borderRadius: 2 }}
                          >
                            {course.title.substring(0, 2).toUpperCase()}
                          </Avatar>
                        )}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography 
                            component={RouterLink} 
                            to={`/courses/${course.id}`} 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 700, 
                              color: 'text.primary', 
                              textDecoration: 'none', 
                              '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 320
                            }}
                          >
                            {course.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: #{course.id} • Created {new Date(course.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Instructor */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: '0.8rem', bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main', fontWeight: 700 }}>
                          {instructorName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                          {instructorName}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Status Chip (Interactive Toggle) */}
                    <TableCell>
                      <Tooltip title={`Click to switch to ${course.is_published ? 'Draft' : 'Published'}`}>
                        <Chip 
                          icon={course.is_published ? <CheckCircleIcon sx={{ fontSize: '1rem !important' }} /> : <DraftIcon sx={{ fontSize: '1rem !important' }} />}
                          label={course.is_published ? 'Published' : 'Draft'} 
                          color={course.is_published ? 'success' : 'default'}
                          clickable
                          onClick={() => handleTogglePublish(course)}
                          size="small"
                          sx={{ 
                            fontWeight: 700, 
                            borderRadius: 2, 
                            px: 1, 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': { transform: 'scale(1.05)' }
                          }}
                        />
                      </Tooltip>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      {isMobile ? (
                        <>
                          <IconButton onClick={(e) => handleActionMenuClick(e, course.id)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={actionMenuAnchor}
                            open={Boolean(actionMenuAnchor) && activeCourseId === course.id}
                            onClose={handleActionMenuClose}
                          >
                            <MenuItem component={RouterLink} to={`/courses/${course.id}`} onClick={handleActionMenuClose}>
                              <LaunchIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> View Course
                            </MenuItem>
                            <MenuItem onClick={() => handleOpenBatches(course)}>
                              <GroupsIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} /> Batches & CSV Enrollment
                            </MenuItem>
                            <MenuItem onClick={() => handleOpenEdit(course)}>
                              <EditIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} /> Edit Details
                            </MenuItem>
                            {canCreate && (
                              <MenuItem onClick={() => confirmDelete(course)} sx={{ color: 'error.main' }}>
                                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Course
                              </MenuItem>
                            )}
                          </Menu>
                        </>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Manage Batches & CSV Enrollment">
                            <IconButton 
                              color="info" 
                              onClick={() => handleOpenBatches(course)}
                              size="small"
                              sx={{ bgcolor: alpha(theme.palette.info.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.18) } }}
                            >
                              <GroupsIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="View in Courseware">
                            <IconButton 
                              color="primary" 
                              component={RouterLink} 
                              to={`/courses/${course.id}`}
                              size="small"
                              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) } }}
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Course Details">
                            <IconButton 
                              color="secondary" 
                              onClick={() => handleOpenEdit(course)}
                              size="small"
                              sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.18) } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {canCreate && (
                            <Tooltip title="Delete Course">
                              <IconButton 
                                color="error" 
                                onClick={() => confirmDelete(course)} 
                                size="small"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.18) } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCourses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      ) : (
        /* CARD GRID VIEW */
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {paginatedCourses.map((course) => {
            const instructorName = course.instructor_details 
              ? `${course.instructor_details.first_name || course.instructor_details.username} ${course.instructor_details.last_name || ''}`.trim()
              : 'Unassigned';

            return (
              <Card 
                key={course.id} 
                variant="outlined" 
                sx={{ 
                  borderRadius: 3.5, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.08)',
                    borderColor: 'primary.light'
                  }
                }}
              >
                <Box sx={{ position: 'relative', pt: '52%' }}>
                  <CardMedia
                    component="img"
                    image={course.image_url || `https://picsum.photos/seed/${course.id}/600/340`}
                    alt={course.title}
                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Chip 
                    label={course.is_published ? 'Published' : 'Draft'} 
                    color={course.is_published ? 'success' : 'default'}
                    size="small"
                    clickable
                    onClick={() => handleTogglePublish(course)}
                    sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700, borderRadius: 2 }}
                  />
                </Box>

                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || 'No description provided for this course module.'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid #F1F5F9', mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 26, height: 26, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                        {instructorName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {instructorName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Manage Batches & CSV Enrollment">
                        <IconButton size="small" color="info" onClick={() => handleOpenBatches(course)}>
                          <GroupsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Course">
                        <IconButton component={RouterLink} to={`/courses/${course.id}`} size="small" color="primary">
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Details">
                        <IconButton size="small" color="secondary" onClick={() => handleOpenEdit(course)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canCreate && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => confirmDelete(course)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* CREATE / EDIT COURSE DIALOG */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {dialogMode === 'create' ? 'Create New Course' : `Edit Course Details (#${editingCourseId})`}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '10px !important' }}>
          <TextField
            autoFocus
            label="Course Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Advanced Web Engineering with React"
          />

          <TextField
            label="Course Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe course objectives and curriculum overview..."
          />

          {/* Instructor Select */}
          <FormControl fullWidth>
            <InputLabel id="instructor-select-label">Assign Instructor</InputLabel>
            <Select
              labelId="instructor-select-label"
              value={formData.instructor}
              label="Assign Instructor"
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.first_name ? `${u.first_name} ${u.last_name}` : u.username} ({u.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Cover Image Upload / URL */}
          <Box sx={{ p: 2, border: '1px dashed #CBD5E1', borderRadius: 2.5, bgcolor: '#F8FAFC' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Course Cover Thumbnail</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Button
                variant="outlined"
                component="label"
                disabled={uploadingImage}
                startIcon={uploadingImage ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                size="small"
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                {uploadingImage ? 'Uploading...' : 'Upload Image File'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">PNG, JPG, or WEBP</Typography>
            </Box>

            <TextField
              size="small"
              fullWidth
              label="Or Image URL"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />

            {formData.image_url && (
              <Box sx={{ mt: 1.5, position: 'relative', height: 110, borderRadius: 2, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <img 
                  src={formData.image_url} 
                  alt="Thumbnail Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </Box>
            )}
          </Box>

          {/* Publish Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Publish Course
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Published courses are immediately accessible to enrolled students.
                </Typography>
              </Box>
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDialog} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button 
            onClick={handleSaveCourse} 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            {dialogMode === 'create' ? 'Create Course' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, courseId: null })}
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Delete Course Permanently?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {deleteDialog.courseTitle ? `"${deleteDialog.courseTitle}"` : 'this course'}? This action cannot be undone. All modules, topics, and learner progress will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, courseId: null })} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* COURSE BATCHES & CSV ENROLLMENT DIALOG */}
      <CourseBatchDialog
        open={batchDialogOpen}
        onClose={() => setBatchDialogOpen(false)}
        courseId={batchCourse?.id || null}
        courseTitle={batchCourse?.title || ''}
      />
    </Box>
  );
};

export default CourseManagement;
