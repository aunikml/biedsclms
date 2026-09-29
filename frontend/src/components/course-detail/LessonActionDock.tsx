import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Button, Typography, Tooltip,
  LinearProgress, IconButton, alpha, useTheme
} from '@mui/material';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  CheckCircle as CompleteIcon,
  RadioButtonUnchecked as IncompleteIcon,
  Fullscreen as TheaterIcon,
  FullscreenExit as TheaterExitIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  StickyNote2 as NoteIcon
} from '@mui/icons-material';
import type { ContentComponent } from './courseTypes';

interface LessonActionDockProps {
  activeComp: ContentComponent | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleComplete: () => void;
  isTheaterMode: boolean;
  onToggleTheaterMode: () => void;
  triggerAutoAdvance?: boolean;
  isEditMode?: boolean;
  onEditComponent?: () => void;
  onDeleteComponent?: () => void;
  onToggleNotes?: () => void;
  notesCount?: number;
}


const LessonActionDock: React.FC<LessonActionDockProps> = ({
  activeComp,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onToggleComplete,
  isTheaterMode,
  onToggleTheaterMode,
  triggerAutoAdvance = false,
  isEditMode = false,
  onEditComponent,
  onDeleteComponent,
  onToggleNotes,
  notesCount = 0
}) => {
  const theme = useTheme();
  const [countdown, setCountdown] = useState<number | null>(null);


  // Auto-advance countdown trigger
  useEffect(() => {
    if (triggerAutoAdvance && hasNext) {
      setCountdown(5);
    } else {
      setCountdown(null);
    }
  }, [triggerAutoAdvance, hasNext]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      onNext();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, onNext]);

  if (!activeComp) return null;

  return (
    <Box sx={{ mt: 3 }}>
      {/* AUTO-ADVANCE BANNER */}
      {countdown !== null && (
        <Paper
          elevation={4}
          sx={{
            p: 1.75,
            mb: 2,
            borderRadius: 2.5,
            bgcolor: '#0F172A',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <CompleteIcon sx={{ color: '#22C55E' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Unit completed! Advancing to next lesson in {countdown}s...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(countdown / 5) * 100} 
                sx={{ width: 140, height: 4, borderRadius: 2, mt: 0.5, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#22C55E' } }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => { setCountdown(null); onNext(); }}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Play Now
            </Button>
            <IconButton size="small" onClick={() => setCountdown(null)} sx={{ color: 'white' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* DOCK BAR */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          borderColor: '#E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
        }}
      >
        {/* PREV BUTTON */}
        <Button
          variant="outlined"
          color="inherit"
          disabled={!hasPrev}
          startIcon={<PrevIcon />}
          onClick={onPrev}
          sx={{ borderRadius: 2.5, px: 2, fontWeight: 700, borderColor: '#CBD5E1' }}
        >
          Previous Unit
        </Button>

        {/* MIDDLE: MARK COMPLETE & THEATER MODE */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant={activeComp.completed ? "outlined" : "contained"}
            color={activeComp.completed ? "success" : "primary"}
            startIcon={activeComp.completed ? <CompleteIcon /> : <IncompleteIcon />}
            onClick={onToggleComplete}
            sx={{
              borderRadius: 2.5,
              px: 3,
              fontWeight: 800,
              boxShadow: activeComp.completed ? 'none' : '0 4px 14px rgba(0, 117, 130, 0.3)'
            }}
          >
            {activeComp.completed ? "Completed ✓ (Click to Undo)" : "Mark as Complete"}
          </Button>

          {onToggleNotes && (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<NoteIcon sx={{ color: 'primary.main' }} />}
              onClick={onToggleNotes}
              sx={{
                borderRadius: 2.5,
                px: 2,
                fontWeight: 700,
                borderColor: '#CBD5E1',
                bgcolor: '#FFFFFF',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: 'primary.main' }
              }}
            >
              Notes ({notesCount})
            </Button>
          )}

          <Tooltip title={isTheaterMode ? "Exit Focus Theater Mode" : "Expand to Cinema Focus Mode"}>
            <IconButton
              onClick={onToggleTheaterMode}
              sx={{
                bgcolor: isTheaterMode ? alpha(theme.palette.primary.main, 0.15) : '#F1F5F9',
                color: isTheaterMode ? 'primary.main' : 'text.primary',
                '&:hover': { bgcolor: '#E2E8F0' }
              }}
            >
              {isTheaterMode ? <TheaterExitIcon /> : <TheaterIcon />}
            </IconButton>
          </Tooltip>


          {isEditMode && onEditComponent && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<EditIcon fontSize="small" />}
              onClick={onEditComponent}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Edit Unit
            </Button>
          )}

          {isEditMode && onDeleteComponent && (
            <Tooltip title="Delete Unit">
              <IconButton
                size="small"
                color="error"
                onClick={onDeleteComponent}
                sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.18) } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* NEXT BUTTON */}
        <Button
          variant="contained"
          color="primary"
          disabled={!hasNext}
          endIcon={<NextIcon />}
          onClick={onNext}
          sx={{ borderRadius: 2.5, px: 2.5, fontWeight: 700 }}
        >
          Next Unit
        </Button>
      </Paper>
    </Box>
  );
};

export default LessonActionDock;
