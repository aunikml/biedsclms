import React, { useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, Button, TextField,
  Card, Stack, Chip, Tooltip, useTheme, alpha,
  ToggleButtonGroup, ToggleButton
} from '@mui/material';

import {
  Close as CloseIcon,
  StickyNote2 as NoteIcon,
  PlayCircleFilled as PlayIcon,
  DeleteOutlined as DeleteIcon,
  Download as DownloadIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  BookmarkBorder as BookmarkIcon
} from '@mui/icons-material';
import type { ContentComponent, StudentNote } from './courseTypes';

interface NotesSidebarProps {
  open: boolean;
  onClose: () => void;
  activeComp: ContentComponent | null;
  currentPlaybackTime: number;
  notes: StudentNote[];
  onAddNote: (noteText: string, timestampSeconds: number) => void;
  onDeleteNote: (noteId: string) => void;
  onSeekTo: (timestampSeconds: number) => void;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({
  open,
  onClose,
  activeComp,
  currentPlaybackTime,
  notes,
  onAddNote,
  onDeleteNote,
  onSeekTo
}) => {
  const theme = useTheme();
  const [noteInput, setNoteInput] = useState('');
  const [filterMode, setFilterMode] = useState<'current' | 'all'>('current');

  // Helper to format seconds as mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    onAddNote(noteInput.trim(), Math.floor(currentPlaybackTime));
    setNoteInput('');
  };

  const handleExportNotes = () => {
    if (notes.length === 0) return;
    let md = `# Course Study Notes\n\n`;
    notes.forEach((n) => {
      md += `### ${n.unitTitle} [${n.timestampText}]\n${n.noteText}\n*Created: ${n.createdAt}*\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `course_study_notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter notes
  const currentUnitNotes = notes.filter(n => n.compId === activeComp?.id);
  const displayedNotes = filterMode === 'current' ? currentUnitNotes : notes;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 400, md: 440 },
            bgcolor: '#FFFFFF',
            boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #E2E8F0',
            zIndex: theme.zIndex.drawer + 2
          }
        }
      }}
    >
      {/* SIDEBAR HEADER */}
      <Box 
        sx={{ 
          p: 2.5, 
          borderBottom: '1px solid #E2E8F0', 
          bgcolor: '#F8FAFC',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box 
            sx={{ 
              width: 38, 
              height: 38, 
              borderRadius: 2.5, 
              bgcolor: alpha(theme.palette.primary.main, 0.1), 
              color: 'primary.main',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <NoteIcon fontSize="small" />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Study Notes
              </Typography>
              <Chip 
                label={notes.length} 
                size="small" 
                color="primary" 
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 800 }} 
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {activeComp ? activeComp.title : 'Select a lesson'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {notes.length > 0 && (
            <Tooltip title="Export all notes as Markdown file">
              <IconButton size="small" onClick={handleExportNotes} sx={{ color: 'text.secondary' }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* FILTER TABS */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
        <ToggleButtonGroup
          value={filterMode}
          exclusive
          onChange={(_, val) => val && setFilterMode(val)}
          size="small"
          fullWidth
          sx={{
            bgcolor: '#F1F5F9',
            p: 0.5,
            borderRadius: 2,
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: 1.5,
              fontWeight: 700,
              fontSize: '0.78rem',
              py: 0.5,
              textTransform: 'none',
              '&.Mui-selected': {
                bgcolor: '#FFFFFF',
                color: 'primary.main',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }
            }
          }}
        >
          <ToggleButton value="current">
            Current Lesson ({currentUnitNotes.length})
          </ToggleButton>
          <ToggleButton value="all">
            All Course Notes ({notes.length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* NEW NOTE INPUT SECTION */}
      <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Chip
            icon={<TimeIcon sx={{ fontSize: 14 }} />}
            label={`At ${formatTime(currentPlaybackTime)}`}
            size="small"
            color="primary"
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          />
          <Typography variant="caption" color="text.secondary">
            Syncs to current timestamp
          </Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          placeholder="Type a key takeaway, formula, or timestamp note..."
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              fontSize: '0.88rem'
            }
          }}
        />

        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          disabled={!noteInput.trim()}
          onClick={handleSaveNote}
          sx={{
            mt: 1.5,
            py: 0.9,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.85rem'
          }}
        >
          Save Timestamped Note
        </Button>
      </Box>

      {/* NOTES LIST */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5 }}>
        {displayedNotes.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 6, 
              px: 3, 
              borderRadius: 3, 
              bgcolor: '#F8FAFC', 
              border: '1px dashed #CBD5E1' 
            }}
          >
            <BookmarkIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
              {filterMode === 'current' ? 'No notes for this lesson yet' : 'No notes in this course yet'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Take notes while watching videos or reading materials. You can jump back to exact timestamps anytime!
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {displayedNotes.map((note) => (
              <Card
                key={note.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  borderColor: '#E2E8F0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.08)'
                  }
                }}
              >
                {/* Note Top Bar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Tooltip title="Click to jump video to this timestamp">
                    <Chip
                      icon={<PlayIcon sx={{ fontSize: 13 }} />}
                      label={note.timestampText}
                      clickable
                      onClick={() => onSeekTo(note.timestampSeconds)}
                      size="small"
                      color="secondary"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        height: 22,
                        borderRadius: 1.5,
                        cursor: 'pointer'
                      }}
                    />
                  </Tooltip>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                      {note.createdAt}
                    </Typography>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => onDeleteNote(note.id)}
                      sx={{ p: 0.5 }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Lesson Title Badge (if viewing all course notes) */}
                {filterMode === 'all' && (
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.75 }}>
                    📌 {note.unitTitle}
                  </Typography>
                )}

                {/* Note Text */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.primary', 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: 1.55,
                    fontSize: '0.85rem'
                  }}
                >
                  {note.noteText}
                </Typography>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* FOOTER STATS */}
      <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {notes.length} total note{notes.length === 1 ? '' : 's'} across course
        </Typography>
        <Button
          size="small"
          variant="text"
          startIcon={<DownloadIcon />}
          disabled={notes.length === 0}
          onClick={handleExportNotes}
          sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
        >
          Export (.md)
        </Button>
      </Box>
    </Drawer>
  );
};

export default NotesSidebar;
