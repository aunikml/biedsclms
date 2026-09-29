import React, { useState, useContext } from 'react';
import { Box, Button, TextField, Typography, Alert, Card } from '@mui/material';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AppearanceContext } from '../context/AppearanceContext';

const Login: React.FC = () => {
  const { login, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { settings } = useContext(AppearanceContext);
  const resolveImageUrl = (img: string | null | undefined) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `http://localhost:8000${img.startsWith('/') ? '' : '/'}${img}`;
  };
  const bgImage = resolveImageUrl(settings?.login_image) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN' || user.role === 'MANAGER') {
        navigate('/admin-dashboard');
      } else if (user.role === 'TEACHER') {
        navigate('/manage-courses');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('token/', {
        username,
        password,
      });
      await login(response.data.access, response.data.refresh);
      // Navigation will be handled by the useEffect above once user role is loaded
    } catch (err: any) {
      setError('Invalid username or password.');
    }
  };

  const handleQuickLogin = (demoUsername: string, demoPass: string) => {
    setUsername(demoUsername);
    setPassword(demoPass);
  };


  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, my: { xs: 2, md: 6 } }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '1000px' }}
      >
        <Card 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'hidden',
            borderRadius: 4,
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        >
          {/* Left Side - Branding/Image */}
          <Box 
            sx={{
              width: { xs: '100%', md: '50%' },
              minHeight: { xs: '200px', md: '500px' },
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: { xs: 'none', sm: 'block' }
            }}
          />
          
          {/* Right Side - Form */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '50%' }, 
              p: { xs: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, fontFamily: 'inherit' }}>
                {settings?.login_welcome_title || 'Sign In'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'inherit' }}>
                {settings?.login_welcome_subtitle || 'Enter your credentials to access your account'}
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" noValidate onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(248, 250, 252, 0.5)'
                  }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(248, 250, 252, 0.5)'
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2.5, 
                  py: 1.5, 
                  borderRadius: 2, 
                  fontSize: '1.05rem', 
                  fontWeight: 700,
                  fontFamily: 'inherit'
                }}
              >
                Continue to Dashboard
              </Button>

              {/* QUICK DEMO ACCOUNTS HELPER */}
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #E2E8F0', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                  ⚡ Quick Demo Accounts (1-Click Fill):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, justifyContent: 'center' }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleQuickLogin('alice.student', 'password123')}
                    sx={{ fontSize: '0.75rem', py: 0.25, px: 1, textTransform: 'none', borderRadius: 1.5 }}
                  >
                    Alice (100% Cert)
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleQuickLogin('bob.student', 'password123')}
                    sx={{ fontSize: '0.75rem', py: 0.25, px: 1, textTransform: 'none', borderRadius: 1.5 }}
                  >
                    Bob (50% Progress)
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleQuickLogin('clara.student', 'password123')}
                    sx={{ fontSize: '0.75rem', py: 0.25, px: 1, textTransform: 'none', borderRadius: 1.5 }}
                  >
                    Clara (25% Progress)
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleQuickLogin('david.student', 'password123')}
                    sx={{ fontSize: '0.75rem', py: 0.25, px: 1, textTransform: 'none', borderRadius: 1.5 }}
                  >
                    David (New Student)
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Card>
      </motion.div>
    </Box>

  );
};

export default Login;
