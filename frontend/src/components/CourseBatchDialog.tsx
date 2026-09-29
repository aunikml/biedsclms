import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton, TextField, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Avatar, Tooltip, Alert, CircularProgress,
  Card, InputAdornment, Stack,
  TablePagination, alpha, useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Group as GroupIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutlined as ErrorIcon,
  School as SchoolIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import api from '../api/axios';

export interface BatchStudent {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  date_joined?: string;
}

export interface Batch {
  id: number;
  course: number;
  course_title: string;
  name: string;
  student_count: number;
  students?: BatchStudent[];
  created_at: string;
}

interface CourseBatchDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: number | null;
  courseTitle: string;
}

const CourseBatchDialog: React.FC<CourseBatchDialogProps> = ({
  open,
  onClose,
  courseId,
  courseTitle,
}) => {
  const theme = useTheme();

  // Batches state
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Create Batch state
  const [createBatchOpen, setCreateBatchOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [creatingBatch, setCreatingBatch] = useState(false);

  // Active Batch Students state
  const [students, setStudents] = useState<BatchStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(0);
  const [studentRowsPerPage, setStudentRowsPerPage] = useState(5);

  // Manual Add Student Dialog
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [addingStudent, setAddingStudent] = useState(false);

  // CSV Upload Dialog & Progress
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    created_count: number;
    existing_count: number;
    errors: { row: number; email?: string; error: string }[];
  } | null>(null);

  // Feedback Snackbar / Alert
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch batches for this course
  const fetchBatches = async () => {
    if (!courseId) return;
    try {
      setLoadingBatches(true);
      const res = await api.get(`batches/?course=${courseId}`);
      setBatches(res.data);
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: 'error',
        message: 'Failed to load course batches.'
      });
    } finally {
      setLoadingBatches(false);
    }
  };

  // Fetch single batch detail with students
  const fetchBatchDetail = async (batchId: number) => {
    try {
      setLoadingStudents(true);
      const res = await api.get(`batches/${batchId}/`);
      setSelectedBatch(res.data);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: 'Failed to load batch student details.'
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (open && courseId) {
      fetchBatches();
      setSelectedBatch(null);
      setStudents([]);
      setNotification(null);
      setUploadResult(null);
    }
  }, [open, courseId]);

  // Create new batch
  const handleCreateBatch = async () => {
    if (!newBatchName.trim() || !courseId) return;
    try {
      setCreatingBatch(true);
      const res = await api.post('batches/', {
        course: courseId,
        name: newBatchName.trim(),
      });
      setBatches(prev => [res.data, ...prev]);
      setNewBatchName('');
      setCreateBatchOpen(false);
      setNotification({
        type: 'success',
        message: `Batch "${res.data.name}" created successfully!`
      });
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to create batch.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setCreatingBatch(false);
    }
  };

  // Delete batch
  const handleDeleteBatch = async (batchId: number, batchName: string) => {
    if (!window.confirm(`Are you sure you want to delete batch "${batchName}"?`)) return;
    try {
      await api.delete(`batches/${batchId}/`);
      setBatches(prev => prev.filter(b => b.id !== batchId));
      if (selectedBatch?.id === batchId) {
        setSelectedBatch(null);
      }
      setNotification({
        type: 'info',
        message: `Batch "${batchName}" deleted.`
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to delete batch.' });
    }
  };

  // Open Batch details
  const handleSelectBatch = (batch: Batch) => {
    fetchBatchDetail(batch.id);
  };

  // Download Sample CSV Template
  const handleDownloadSample = () => {
    const csvContent = "firstname,lastname,email\nJohn,Doe,john.doe@example.com\nJane,Smith,jane.smith@example.com\nAlex,Johnson,alex.j@example.com\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `student_batch_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle CSV file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Submit CSV Upload
  const handleUploadCsv = async () => {
    if (!selectedFile || !selectedBatch) return;
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploadingCsv(true);
      setUploadResult(null);
      const res = await api.post(`batches/${selectedBatch.id}/upload_csv/`, formData);
      setUploadResult(res.data);
      // Refresh batch students
      await fetchBatchDetail(selectedBatch.id);
      await fetchBatches();
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Failed to upload CSV file.';
      setUploadResult({
        success: false,
        message: errorMsg,
        created_count: 0,
        existing_count: 0,
        errors: []
      });
    } finally {
      setUploadingCsv(false);
    }
  };

  // Manual Add Student Submit
  const handleAddStudentSubmit = async () => {
    if (!selectedBatch || !newStudentData.email.trim()) return;
    try {
      setAddingStudent(true);
      const res = await api.post(`batches/${selectedBatch.id}/add_student/`, newStudentData);
      setNotification({
        type: 'success',
        message: res.data.message
      });
      setNewStudentData({ first_name: '', last_name: '', email: '' });
      setAddStudentOpen(false);
      await fetchBatchDetail(selectedBatch.id);
      await fetchBatches();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to add student.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setAddingStudent(false);
    }
  };

  // Remove Student from Batch
  const handleRemoveStudent = async (studentId: number, studentName: string) => {
    if (!selectedBatch) return;
    if (!window.confirm(`Remove ${studentName} from batch "${selectedBatch.name}"?`)) return;

    try {
      await api.post(`batches/${selectedBatch.id}/remove_student/`, { student_id: studentId });
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setNotification({
        type: 'info',
        message: `${studentName} removed from batch.`
      });
      await fetchBatches();
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to remove student.' });
    }
  };

  // Filter students by search
  const filteredStudents = students.filter(s => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    return fullName.includes(q) || s.email.toLowerCase().includes(q) || s.username.toLowerCase().includes(q);
  });

  const paginatedStudents = filteredStudents.slice(
    studentPage * studentRowsPerPage,
    studentPage * studentRowsPerPage + studentRowsPerPage
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              overflow: 'hidden',
              minHeight: 520,
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.16)'
            }
          }
        }}
      >
        {/* HEADER */}
        <DialogTitle
          sx={{
            p: 2.5,
            bgcolor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {selectedBatch && (
              <IconButton
                size="small"
                onClick={() => { setSelectedBatch(null); setUploadResult(null); }}
                sx={{ bgcolor: '#EDF2F7', mr: 0.5, '&:hover': { bgcolor: '#E2E8F0' } }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', width: 40, height: 40 }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                {selectedBatch ? `Batch: ${selectedBatch.name}` : 'Course Batches & Enrollment'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {courseTitle}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* NOTIFICATION BANNER */}
        {notification && (
          <Alert
            severity={notification.type}
            onClose={() => setNotification(null)}
            sx={{ mx: 3, mt: 2, borderRadius: 2 }}
          >
            {notification.message}
          </Alert>
        )}

        <DialogContent sx={{ p: 3 }}>
          {/* ======================================================== */}
          {/* VIEW 1: BATCHES LIST FOR THIS COURSE                     */}
          {/* ======================================================== */}
          {!selectedBatch ? (
            <Box>
              {/* TOP ACTION BAR */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    Active Batches ({batches.length})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create cohorts/batches with labels and manage student enrollment access.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateBatchOpen(true)}
                  sx={{ borderRadius: 2.5, px: 2.5, fontWeight: 700 }}
                >
                  Create New Batch
                </Button>
              </Box>

              {/* INLINE CREATE BATCH FORM */}
              {createBatchOpen && (
                <Card variant="outlined" sx={{ mb: 3, p: 2.5, borderRadius: 3, bgcolor: '#F8FAFC', border: '1.5px dashed #CBD5E1' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#0F172A' }}>
                    Create a New Batch Cohort
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                      autoFocus
                      size="small"
                      placeholder="e.g., Batch 01 - Fall 2026 or Group A"
                      value={newBatchName}
                      onChange={(e) => setNewBatchName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCreateBatch(); }}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF' } }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleCreateBatch}
                      disabled={creatingBatch || !newBatchName.trim()}
                      sx={{ borderRadius: 2, px: 3, fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                      {creatingBatch ? <CircularProgress size={20} color="inherit" /> : 'Save Batch'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => { setCreateBatchOpen(false); setNewBatchName(''); }}
                      sx={{ borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Card>
              )}

              {/* BATCHES LIST OR EMPTY STATE */}
              {loadingBatches ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={36} />
                </Box>
              ) : batches.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px dashed #CBD5E1', px: 3 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <GroupIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                    No Batches Created Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', mb: 2.5 }}>
                    In this course, you can organize students into separate cohorts/batches with custom labels and add students via CSV bulk upload.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateBatchOpen(true)}
                    sx={{ borderRadius: 2.5, fontWeight: 700 }}
                  >
                    Create First Batch
                  </Button>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {batches.map((batch) => (
                    <Card
                      key={batch.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        borderColor: '#E2E8F0',
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.06)',
                          borderColor: 'primary.light'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.12), color: 'secondary.main', width: 44, height: 44, fontWeight: 800 }}>
                          <GroupIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
                            {batch.name}
                            <Chip
                              label={`${batch.student_count || 0} Students`}
                              size="small"
                              color={batch.student_count > 0 ? "primary" : "default"}
                              variant={batch.student_count > 0 ? "filled" : "outlined"}
                              sx={{ fontWeight: 700, borderRadius: 1.5, height: 22, fontSize: '0.75rem' }}
                            />
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created on {new Date(batch.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={() => handleSelectBatch(batch)}
                          sx={{ borderRadius: 2, px: 2, fontWeight: 700 }}
                        >
                          Manage Students & CSV
                        </Button>
                        <Tooltip title="Delete Batch">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteBatch(batch.id, batch.name)}
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.18) } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          ) : (
            /* ======================================================== */
            /* VIEW 2: SELECTED BATCH DETAIL (STUDENTS & CSV UPLOAD)     */
            /* ======================================================== */
            <Box>
              {/* ACTION TOOLBAR FOR THIS BATCH */}
              <Card variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: '#F8FAFC' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Enrolled Students ({students.length})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Batch: <strong>{selectedBatch.name}</strong> • Course: <strong>{courseTitle}</strong>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<UploadIcon />}
                      onClick={() => { setCsvUploadOpen(true); setUploadResult(null); }}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      Upload CSV
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadSample}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      Sample CSV
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setAddStudentOpen(true)}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      Add Student
                    </Button>
                  </Box>
                </Box>
              </Card>

              {/* SEARCH FILTER */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Filter enrolled students by name, email, or username..."
                  value={studentSearch}
                  onChange={(e) => { setStudentSearch(e.target.value); setStudentPage(0); }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
              </Box>

              {/* STUDENTS TABLE */}
              {loadingStudents ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={36} />
                </Box>
              ) : filteredStudents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', width: 48, height: 48, mx: 'auto', mb: 1.5 }}>
                    <PersonAddIcon />
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                    {studentSearch ? 'No students match your filter' : 'No Students Enrolled In This Batch Yet'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Upload a CSV file containing firstname, lastname, and email to instantly enroll students.
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<UploadIcon />}
                    onClick={() => setCsvUploadOpen(true)}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Upload CSV Now
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>Email / Username</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>Role</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedStudents.map((student) => {
                        const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.username;
                        return (
                          <TableRow key={student.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main', fontWeight: 700 }}>
                                  {fullName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                                  {fullName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: 'text.primary', fontFamily: 'monospace' }}>
                                {student.email || student.username}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={student.role || 'STUDENT'}
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ fontWeight: 700, borderRadius: 1.5, height: 22, fontSize: '0.7rem' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Remove student from batch">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveStudent(student.id, fullName)}
                                  sx={{ '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredStudents.length}
                    rowsPerPage={studentRowsPerPage}
                    page={studentPage}
                    onPageChange={(_, newPage) => setStudentPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setStudentRowsPerPage(parseInt(e.target.value, 10));
                      setStudentPage(0);
                    }}
                  />
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* CSV UPLOAD MODAL                                         */}
      {/* ======================================================== */}
      <Dialog
        open={csvUploadOpen}
        onClose={() => !uploadingCsv && setCsvUploadOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Bulk CSV Student Upload
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Required CSV Columns:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
              <code>firstname, lastname, email</code>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              • The <strong>email</strong> will be used as the account username.<br />
              • For newly added students, an account is created with their <strong>email as their initial password</strong>.<br />
              • If an account already exists, the student will simply be enrolled into this batch.
            </Typography>
          </Alert>

          {/* FILE PICKER / DROP AREA */}
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              p: 3,
              border: '2px dashed #94A3B8',
              borderRadius: 2.5,
              textAlign: 'center',
              bgcolor: selectedFile ? alpha(theme.palette.success.main, 0.05) : '#F8FAFC',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept=".csv"
              onChange={handleFileChange}
            />
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 48, height: 48, mx: 'auto', mb: 1.5 }}>
              <FileIcon />
            </Avatar>
            {selectedFile ? (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose a different file
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                  Click to select CSV File
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Accepts standard .csv files with UTF-8 encoding
                </Typography>
              </Box>
            )}
          </Box>

          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadSample}
            sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
          >
            Download Sample CSV Template
          </Button>

          {/* UPLOAD RESULT FEEDBACK */}
          {uploadResult && (
            <Box sx={{ mt: 1 }}>
              {uploadResult.success ? (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Upload Successful!
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {uploadResult.message}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    • <strong>{uploadResult.created_count}</strong> new account(s) created (initial password = email).<br />
                    • <strong>{uploadResult.existing_count}</strong> existing student(s) enrolled.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="error" icon={<ErrorIcon />} sx={{ borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Upload Failed
                  </Typography>
                  <Typography variant="body2">
                    {uploadResult.message}
                  </Typography>
                </Alert>
              )}

              {/* ROW-LEVEL ERRORS */}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#FEF2F2', borderRadius: 2, border: '1px solid #FCA5A5' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main', display: 'block', mb: 0.5 }}>
                    Row Issues ({uploadResult.errors.length}):
                  </Typography>
                  {uploadResult.errors.slice(0, 5).map((e, idx) => (
                    <Typography key={idx} variant="caption" sx={{ display: 'block', color: 'error.dark' }}>
                      Row {e.row}: {e.error} {e.email ? `(${e.email})` : ''}
                    </Typography>
                  ))}
                  {uploadResult.errors.length > 5 && (
                    <Typography variant="caption" color="text.secondary">
                      ...and {uploadResult.errors.length - 5} more
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCsvUploadOpen(false)} disabled={uploadingCsv}>
            {uploadResult?.success ? 'Done' : 'Cancel'}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleUploadCsv}
            disabled={!selectedFile || uploadingCsv}
            startIcon={uploadingCsv ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            {uploadingCsv ? 'Processing CSV...' : 'Process & Enroll Students'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* MANUAL SINGLE STUDENT ADD MODAL                          */}
      {/* ======================================================== */}
      <Dialog
        open={addStudentOpen}
        onClose={() => !addingStudent && setAddStudentOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Add Student to Batch
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="caption">
              If this student does not have an account yet, a new account will be created with their email as initial password.
            </Typography>
          </Alert>

          <TextField
            autoFocus
            label="First Name"
            size="small"
            fullWidth
            value={newStudentData.first_name}
            onChange={(e) => setNewStudentData({ ...newStudentData, first_name: e.target.value })}
          />

          <TextField
            label="Last Name"
            size="small"
            fullWidth
            value={newStudentData.last_name}
            onChange={(e) => setNewStudentData({ ...newStudentData, last_name: e.target.value })}
          />

          <TextField
            label="Email Address (Used as Username & Password)"
            size="small"
            type="email"
            fullWidth
            required
            value={newStudentData.email}
            onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
            placeholder="student@example.com"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddStudentOpen(false)} disabled={addingStudent}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddStudentSubmit}
            disabled={!newStudentData.email.trim() || addingStudent}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {addingStudent ? <CircularProgress size={18} color="inherit" /> : 'Enroll Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CourseBatchDialog;
