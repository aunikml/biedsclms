import React, { useState } from 'react';
import {
  Box, Typography, Paper, Accordion, AccordionSummary,
  AccordionDetails, List, ListItemButton, Avatar, Chip,
  TextField, InputAdornment, Tooltip, LinearProgress,
  Button, IconButton, alpha, useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  CheckCircle as CompleteIcon,
  RadioButtonUnchecked as IncompleteIcon,
  Lock as LockIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayCircleOutlined as VideoIcon,
  Audiotrack as AudioIcon,
  YouTube as YouTubeIcon,
  CloudQueue as DriveIcon,
  PictureAsPdf as PdfIcon,
  Description as DocxIcon,
  Link as LinkIcon,
  Slideshow as SlidesIcon,
  CoPresent as PptIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  MenuBook as BookIcon
} from '@mui/icons-material';
import type { Topic, ContentComponent } from './courseTypes';

interface CurriculumSidebarProps {
  topics: Topic[];
  selectedTopicId: number | null;
  selectedCompId: number | null;
  onSelectTopic: (topicId: number) => void;
  onSelectComponent: (compId: number, topicId: number) => void;
  isEditMode?: boolean;
  onAddSection?: () => void;
  onEditSection?: (topic: Topic) => void;
  onDeleteSection?: (topicId: number) => void;
  onAddActivityOrResource?: (topicId: number) => void;
  onEditComponent?: (comp: ContentComponent, topicId: number) => void;
  onDeleteComponent?: (compId: number) => void;
}

