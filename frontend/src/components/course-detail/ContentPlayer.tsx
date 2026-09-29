import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Box, Typography, Button, Card, Paper, Alert
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Description as DocxIcon,
  Link as LinkIcon,
  Slideshow as SlidesIcon,
  CoPresent as PptIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import type { ContentComponent } from './courseTypes';
import QuizViewer from './QuizViewer';
import AssignmentViewer from './AssignmentViewer';

export interface ContentPlayerRef {
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
}

interface ContentPlayerProps {
  comp: ContentComponent;
  onComplete: (compId: number) => void;
  isTheaterMode?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
}

const ContentPlayer = forwardRef<ContentPlayerRef, ContentPlayerProps>(({
  comp,
  onComplete,
  isTheaterMode = false,
  onTimeUpdate
}, ref) => {
  const [skipWarning, setSkipWarning] = useState(false);
  const maxTimeWatchedRef = useRef(0);
  const wasSkippedRef = useRef(false);
  const youtubePlayerRef = useRef<any>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Expose imperatively to parent (for note timestamp capture and click-to-seek)
  useImperativeHandle(ref, () => ({
    getCurrentTime: () => {
      if (comp.type === 'YOUTUBE' && youtubePlayerRef.current?.getCurrentTime) {
        return youtubePlayerRef.current.getCurrentTime();
      }
      if (videoPlayerRef.current) {
        return videoPlayerRef.current.currentTime;
      }
      if (audioPlayerRef.current) {
        return audioPlayerRef.current.currentTime;
      }
      return 0;
    },
    seekTo: (seconds: number) => {
      if (comp.type === 'YOUTUBE' && youtubePlayerRef.current?.seekTo) {
        youtubePlayerRef.current.seekTo(seconds, true);
      } else if (videoPlayerRef.current) {
        videoPlayerRef.current.currentTime = seconds;
        videoPlayerRef.current.play().catch(() => {});
      } else if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = seconds;
        audioPlayerRef.current.play().catch(() => {});
      }
    }
  }));

  useEffect(() => {
    maxTimeWatchedRef.current = 0;
    wasSkippedRef.current = false;
    setSkipWarning(false);
  }, [comp.id]);

  // Video / Audio time tracking
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const media = e.currentTarget;
    const currentTime = media.currentTime;

    if (onTimeUpdate) {
      onTimeUpdate(currentTime);
    }

    if (!comp.strict_completion || comp.completed) return;

    if (currentTime > maxTimeWatchedRef.current) {
      if (currentTime - maxTimeWatchedRef.current > 3.0) {
        setSkipWarning(true);
        wasSkippedRef.current = true;
        media.currentTime = maxTimeWatchedRef.current;
        setTimeout(() => setSkipWarning(false), 4000);
      } else {
        maxTimeWatchedRef.current = currentTime;
      }
    }
  };

  const handleEnded = () => {
    if (!comp.strict_completion || comp.completed) return;
    if (wasSkippedRef.current) {
      alert("Fast-forwarding was detected. Please watch without skipping to complete!");
      return;
    }
    onComplete(comp.id);
  };

  // YouTube API initialization & anti-skip
  useEffect(() => {
    if (comp.type !== 'YOUTUBE') return;

    let youtubeId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = comp.url.match(regExp);
    if (match && match[2].length === 11) {
      youtubeId = match[2];
    }
    if (!youtubeId) return;

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let intervalId: any = null;
    let player: any = null;

    const initPlayer = () => {
      player = new (window as any).YT.Player(`yt-player-${comp.id}`, {
        height: '100%',
        width: '100%',
        videoId: youtubeId,
        playerVars: { controls: 1, rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              intervalId = setInterval(() => {
                if (!player || typeof player.getCurrentTime !== 'function') return;
                const currentTime = player.getCurrentTime();
                if (onTimeUpdate) onTimeUpdate(currentTime);

                if (comp.strict_completion && !comp.completed) {
                  if (currentTime > maxTimeWatchedRef.current) {
                    if (currentTime - maxTimeWatchedRef.current > 3.0) {
                      setSkipWarning(true);
                      wasSkippedRef.current = true;
                      player.seekTo(maxTimeWatchedRef.current, true);
                      setTimeout(() => setSkipWarning(false), 4000);
                    } else {
                      maxTimeWatchedRef.current = currentTime;
                    }
                  }
                }
              }, 500);
            } else if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }

            if (event.data === (window as any).YT.PlayerState.ENDED) {
              if (comp.strict_completion && !comp.completed) {
                if (wasSkippedRef.current) {
                  alert("Fast-forwarding was detected. Please watch without skipping to complete!");
                } else {
                  onComplete(comp.id);
                }
              } else if (!comp.completed) {
                onComplete(comp.id);
              }
            }
          }
        }
      });
      youtubePlayerRef.current = player;
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [comp.id, comp.url, comp.completed, comp.strict_completion]);

  const getEmbedUrl = (type: string, urlStr: string) => {
    if (type === 'YOUTUBE') {
      const match = urlStr.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?rel=0`;
      }
    } else if (type === 'GOOGLE_DRIVE') {
      if (urlStr.includes('/view') || urlStr.includes('/edit')) {
        return urlStr.replace(/\/view.*|\/edit.*/, '/preview');
      }
    }
    return urlStr;
  };

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: '100%', 
        borderRadius: 3.5, 
        overflow: 'hidden', 
        bgcolor: isTheaterMode ? '#000000' : 'transparent',
        boxShadow: isTheaterMode ? '0 16px 40px rgba(0,0,0,0.5)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      {/* ANTI-SKIP SECURITY WARNING */}
      {skipWarning && (
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            position: 'absolute', 
            top: 20, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 30,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
            fontWeight: 700
          }}
        >
          🔒 Anti-Skip Active: Snapped playback back to your furthest watched position.
        </Alert>
      )}

      {/* 1. YOUTUBE VIDEO */}
      {comp.type === 'YOUTUBE' && (
        <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', bgcolor: '#000', borderRadius: 3 }}>
          <div id={`yt-player-${comp.id}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        </Box>
      )}

      {/* 2. GOOGLE DRIVE */}
      {comp.type === 'GOOGLE_DRIVE' && (
        <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', bgcolor: '#000', borderRadius: 3 }}>
          <iframe
            title={comp.title}
            src={getEmbedUrl(comp.type, comp.url)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allowFullScreen
          />
        </Box>
      )}

      {/* 3. CUSTOM MP4 VIDEO */}
      {comp.type === 'VIDEO' && (
        <Box sx={{ p: 1, bgcolor: '#0F172A', display: 'flex', justifyContent: 'center', borderRadius: 3, overflow: 'hidden' }}>
          <video 
            ref={videoPlayerRef}
            controls 
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            style={{ width: '100%', maxHeight: '640px', borderRadius: '8px' }} 
            src={comp.url} 
          >
            Your browser does not support the video tag.
          </video>
        </Box>
      )}

      {/* 4. AUDIO FILE */}
      {comp.type === 'AUDIO' && (
        <Card variant="outlined" sx={{ p: 5, borderRadius: 3, textAlign: 'center', bgcolor: '#F8FAFC' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0F172A' }}>
            {comp.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Audio Lecture Unit • Listen thoroughly to fulfill unit objectives
          </Typography>
          <audio 
            ref={audioPlayerRef}
            controls 
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            style={{ width: '100%', maxWidth: '540px' }} 
            src={comp.url} 
          />
        </Card>
      )}

      {/* 5. QUIZ */}
      {comp.type === 'QUIZ' && (
        <QuizViewer comp={comp} onComplete={onComplete} />
      )}

      {/* 6. ASSIGNMENT */}
      {comp.type === 'ASSIGNMENT' && (
        <AssignmentViewer comp={comp} onComplete={onComplete} />
      )}

      {/* 7. PDF READING DOCUMENT */}
      {comp.type === 'PDF' && (
        <Card variant="outlined" sx={{ p: 5, borderRadius: 3.5, textAlign: 'center', bgcolor: '#FAF5FF', borderColor: '#E9D5FF' }}>
          <PdfIcon sx={{ fontSize: 68, color: '#9333EA', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#581C87' }}>{comp.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Required Reading Material (PDF Format)</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<OpenInNewIcon />} href={comp.url} target="_blank" sx={{ bgcolor: '#9333EA', '&:hover': { bgcolor: '#7E22CE' }, borderRadius: 2.5, px: 3, fontWeight: 700 }}>
              Read Document in New Tab
            </Button>
            <Button variant="outlined" onClick={() => onComplete(comp.id)} startIcon={<CompleteIcon />} sx={{ borderRadius: 2.5, borderColor: '#A855F7', color: '#7E22CE', fontWeight: 700 }}>
              {comp.completed ? "Completed ✓" : "Mark as Finished Reading"}
            </Button>
          </Box>
        </Card>
      )}

      {/* 8. DOCX DOCUMENT */}
      {comp.type === 'DOCX' && (
        <Card variant="outlined" sx={{ p: 5, borderRadius: 3.5, textAlign: 'center', bgcolor: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <DocxIcon sx={{ fontSize: 68, color: '#2563EB', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#1E3A8A' }}>{comp.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Word Document (.docx)</Typography>
          <Button variant="contained" startIcon={<OpenInNewIcon />} href={comp.url} target="_blank" sx={{ bgcolor: '#2563EB', borderRadius: 2.5, px: 3, fontWeight: 700 }}>
            Download Word Document
          </Button>
        </Card>
      )}

      {/* 9. GOOGLE SLIDES */}
      {comp.type === 'GOOGLE_SLIDES' && (
        <Card variant="outlined" sx={{ p: 5, borderRadius: 3.5, textAlign: 'center', bgcolor: '#FFFBEB', borderColor: '#FDE68A' }}>
          <SlidesIcon sx={{ fontSize: 68, color: '#D97706', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#78350F' }}>{comp.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Interactive Google Slides Presentation</Typography>
          <Button variant="contained" startIcon={<OpenInNewIcon />} href={comp.url} target="_blank" sx={{ bgcolor: '#D97706', borderRadius: 2.5, px: 3, fontWeight: 700 }}>
            Open Presentation Slides
          </Button>
        </Card>
      )}

      {/* 10. POWERPOINT */}
      {comp.type === 'POWERPOINT' && (
        <Card variant="outlined" sx={{ p: 5, borderRadius: 3.5, textAlign: 'center', bgcolor: '#FFF7ED', borderColor: '#FFEDD5' }}>
          <PptIcon sx={{ fontSize: 68, color: '#EA580C', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#7C2D12' }}>{comp.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>PowerPoint Presentation Deck (.pptx)</Typography>
          <Button variant="contained" startIcon={<OpenInNewIcon />} href={comp.url} target="_blank" sx={{ bgcolor: '#EA580C', borderRadius: 2.5, px: 3, fontWeight: 700 }}>
            Download PowerPoint Deck
          </Button>
        </Card>
      )}

      {/* 11. EXTERNAL LINK */}
      {comp.type === 'LINK' && (
        <Card variant="outlined" sx={{ p: 4, borderRadius: 3.5, bgcolor: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <LinkIcon sx={{ fontSize: 44, color: '#16A34A' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#14532D' }}>{comp.title}</Typography>
              <Typography variant="body2" color="text.secondary">Curated External Web Link / Resource</Typography>
            </Box>
          </Box>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 3, bgcolor: 'white', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ wordBreak: 'break-all', color: '#15803D', fontFamily: 'monospace' }}>
              {comp.url}
            </Typography>
          </Paper>
          <Button variant="contained" endIcon={<OpenInNewIcon />} href={comp.url} target="_blank" sx={{ bgcolor: '#16A34A', borderRadius: 2.5, px: 3, fontWeight: 700 }}>
            Open External Resource
          </Button>
        </Card>
      )}
    </Box>
  );
});

export default ContentPlayer;
