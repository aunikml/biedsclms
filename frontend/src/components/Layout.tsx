import React, { useContext, useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Container, Box, 
  Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  IconButton, Avatar, Menu, MenuItem, useMediaQuery, useTheme, Badge, InputBase, alpha, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppearanceContext } from '../context/AppearanceContext';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import BoltIcon from '@mui/icons-material/Bolt';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

interface LayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 260;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 10,
  backgroundColor: alpha(theme.palette.common.black, 0.03),
  border: '1px solid rgba(226, 232, 240, 0.8)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.05),
    borderColor: theme.palette.primary.light,
  },
  '&:focus-within': {
    backgroundColor: '#FFFFFF',
    borderColor: theme.palette.primary.main,
    boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: '320px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    fontSize: '0.875rem',
    fontWeight: 500,
    width: '100%',
  },
}));

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { settings } = useContext(AppearanceContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const isStaff = Boolean(user?.role && ['ADMIN', 'MANAGER', 'TEACHER'].includes(user.role));
  const isAdmin = user?.role === 'ADMIN';
  const showDrawer = Boolean(isAuthenticated && isStaff);

  const navItems = [
    { text: isAdmin ? 'Admin Dashboard' : 'My Dashboard', icon: <DashboardIcon fontSize="small" />, path: isAdmin ? '/admin-dashboard' : '/dashboard' },
  ];

  if (isStaff) {
    navItems.push({ text: 'Manage Courses', icon: <SettingsIcon fontSize="small" />, path: '/manage-courses' });
  }

  if (isAdmin) {
    navItems.push({ text: 'User Management', icon: <GroupIcon fontSize="small" />, path: '/manage-users' });
    navItems.push({ text: 'Appearance', icon: <SettingsIcon fontSize="small" />, path: '/appearance' });
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
      <Toolbar sx={{ height: 75, px: 3, borderBottom: '1px solid #F1F5F9' }}>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            fontWeight: 800, 
            fontFamily: '"Outfit", sans-serif',
            fontSize: '1.25rem',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1.25
          }}
        >
            {settings?.logo ? (
              <img src={settings.logo} alt="Logo" style={{ maxHeight: 34, marginRight: 8 }} />
            ) : (
              <Box 
                sx={{ 
                  width: 34, 
                  height: 34, 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                  mr: 1.25
                }}
              >
                <BoltIcon fontSize="small" />
              </Box>
            )}
            {settings?.site_title || 'IED, BRACU Courseware'}
          </Typography>
      </Toolbar>
      
      <Box sx={{ overflow: 'auto', mt: 3, flexGrow: 1, px: 2 }}>
        <Typography variant="caption" sx={{ px: 2, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Main Menu
        </Typography>
        <List sx={{ mt: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  component={RouterLink} 
                  to={item.path}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: 2.5,
                    py: 1.25,
                    px: 2,
                    transition: 'all 0.2s ease',
                    ...(isActive ? {
                      bgcolor: 'primary.main',
                      color: '#FFFFFF',
                      boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.3)',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    } : {
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: '#F1F5F9',
                      }
                    })
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#FFFFFF' : 'text.secondary', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    slotProps={{
                      primary: {
                        sx: { fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }
                      }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {user && (
        <Box sx={{ p: 2, m: 2, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontWeight: 700 }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {user.role?.toLowerCase() || 'student'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Glassmorphic App Bar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          ...(showDrawer && !isMobile ? {
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            left: `${DRAWER_WIDTH}px`,
            right: 0,
          } : {
            width: '100%',
            left: 0,
            right: 0,
          }),
          background: 'rgba(255, 255, 255, 0.92) !important',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          color: '#0F172A',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth={showDrawer ? false : "xl"} sx={{ px: { xs: 2, sm: 3 } }}>
          <Toolbar disableGutters sx={{ height: 75 }}>
            {showDrawer && isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Brand Logo - Always visible when there is no sidebar or on mobile */}
            {(!showDrawer || isMobile) && (
              <Typography 
                variant="h5" 
                component={RouterLink} 
                to="/" 
                sx={{ 
                  fontWeight: 800, 
                  fontFamily: '"Outfit", sans-serif',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  mr: { xs: 2, md: 4 }
                }}
              >
                {settings?.logo ? (
                  <img src={settings.logo} alt="Logo" style={{ maxHeight: 34, marginRight: 8 }} />
                ) : (
                  <Box 
                    sx={{ 
                      width: 34, 
                      height: 34, 
                      borderRadius: '10px', 
                      background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}
                  >
                    <BoltIcon fontSize="small" />
                  </Box>
                )}
                {settings?.site_title || 'IED, BRACU Courseware'}
              </Typography>
            )}

            {/* Top Search Bar */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: showDrawer ? 'flex-start' : 'center', px: { xs: 1, md: 3 } }}>
              <Search sx={{ width: { xs: '100%', sm: 320, md: 420 }, maxWidth: '100%' }}>
                <SearchIconWrapper>
                  <SearchIcon fontSize="small" />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search courses, modules, skills..."
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search>
            </Box>

            {/* Right Profile / Actions Area */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexShrink: 0 }}>
              {isAuthenticated ? (
                <>
                  <IconButton color="inherit" sx={{ color: 'text.secondary', bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}>
                    <Badge badgeContent={2} color="secondary">
                      <NotificationsIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                  
                  <IconButton
                    edge="end"
                    aria-label="account of current user"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                    sx={{ ml: 0.5 }}
                  >
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 700, boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)' }}>
                      {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    slotProps={{
                      paper: {
                        elevation: 0,
                        sx: {
                          overflow: 'visible',
                          filter: 'drop-shadow(0px 10px 25px rgba(0,0,0,0.08))',
                          mt: 1.5,
                          minWidth: 220,
                          borderRadius: 3,
                          p: 1,
                        }
                      }
                    }}
                  >
                    <Box sx={{ p: 1.5, mb: 1, borderRadius: 2, bgcolor: '#F8FAFC' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {user?.username}
                      </Typography>
                      {user?.role && (
                        <Box sx={{ mt: 1 }}>
                          <Chip label={user.role} color="primary" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                        </Box>
                      )}
                    </Box>
                    <MenuItem onClick={handleProfileMenuClose} component={RouterLink} to={isAdmin ? "/admin-dashboard" : "/dashboard"} sx={{ borderRadius: 2, gap: 1.5 }}>
                      <PersonIcon fontSize="small" /> Dashboard
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main', borderRadius: 2, gap: 1.5, fontWeight: 600 }}>
                      <LogoutIcon fontSize="small" /> Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : null}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Sidebar Drawer - Only shown for Admin, Manager, Teacher */}
      {showDrawer && (
        <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid #E2E8F0' },
              }}
            >
              {drawer}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid #E2E8F0' },
              }}
              open
            >
              {drawer}
            </Drawer>
          )}
        </Box>
      )}

      {/* Main App Container */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          width: showDrawer && !isMobile ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'hidden',
          pt: { xs: '85px', sm: '95px' },
        }}
      >
        <Container maxWidth={showDrawer ? false : "xl"} sx={{ flexGrow: 1, py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 4, md: 5 }, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
          {children}
        </Container>


        {/* Footer */}
        <Box 
          component="footer" 
          sx={{ 
            py: 4, 
            mt: 'auto', 
            backgroundColor: '#FFFFFF', 
            borderTop: '1px solid #E2E8F0' 
          }}
        >
          <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {settings?.logo ? (
                  <img src={settings.logo} alt="Logo" style={{ maxHeight: 28 }} />
                ) : (
                  <Box 
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: '8px', 
                      background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}
                  >
                    <BoltIcon sx={{ fontSize: 18 }} />
                  </Box>
                )}
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
                  {settings?.site_title || 'IED, BRACU Courseware'}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                © {new Date().getFullYear()} IED, BRACU Courseware • Built with React & Django REST Framework
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
