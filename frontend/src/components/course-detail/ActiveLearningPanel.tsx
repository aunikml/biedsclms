import React, { useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, TextField,
  Button, IconButton, Avatar, Chip,
  Card, Stack, alpha, useTheme
} from '@mui/material';

import {
  Forum as DiscussionIcon,
  AttachFile as ResourceIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import type { ContentComponent, DiscussionPost } from './courseTypes';

interface ActiveLearningPanelProps {
  activeComp: ContentComponent | null;
  discussions: DiscussionPost[];
  onAddDiscussionPost: (text: string) => void;
  allComponents?: ContentComponent[];
}

const ActiveLearningPanel: React.FC<ActiveLearningPanelProps> = ({
  activeComp,
  discussions,
  onAddDiscussionPost,
  allComponents = []
}) => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);

  // Q&A state
  const [qaInput, setQaInput] = useState('');
  const [filterCurrentUnitOnly, setFilterCurrentUnitOnly] = useState(true);

  const handlePostQA = () => {
    if (!qaInput.trim()) return;
    onAddDiscussionPost(qaInput.trim());
    setQaInput('');
  };

  // Filter discussions
  const filteredDiscussions = filterCurrentUnitOnly && activeComp
    ? discussions.filter(d => !d.unitId || d.unitId === activeComp.id)
    : discussions;

  // Filter downloadable resources from allComponents
  const resourceComponents = allComponents.filter(c => 
    c.type === 'PDF' || c.type === 'DOCX' || c.type === 'LINK' || c.type === 'GOOGLE_SLIDES' || c.type === 'POWERPOINT'
  );

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        borderRadius: 3.5, 
        overflow: 'hidden', 
        borderColor: '#E2E8F0', 
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)'
      }}
    >
      {/* TABS HEADER */}
      <Box sx={{ borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
        <Tabs 
          value={tabIndex} 
          onChange={(_, val) => setTabIndex(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': { fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', py: 1.25 }
          }}
        >
          <Tab icon={<DiscussionIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Lesson Q&A (${filteredDiscussions.length})`} />
          <Tab icon={<ResourceIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Downloads & Assets (${resourceComponents.length})`} />
        </Tabs>
      </Box>

      {/* ======================================================== */}
      {/* TAB 0: CONTEXTUAL UNIT Q&A                               */}
      {/* ======================================================== */}
      {tabIndex === 0 && (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Lesson Questions & Discussion {activeComp ? `• ${activeComp.title}` : ''}
            </Typography>
            <Button
              size="small"
              onClick={() => setFilterCurrentUnitOnly(!filterCurrentUnitOnly)}
              sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
            >
              {filterCurrentUnitOnly ? "View All Course Questions" : "Filter To Current Unit"}
            </Button>
          </Box>

          {/* ASK QUESTION INPUT */}
          <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2.5, bgcolor: '#F8FAFC' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                placeholder={`Ask a question or start discussion about "${activeComp?.title || 'this lesson'}"...`}
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
              />
              <IconButton 
                color="primary" 
                onClick={handlePostQA}
                disabled={!qaInput.trim()}
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }, p: 1.5 }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Card>

          {/* DISCUSSIONS LIST */}
          {filteredDiscussions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
              <Typography variant="body2" color="text.secondary">
                No questions asked for this lesson yet. Be the first to ask!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredDiscussions.map((post) => {
                const isInstructor = post.role === 'Instructor' || post.role === 'ADMIN' || post.role === 'TEACHER';
                return (
                  <Card key={post.id} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: isInstructor ? 'secondary.main' : 'primary.main', fontWeight: 700 }}>
                          {post.author.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                            {post.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {post.role} • {post.time}
                          </Typography>
                        </Box>
                      </Box>
                      {post.unitTitle && (
                        <Chip label={post.unitTitle} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.5, pl: 0.5 }}>
                      {post.text}
                    </Typography>

                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      )}

      {/* ======================================================== */}
      {/* TAB 1: DOWNLOADABLE ASSETS & RESOURCES                   */}
      {/* ======================================================== */}
      {tabIndex === 1 && (
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
            Downloadable Course Materials & References
          </Typography>

          {resourceComponents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
              <Typography variant="body2" color="text.secondary">
                No supplementary files or downloadable assets attached to this course.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {resourceComponents.map((res) => (
                <Card 
                  key={res.id} 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: '#F8FAFC' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ResourceIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {res.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Format: {res.type}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={res.type === 'LINK' ? <OpenInNewIcon /> : <DownloadIcon />}
                    component="a"
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    {res.type === 'LINK' ? 'Open Link' : 'Download'}
                  </Button>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ActiveLearningPanel;