const CurriculumSidebar: React.FC<CurriculumSidebarProps> = ({
  topics,
  selectedTopicId,
  selectedCompId,
  onSelectTopic,
  onSelectComponent,
  isEditMode = false,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onAddActivityOrResource,
  onEditComponent,
  onDeleteComponent
}) => {
  const theme = useTheme();
  const [searchFilter, setSearchFilter] = useState('');

  const getComponentIcon = (type: ContentComponent['type']) => {
    switch (type) {
      case 'YOUTUBE': return <YouTubeIcon sx={{ color: '#EF4444', fontSize: 18 }} />;
      case 'GOOGLE_DRIVE': return <DriveIcon sx={{ color: '#3B82F6', fontSize: 18 }} />;
      case 'VIDEO': return <VideoIcon sx={{ color: '#007582', fontSize: 18 }} />;
      case 'AUDIO': return <AudioIcon sx={{ color: '#8B5CF6', fontSize: 18 }} />;
      case 'PDF': return <PdfIcon sx={{ color: '#EF4444', fontSize: 18 }} />;
      case 'DOCX': return <DocxIcon sx={{ color: '#2563EB', fontSize: 18 }} />;
      case 'LINK': return <LinkIcon sx={{ color: '#10B981', fontSize: 18 }} />;
      case 'GOOGLE_SLIDES': return <SlidesIcon sx={{ color: '#F59E0B', fontSize: 18 }} />;
      case 'POWERPOINT': return <PptIcon sx={{ color: '#EA580C', fontSize: 18 }} />;
      case 'ASSIGNMENT': return <AssignmentIcon sx={{ color: '#0284C7', fontSize: 18 }} />;
      case 'QUIZ': return <QuizIcon sx={{ color: '#EC4899', fontSize: 18 }} />;
      default: return <BookIcon sx={{ fontSize: 18 }} />;
    }
  };

  const getComponentTypeLabel = (type: ContentComponent['type']) => {
    switch (type) {
      case 'YOUTUBE': case 'VIDEO': return 'Video';
      case 'AUDIO': return 'Audio';
      case 'QUIZ': return 'Quiz';
      case 'ASSIGNMENT': return 'Assignment';
      case 'PDF': return 'PDF Reading';
      case 'DOCX': return 'Doc File';
      case 'GOOGLE_SLIDES': case 'POWERPOINT': return 'Slide Deck';
      case 'LINK': return 'Web Link';
      default: return 'Reading';
    }
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        borderRadius: 3.5, 
        overflow: 'hidden', 
        borderColor: '#E2E8F0', 
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
        position: { lg: 'sticky' },
        top: { lg: 24 },
        maxHeight: { lg: 'calc(100vh - 48px)' }
      }}
    >
      {/* HEADER */}
      <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Course Curriculum
          </Typography>
          <Chip 
            label={`${topics.length} Sections`} 
            size="small" 
            sx={{ fontWeight: 700, bgcolor: '#EDF2F7', color: '#475569', borderRadius: 1.5 }} 
          />
        </Box>

        {/* SEARCH BAR */}
        <TextField
          size="small"
          fullWidth
          placeholder="Filter lessons or units..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF' } }}
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

      {/* SECTIONS ACCORDION LIST */}
      <Box sx={{ overflowY: 'auto', flexGrow: 1, minHeight: 0 }}>
        {topics.map((topic, topicIdx) => {
          const isTopicSelected = topic.id === selectedTopicId;
          const comps = [...(topic.components || [])].sort((a, b) => a.order - b.order);
          
          // Filter components if search query is active
          const filteredComps = searchFilter.trim() 
            ? comps.filter(c => c.title.toLowerCase().includes(searchFilter.toLowerCase()) || c.type.toLowerCase().includes(searchFilter.toLowerCase()))
            : comps;

          if (searchFilter.trim() && filteredComps.length === 0 && !topic.name.toLowerCase().includes(searchFilter.toLowerCase())) {
            return null;
          }

          const completedCount = comps.filter(c => c.completed).length;
          const sectionPercent = comps.length > 0 ? Math.round((completedCount / comps.length) * 100) : 0;

          return (
            <Accordion 
              key={topic.id} 
              expanded={isTopicSelected || Boolean(searchFilter.trim())}
              onChange={() => onSelectTopic(topic.id)}
              disableGutters
              sx={{ 
                borderBottom: '1px solid #E2E8F0', 
                '&:before': { display: 'none' },
                bgcolor: isTopicSelected ? alpha(theme.palette.primary.main, 0.02) : 'white'
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />} 
                sx={{ 
                  px: 2, 
                  py: 1, 
                  minHeight: 56,
                  bgcolor: isTopicSelected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      fontSize: '0.8rem', 
                      bgcolor: isTopicSelected ? 'primary.main' : '#64748B', 
                      fontWeight: 800 
                    }}
                  >
                    {topicIdx + 1}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#0F172A', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}
                    >
                      {topic.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                      <Typography variant="caption" color="text.secondary">
                        {completedCount}/{comps.length} done
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={sectionPercent} 
                        sx={{ width: 44, height: 4, borderRadius: 2, bgcolor: '#E2E8F0' }} 
                      />
                    </Box>
                  </Box>

                  {/* EDIT MODE CONTROLS FOR SECTION */}
                  {isEditMode && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Edit Section">
                        <IconButton size="small" onClick={() => onEditSection?.(topic)}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Section">
                        <IconButton size="small" color="error" onClick={() => onDeleteSection?.(topic.id)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0, bgcolor: '#FFFFFF' }}>
                <List disablePadding>
                  {filteredComps.map((comp, compIdx) => {
                    const isSelected = comp.id === selectedCompId;
                    
                    // Determine sequential lock status
                    let isLocked = false;
                    let lockReason = '';
                    if (topic.sequential_lock && compIdx > 0) {
                      const prevComp = comps[compIdx - 1];
                      if (!prevComp.completed) {
                        isLocked = true;
                        lockReason = `Locked: Complete "${prevComp.title}" first.`;
                      }
                    } else if (comp.sequential_lock && compIdx > 0) {
                      const prevComp = comps[compIdx - 1];
                      if (!prevComp.completed) {
                        isLocked = true;
                        lockReason = `Locked: Complete preceding unit first.`;
                      }
                    }

                    return (
                      <Tooltip key={comp.id} title={isLocked ? lockReason : comp.title} placement="right">
                        <span>
                          <ListItemButton
                            disabled={isLocked && !isEditMode}
                            onClick={() => onSelectComponent(comp.id, topic.id)}
                            sx={{
                              py: 1.25,
                              px: 2,
                              pl: 3.5,
                              borderLeft: isSelected ? '4px solid' : '4px solid transparent',
                              borderColor: isSelected ? 'primary.main' : 'transparent',
                              bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                              opacity: isLocked ? 0.5 : 1,
                              '&:hover': {
                                bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.12) : '#F8FAFC'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', minWidth: 0 }}>
                              {/* Completion or Lock Indicator */}
                              {isLocked ? (
                                <LockIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                              ) : comp.completed ? (
                                <CompleteIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                              ) : (
                                <IncompleteIcon sx={{ fontSize: 18, color: '#CBD5E1' }} />
                              )}

                              {/* Content Type Icon */}
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getComponentIcon(comp.type)}
                              </Box>

                              {/* Title & Type badge */}
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: isSelected ? 700 : 500, 
                                    color: isSelected ? 'primary.main' : '#1E293B',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1.2
                                  }}
                                >
                                  {comp.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                  {getComponentTypeLabel(comp.type)}
                                  {comp.strict_completion && ' • Strict Complete 🔒'}
                                </Typography>
                              </Box>

                              {/* EDIT MODE CONTROLS FOR RESOURCE */}
                              {isEditMode && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                  <Tooltip title="Edit Resource Details">
                                    <IconButton size="small" onClick={() => onEditComponent?.(comp, topic.id)}>
                                      <EditIcon sx={{ fontSize: 15 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Resource">
                                    <IconButton size="small" color="error" onClick={() => onDeleteComponent?.(comp.id)}>
                                      <DeleteIcon sx={{ fontSize: 15 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                            </Box>
                          </ListItemButton>
                        </span>
                      </Tooltip>
                    );
                  })}
                </List>

                {/* MOODLE STYLE: + ADD AN ACTIVITY OR RESOURCE BUTTON */}
                {isEditMode && (
                  <Box sx={{ p: 1.5, px: 2, bgcolor: '#F8FAFC', borderTop: '1px dashed #CBD5E1', display: 'flex', justifyContent: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddActivityOrResource?.(topic.id);
                      }}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        width: '100%',
                        py: 0.75,
                        borderStyle: 'dashed',
                        bgcolor: 'white'
                      }}
                    >
                      + Add an activity or resource
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* MOODLE STYLE: + ADD SECTION BUTTON */}
        {isEditMode && (
          <Box sx={{ p: 2, bgcolor: '#F1F5F9', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAddSection}
              sx={{ borderRadius: 2.5, fontWeight: 800, width: '100%', py: 1 }}
            >
              + Add Section / Topic
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CurriculumSidebar;
