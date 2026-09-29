import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, RadioGroup,
  FormControlLabel, Radio, Chip, Alert, Card, CardContent
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Check as CheckIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import type { ContentComponent } from './courseTypes';

interface QuizViewerProps {
  comp: ContentComponent;
  onComplete: (compId: number) => void;
}

const QuizViewer: React.FC<QuizViewerProps> = ({ comp, onComplete }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [showHint, setShowHint] = useState<boolean>(false);

  const sampleQuestion = {
    question: `Key Conceptual Mastery Check for: "${comp.title}"`,
    prompt: "In modern software development and web systems, what is the primary benefit of decoupled client-server component architecture?",
    options: [
      "It eliminates the need for authentication protocols entirely.",
      "It promotes separation of concerns, improves cacheability, and allows independent scaling of frontend and backend services.",
      "It requires browsers to execute all database queries directly.",
      "It enforces all assets to be compiled into a single static file."
    ],
    correctIndex: 1,
    explanation: "Decoupling clients and servers isolates presentation logic from data persistence, optimizing scalability, maintainability, and load times.",
    hint: "Think about modularity, microservices, and how frontend UI interacts through REST/GraphQL APIs."
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    const selectedIdx = parseInt(selectedAnswer, 10);
    setSubmitted(true);
    if (selectedIdx === sampleQuestion.correctIndex) {
      setIsCorrect(true);
      if (!comp.completed) {
        onComplete(comp.id);
      }
    } else {
      setIsCorrect(false);
      setAttemptsLeft((prev) => Math.max(0, prev - 1));
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswer('');
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', borderColor: '#CBD5E1', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      {/* HEADER */}
      <Box sx={{ bgcolor: '#00262B', color: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <QuizIcon sx={{ color: '#00D1C1' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Graded Assessment
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {comp.title}
            </Typography>
          </Box>
        </Box>
        <Chip 
          label={comp.completed ? "Scored: 100% (Passed ✓)" : "1.0 Point Possible"} 
          sx={{ bgcolor: comp.completed ? '#059669' : 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700 }}
        />
      </Box>

      {/* BODY */}
      <CardContent sx={{ p: 4 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1 }}>
          Question 1 of 1
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0F172A', fontSize: '1.1rem' }}>
          {sampleQuestion.prompt}
        </Typography>

        <RadioGroup value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)}>
          {sampleQuestion.options.map((opt, idx) => {
            const isSelected = selectedAnswer === String(idx);
            return (
              <Paper 
                key={idx} 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 1.5, 
                  borderRadius: 2.5, 
                  borderColor: isSelected ? '#007582' : '#E2E8F0',
                  bgcolor: isSelected ? '#F0FDFA' : 'white',
                  cursor: submitted && isCorrect ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: submitted && isCorrect ? '#E2E8F0' : '#007582' }
                }}
              >
                <FormControlLabel 
                  value={String(idx)} 
                  disabled={submitted && isCorrect}
                  control={<Radio sx={{ color: '#007582', '&.Mui-checked': { color: '#007582' } }} />} 
                  label={<Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500, color: '#334155' }}>{opt}</Typography>} 
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>
            );
          })}
        </RadioGroup>

        {submitted && (
          <Box sx={{ mt: 3 }}>
            {isCorrect ? (
              <Alert severity="success" icon={<CheckIcon fontSize="inherit" />} sx={{ borderRadius: 2, fontWeight: 600 }}>
                Correct! (1.0/1.0 points earned) — {sampleQuestion.explanation}
              </Alert>
            ) : (
              <Alert severity="error" sx={{ borderRadius: 2, fontWeight: 600 }}>
                Incorrect answer. {attemptsLeft > 0 ? `You have ${attemptsLeft} attempt(s) remaining.` : "No attempts remaining."}
              </Alert>
            )}
          </Box>
        )}

        {showHint && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            💡 <strong>Hint:</strong> {sampleQuestion.hint}
          </Alert>
        )}

        {/* ACTIONS */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 2.5, borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer || (submitted && isCorrect) || attemptsLeft === 0}
            sx={{ bgcolor: '#007582', '&:hover': { bgcolor: '#005963' }, borderRadius: 2.5, px: 3.5, fontWeight: 700 }}
          >
            Submit Answer
          </Button>

          <Button 
            variant="outlined" 
            onClick={() => setShowHint(!showHint)}
            startIcon={<HelpIcon />}
            sx={{ color: '#475569', borderColor: '#CBD5E1', borderRadius: 2.5, fontWeight: 600 }}
          >
            {showHint ? "Hide Hint" : "Show Hint"}
          </Button>

          {submitted && !isCorrect && attemptsLeft > 0 && (
            <Button 
              variant="text" 
              onClick={handleResetQuiz} 
              startIcon={<RefreshIcon />}
              sx={{ color: '#007582', fontWeight: 700 }}
            >
              Try Again
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuizViewer;
