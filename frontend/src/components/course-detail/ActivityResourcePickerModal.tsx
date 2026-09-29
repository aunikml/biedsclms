import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Tabs, Tab, Card,
  IconButton, Chip, TextField, InputAdornment, alpha, useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  YouTube as YouTubeIcon,
  PlayCircleOutlined as VideoIcon,
  Audiotrack as AudioIcon,
  CloudQueue as DriveIcon,
  PictureAsPdf as PdfIcon,
  Description as DocxIcon,
  Slideshow as SlidesIcon,
  CoPresent as PptIcon,
  Link as LinkIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import type { ContentComponent } from './courseTypes';

interface ActivityResourceOption {
  type: ContentComponent['type'];
  category: 'activity' | 'resource';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

const OPTIONS: ActivityResourceOption[] = [
  // ACTIVITIES
  {
    type: 'QUIZ',
    category: 'activity',
    title: 'Interactive Graded Quiz',
    description: 'Multiple-choice knowledge check with instant feedback, scoring, and attempts tracking.',
    icon: <QuizIcon fontSize="medium" />,
    color: '#EC4899',
    badge: 'Graded'
  },
  {
    type: 'ASSIGNMENT',
    category: 'activity',
    title: 'Practical Assignment Task',
    description: 'Submission dropzone where learners upload assignment files (PDF, ZIP, DOCX) for grading.',
    icon: <AssignmentIcon fontSize="medium" />,
    color: '#0284C7',
    badge: 'Graded'
  },
  // RESOURCES
  {
    type: 'YOUTUBE',
    category: 'resource',
    title: 'YouTube Video Lecture',
    description: 'Embed video from YouTube with optional strict anti-skip completion enforcement.',
    icon: <YouTubeIcon fontSize="medium" />,
    color: '#EF4444'
  },
  {
    type: 'VIDEO',
    category: 'resource',
    title: 'Custom MP4 Video',
    description: 'Direct MP4 video URL or uploaded file with player controls and playback tracking.',
    icon: <VideoIcon fontSize="medium" />,
    color: '#007582'
  },
  {
    type: 'AUDIO',
    category: 'resource',
    title: 'Audio Lecture File',
    description: 'Audio podcast or lecture recording (MP3/WAV) with dedicated audio player.',
    icon: <AudioIcon fontSize="medium" />,
    color: '#8B5CF6'
  },
  {
    type: 'GOOGLE_DRIVE',
    category: 'resource',
    title: 'Google Drive Video / File',
    description: 'Embed videos or documents hosted on Google Drive using preview URL.',
    icon: <DriveIcon fontSize="medium" />,
    color: '#3B82F6'
  },
  {
    type: 'PDF',
    category: 'resource',
    title: 'PDF Reading Document',
    description: 'Required reading document or handbook with preview and tab opening.',
    icon: <PdfIcon fontSize="medium" />,
    color: '#DC2626'
  },
  {
    type: 'DOCX',
    category: 'resource',
    title: 'Word Document (.docx)',
    description: 'Downloadable structured lecture notes or exercise worksheets.',
    icon: <DocxIcon fontSize="medium" />,
    color: '#2563EB'
  },
  {
    type: 'GOOGLE_SLIDES',
    category: 'resource',
    title: 'Google Slides Presentation',
    description: 'Embed and link interactive presentation slide decks.',
    icon: <SlidesIcon fontSize="medium" />,
    color: '#F59E0B'
  },
  {
    type: 'POWERPOINT',
    category: 'resource',
    title: 'PowerPoint (.pptx) Deck',
    description: 'Presentation deck file available for learner download and review.',
    icon: <PptIcon fontSize="medium" />,
    color: '#EA580C'
  },
  {
    type: 'LINK',
    category: 'resource',
    title: 'External Web Link',
    description: 'Curated external reference website, documentation, or tool.',
    icon: <LinkIcon fontSize="medium" />,
    color: '#10B981'
  }
];

interface ActivityResourcePickerModalProps {
  open: boolean;
  onClose: () => void;
  sectionName?: string;
  onSelect: (type: ContentComponent['type']) => void;
}

const ActivityResourcePickerModal: React.FC<ActivityResourcePickerModalProps> = ({
  open,
  onClose,
  sectionName,
  onSelect
}) => {
  const theme = useTheme();
  const [tabFilter, setTabFilter] = useState<'all' | 'activity' | 'resource'>('all');
  const [search, setSearch] = useState('');

  const filtered = OPTIONS.filter(opt => {
    if (tabFilter !== 'all' && opt.category !== tabFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return opt.title.toLowerCase().includes(q) || opt.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
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
            maxHeight: '85vh',
            boxShadow: '0 24px 50px rgba(15, 23, 42, 0.2)'
          }
        }
      }}
    >
      {/* MOODLE STYLE HEADER */}
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
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            Add an activity or resource
          </Typography>
          {sectionName && (
            <Typography variant="caption" color="text.secondary">
              Target Section: <strong>{sectionName}</strong>
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* FILTER CONTROLS & SEARCH */}
      <Box sx={{ px: 3, pt: 2, pb: 1, bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Tabs
          value={tabFilter}
          onChange={(_, val) => setTabFilter(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', minHeight: 40, py: 0.5 }
          }}
        >
          <Tab value="all" label="All" />
          <Tab value="activity" label="Activities (2)" />
          <Tab value="resource" label="Resources (9)" />
        </Tabs>

        <TextField
          size="small"
          placeholder="Search activity or resource..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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

      {/* CARDS GRID */}
      <DialogContent sx={{ p: 3, bgcolor: '#F8FAFC' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {filtered.map((item) => (
            <Card
              key={item.type}
              variant="outlined"
              onClick={() => {
                onSelect(item.type);
                onClose();
              }}
              sx={{
                p: 2.25,
                borderRadius: 3,
                cursor: 'pointer',
                bgcolor: '#FFFFFF',
                borderColor: '#E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: item.color,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 10px 22px ${alpha(item.color, 0.15)}`
                }
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: alpha(item.color, 0.12),
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Chip
                    label={item.category === 'activity' ? 'Activity' : 'Resource'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      height: 20,
                      bgcolor: item.category === 'activity' ? alpha(theme.palette.secondary.main, 0.1) : alpha(theme.palette.primary.main, 0.08),
                      color: item.category === 'activity' ? 'secondary.main' : 'primary.main',
                      borderRadius: 1.5
                    }}
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4, mb: 1.5 }}>
                  {item.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: item.color, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Select <ArrowForwardIcon sx={{ fontSize: 13 }} />
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityResourcePickerModal;
