import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Chip,
  Card, CardContent, CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  AttachFile as FileIcon
} from '@mui/icons-material';
import type { ContentComponent } from './courseTypes';

interface AssignmentViewerProps {
  comp: ContentComponent;
  onComplete: (compId: number) => void;
}

const AssignmentViewer: React.FC<AssignmentViewerProps> = ({ comp, onComplete }) => {
  const [submittedFile, setSubmittedFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        setSubmittedFile(file.name);
        setUploading(false);
        if (!comp.completed) {
          onComplete(comp.id);
        }
      }, 900);
    }
  };

  const handleSimulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setSubmittedFile('assignment_submission_final.pdf');
      setUploading(false);
      if (!comp.completed) {
        onComplete(comp.id);
      }
    }, 900);
  };

  const isSubmitted = comp.completed || Boolean(submittedFile);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', borderColor: '#CBD5E1', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      {/* HEADER */}
      <Box sx={{ bgcolor: '#0F172A', color: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentIcon sx={{ color: '#38BDF8' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Practical Assignment
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {comp.title}
            </Typography>
          </Box>
        </Box>
        <Chip 
          label={isSubmitted ? "Submitted ✓ (Pending Review)" : "Pending Submission"} 
          color={isSubmitted ? "success" : "warning"} 
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {/* CONTENT */}
      <CardContent sx={{ p: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#0F172A' }}>
          Assignment Brief & Objectives
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: '#334155', lineHeight: 1.6 }}>
          {comp.url || "Analyze the system specifications covered in this module, implement the required solution, and submit your documentation or code bundle for instructor evaluation."}
        </Typography>

        {/* METRICS GRID */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4, p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Total Value</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>100 Points</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Format Allowed</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>PDF, ZIP, DOCX</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Maximum Size</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>25 MB</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Evaluation</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Instructor Grade</Typography>
          </Box>
        </Box>

        {/* UPLOAD DROPZONE */}
        {isSubmitted ? (
          <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 3, bgcolor: '#F0FDF4', borderColor: '#BBF7D0', textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 44, color: '#16A34A', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#14532D', mb: 0.5 }}>
              Assignment Successfully Submitted!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              File: <strong>{submittedFile || 'assignment_submission.pdf'}</strong>
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSubmittedFile(null)}
              sx={{ borderColor: '#86EFAC', color: '#15803D', fontWeight: 600, borderRadius: 2 }}
            >
              Replace Submission File
            </Button>
          </Paper>
        ) : (
          <Box
            component="label"
            sx={{
              display: 'block',
              border: '2px dashed #0284C7',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: '#F0F9FF',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: '#E0F2FE', borderColor: '#0369A1' }
            }}
          >
            <input
              type="file"
              hidden
              accept=".pdf,.zip,.docx,.doc"
              onChange={handleFileUpload}
            />
            {uploading ? (
              <Box sx={{ py: 2 }}>
                <CircularProgress size={36} sx={{ color: '#0284C7', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Uploading your submission...</Typography>
              </Box>
            ) : (
              <>
                <UploadIcon sx={{ fontSize: 44, color: '#0284C7', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                  Click to select assignment file or drag & drop here
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Accepted extensions: .pdf, .zip, .docx (Max 25MB)
                </Typography>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={(e) => { e.preventDefault(); handleSimulateUpload(); }}
                  startIcon={<FileIcon />}
                  sx={{ bgcolor: '#0284C7', '&:hover': { bgcolor: '#0369A1' }, borderRadius: 2, fontWeight: 700 }}
                >
                  Quick Submit Demo File
                </Button>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentViewer;
