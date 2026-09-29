import React from 'react';
import {
  Box, Typography, Button, Paper, Card, CardContent,
  IconButton, Chip, Tooltip, Stack, alpha, useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Groups as GroupsIcon,
  Lock as LockIcon,
  Layers as SectionsIcon,
  AssignmentTurnedIn as StrictIcon
} from '@mui/icons-material';
import type { Topic, ContentComponent } from './courseTypes';

interface InstructorCommandPanelProps {
  topics: Topic[];
  onOpenTopicModal: (topic?: Topic) => void;
  onDeleteTopic: (topicId: number) => void;
  onOpenCompModal: (comp?: ContentComponent, topicId?: number) => void;
  onDeleteComponent: (compId: number) => void;
  onOpenBatchDialog: () => void;
  batchesCount?: number;
}

const InstructorCommandPanel: React.FC<InstructorCommandPanelProps> = ({
  topics,
  onOpenTopicModal,
  onDeleteTopic,
  onOpenCompModal,
  onDeleteComponent,
  onOpenBatchDialog,
  batchesCount = 0
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* TOP COMMAND HERO CARD */}
      <Card 
        variant="outlined" 
        sx={{ 
          p: 3, 
          borderRadius: 3.5, 
          bgcolor: '#0F172A', 
          color: 'white',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Instructor & Course Command Studio
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Configure pedagogical structure, enforce sequential unit locks, and manage cohort batch access.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="info"
              startIcon={<GroupsIcon />}
              onClick={onOpenBatchDialog}
              sx={{ borderRadius: 2.5, fontWeight: 700, px: 2.5 }}
            >
              Batches & CSV Enrollment ({batchesCount})
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onOpenTopicModal()}
              sx={{ bgcolor: '#00D1C1', color: '#00262B', '&:hover': { bgcolor: '#00B8AA' }, borderRadius: 2.5, fontWeight: 800, px: 2.5 }}
            >
              Add New Section
            </Button>
          </Box>
        </Box>
      </Card>

      {/* QUICK BATCH COHORTS ACCESS BAR */}
      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#F8FAFC', borderColor: '#CBD5E1' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1.25, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', borderRadius: 2 }}>
              <GroupsIcon />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Course Access Cohorts (Batches)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Students must belong to a batch or direct enrollment to access published units.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="info"
            size="small"
            startIcon={<GroupsIcon />}
            onClick={onOpenBatchDialog}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Manage Batches & Bulk CSV
          </Button>
        </Box>
      </Card>

      {/* SECTIONS & RESOURCES BUILDER */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SectionsIcon sx={{ color: 'primary.main' }} /> Course Syllabus Architecture
        </Typography>

        {topics.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              No Sections Created Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Begin building your course syllabus by creating your first module section.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => onOpenTopicModal()} sx={{ borderRadius: 2.5, fontWeight: 700 }}>
              Create First Section
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {topics.map((topic, topicIdx) => {
              const comps = [...(topic.components || [])].sort((a, b) => a.order - b.order);
              return (
                <Card 
                  key={topic.id} 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden', 
                    borderColor: '#E2E8F0',
                    boxShadow: '0 2px 12px rgba(15, 23, 42, 0.03)'
                  }}
                >
                  {/* SECTION HEADER */}
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#F8FAFC', 
                      borderBottom: '1px solid #E2E8F0', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip 
                        label={`Section ${topicIdx + 1}`} 
                        size="small" 
                        color="primary" 
                        sx={{ fontWeight: 800, borderRadius: 1.5 }} 
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {topic.name}
                      </Typography>
                      {topic.sequential_lock && (
                        <Tooltip title="Sequential Lock Enabled: Students must finish units in order">
                          <Chip 
                            icon={<LockIcon sx={{ fontSize: 13 }} />} 
                            label="Sequential Lock" 
                            size="small" 
                            color="warning" 
                            variant="outlined"
                            sx={{ fontWeight: 700, borderRadius: 1.5, height: 22, fontSize: '0.7rem' }} 
                          />
                        </Tooltip>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => onOpenCompModal(undefined, topic.id)}
                        sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.75rem' }}
                      >
                        Add Resource
                      </Button>
                      <IconButton size="small" onClick={() => onOpenTopicModal(topic)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onDeleteTopic(topic.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* SECTION UNITS */}
                  <CardContent sx={{ p: 2 }}>
                    {comps.length === 0 ? (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 1.5, textAlign: 'center' }}>
                        No content resources in this section yet. Click "Add Resource" to add video, documents, or quizzes.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {comps.map((c, cIdx) => (
                          <Paper
                            key={c.id}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              bgcolor: 'white',
                              borderColor: '#E2E8F0',
                              transition: 'all 0.15s',
                              '&:hover': { bgcolor: '#F8FAFC' }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', width: 20 }}>
                                #{cIdx + 1}
                              </Typography>
                              <Chip 
                                label={c.type} 
                                size="small" 
                                variant="outlined" 
                                sx={{ fontWeight: 700, borderRadius: 1.5, height: 22, fontSize: '0.7rem' }} 
                              />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {c.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 450 }}>
                                  {c.url}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {c.strict_completion && (
                                <Tooltip title="Strict anti-skip / full playback required">
                                  <Chip icon={<StrictIcon sx={{ fontSize: 13 }} />} label="Strict" size="small" color="secondary" sx={{ height: 20, fontSize: '0.65rem' }} />
                                </Tooltip>
                              )}
                              <IconButton size="small" onClick={() => onOpenCompModal(c, topic.id)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => onDeleteComponent(c.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default InstructorCommandPanel;
