import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, Alert, CircularProgress, 
  TextField, Select, MenuItem, InputLabel, FormControl, Tabs, Tab
} from '@mui/material';
import api from '../api/axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appearance-tabpanel-${index}`}
      aria-labelledby={`appearance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `appearance-tab-${index}`,
    'aria-controls': `appearance-tabpanel-${index}`,
  };
}

const Appearance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const [settings, setSettings] = useState<any>({
    site_title: '',
    login_welcome_title: '',
    login_welcome_subtitle: '',
    primary_color: '',
    accent_color: '',
    font_family: '',
    base_font_size: 16,
    sidebar_style: 'fixed',
    theme_mode: 'light',
    custom_css: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [loginImageFile, setLoginImageFile] = useState<File | null>(null);
  const [currentImages, setCurrentImages] = useState<any>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('appearance/settings/');
      const data = response.data;
      setSettings({
        site_title: data.site_title || '',
        login_welcome_title: data.login_welcome_title || '',
        login_welcome_subtitle: data.login_welcome_subtitle || '',
        primary_color: data.primary_color || '',
        accent_color: data.accent_color || '',
        font_family: data.font_family || '',
        base_font_size: data.base_font_size || 16,
        sidebar_style: data.sidebar_style || 'fixed',
        theme_mode: data.theme_mode || 'light',
        custom_css: data.custom_css || ''
      });
      const resolveMediaUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `http://localhost:8000${cleanPath}`;
      };

      setCurrentImages({
        logo: resolveMediaUrl(data.logo),
        favicon: resolveMediaUrl(data.favicon),
        login_image: resolveMediaUrl(data.login_image)
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load settings');
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    Object.keys(settings).forEach(key => {
      const val = settings[key];
      if (val !== null && val !== undefined) {
        formData.append(key, val);
      }
    });

    if (logoFile) formData.append('logo', logoFile);
    if (faviconFile) formData.append('favicon', faviconFile);
    if (loginImageFile) formData.append('login_image', loginImageFile);

    try {
      // Do not manually set Content-Type header with FormData so browser/Axios includes the multipart boundary
      const response = await api.put('appearance/settings/', formData);

      const resolveMediaUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `http://localhost:8000${cleanPath}`;
      };

      setCurrentImages({
        logo: resolveMediaUrl(response.data.logo),
        favicon: resolveMediaUrl(response.data.favicon),
        login_image: resolveMediaUrl(response.data.login_image)
      });
      setLogoFile(null);
      setFaviconFile(null);
      setLoginImageFile(null);
      setSuccess('Appearance settings updated successfully! Refresh the page to see all changes.');
    } catch (err: any) {
      console.error('Appearance update error:', err);
      const errData = err.response?.data;
      let detailedMsg = '';
      if (typeof errData === 'string') {
        detailedMsg = errData;
      } else if (errData && typeof errData === 'object') {
        detailedMsg = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
      }
      setError(`Failed to update settings${detailedMsg ? `: ${detailedMsg}` : ''}`);
    }
    setSaving(false);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', width: '100%', pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Appearance Settings</Typography>
        <Button variant="contained" size="large" onClick={handleSave} disabled={saving} sx={{ px: 4 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1, bgcolor: '#f8fafc' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="appearance settings tabs">
            <Tab label="Logos & Identity" {...a11yProps(0)} sx={{ fontWeight: 600 }} />
            <Tab label="Theme & Colors" {...a11yProps(1)} sx={{ fontWeight: 600 }} />
            <Tab label="Login Page" {...a11yProps(2)} sx={{ fontWeight: 600 }} />
            <Tab label="Advanced (CSS)" {...a11yProps(3)} sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>
        
        <CardContent sx={{ p: 4, overflowX: 'hidden' }}>
          {/* TAB 0: Logos & Identity */}
          <CustomTabPanel value={tabValue} index={0}>
            <Typography variant="h6" sx={{ mb: 3 }}>Site Identity</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <TextField fullWidth label="Site Title" name="site_title" value={settings.site_title} onChange={handleChange} helperText="Appears in the browser tab and sidebar header" />
              </Box>
              <Box sx={{ p: 3, border: '1px dashed #cbd5e1', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Site Logo</Typography>
                {currentImages.logo && <Box sx={{ mb: 2 }}><img src={currentImages.logo} alt="Logo" style={{ maxHeight: 60 }} /></Box>}
                <Button variant="outlined" component="label">
                  Choose File
                  <input type="file" hidden accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                </Button>
                {logoFile && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'primary.main' }}>{logoFile.name}</Typography>}
              </Box>
              <Box sx={{ p: 3, border: '1px dashed #cbd5e1', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Favicon</Typography>
                {currentImages.favicon && <Box sx={{ mb: 2 }}><img src={currentImages.favicon} alt="Favicon" style={{ maxHeight: 32 }} /></Box>}
                <Button variant="outlined" component="label">
                  Choose File
                  <input type="file" hidden accept="image/*" onChange={(e) => setFaviconFile(e.target.files?.[0] || null)} />
                </Button>
                {faviconFile && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'primary.main' }}>{faviconFile.name}</Typography>}
              </Box>
            </Box>
          </CustomTabPanel>

          {/* TAB 1: Theme & Colors */}
          <CustomTabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 3 }}>Colors & Typography</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField fullWidth label="Primary Color (Hex)" name="primary_color" value={settings.primary_color} onChange={handleChange} type="color" sx={{ height: 60 }} />
              <TextField fullWidth label="Accent Color (Hex)" name="accent_color" value={settings.accent_color} onChange={handleChange} type="color" sx={{ height: 60 }} />
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 3 }}>
                <TextField fullWidth label="Font Family" name="font_family" value={settings.font_family} onChange={handleChange} placeholder="e.g., Roboto, sans-serif" helperText="CSS font-family string" />
                <FormControl fullWidth>
                  <InputLabel>Sidebar Style</InputLabel>
                  <Select name="sidebar_style" value={settings.sidebar_style} label="Sidebar Style" onChange={handleChange}>
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="collapsible">Collapsible</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </CustomTabPanel>

          {/* TAB 2: Login Page */}
          <CustomTabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ mb: 3 }}>Login Page Branding</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
              <TextField fullWidth label="Welcome Title" name="login_welcome_title" value={settings.login_welcome_title} onChange={handleChange} />
              <TextField fullWidth label="Welcome Subtitle" name="login_welcome_subtitle" value={settings.login_welcome_subtitle} onChange={handleChange} />
              <Box sx={{ p: 3, border: '1px dashed #cbd5e1', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Login Background Image</Typography>
                {currentImages.login_image && <Box sx={{ mb: 2 }}><img src={currentImages.login_image} alt="Login Bg" style={{ maxHeight: 150, borderRadius: 8 }} /></Box>}
                <Button variant="outlined" component="label">
                  Upload New Image
                  <input type="file" hidden accept="image/*" onChange={(e) => setLoginImageFile(e.target.files?.[0] || null)} />
                </Button>
                {loginImageFile && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'primary.main' }}>{loginImageFile.name}</Typography>}
              </Box>
            </Box>
          </CustomTabPanel>

          {/* TAB 3: Advanced */}
          <CustomTabPanel value={tabValue} index={3}>
            <Typography variant="h6" sx={{ mb: 3 }}>Custom CSS</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add custom CSS to override theme styles. This will be injected into the site's header.
            </Typography>
            <TextField 
              fullWidth multiline rows={12} 
              name="custom_css" value={settings.custom_css} onChange={handleChange} 
              placeholder="/* Example: */&#10;body { background-color: #000; }"
              sx={{ 
                fontFamily: 'monospace',
                '& .MuiInputBase-input': { fontFamily: 'monospace' }
              }}
            />
          </CustomTabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Appearance;
