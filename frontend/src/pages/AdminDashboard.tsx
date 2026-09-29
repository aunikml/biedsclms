import React, { useEffect, useState, useContext } from 'react';
import { 
  Box, Typography, Card, Button, CircularProgress, 
  Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow 
} from '@mui/material';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import GroupIcon from '@mui/icons-material/Group';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink } from 'react-router-dom';

const mockChartData = [
  { name: 'Jan', users: 12 },
  { name: 'Feb', users: 19 },
  { name: 'Mar', users: 25 },
  { name: 'Apr', users: 32 },
  { name: 'May', users: 48 },
  { name: 'Jun', users: 65 },
];

const AdminDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes] = await Promise.all([
          api.get('users/'),
          api.get('courses/')
        ]);
        setUsers(usersRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#ec1818' }} />
      </Box>
    );
  }

  // Calculate extra stats
  const activeInstructors = users.filter((u: any) => u.role === 'TEACHER' || u.role === 'MANAGER').length;
  const publishedCourses = courses.filter((c: any) => c.is_published).length;
  // Get recent 5 users
  const recentUsers = [...users].reverse().slice(0, 5);

  return (
    <Box>
      <PageHeader 
        title="Admin Dashboard"
        subtitle={`Welcome back, ${user?.username || 'Admin'}. Here is your system overview.`}
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Admin Dashboard' }]}
      />

      {/* STATS ROW */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<GroupIcon />}
          color="primary"
          subtitle="Registered accounts"
        />

        <StatCard
          title="Total Courses"
          value={courses.length}
          icon={<LibraryBooksIcon />}
          color="secondary"
          subtitle="Active curriculum"
        />

        <StatCard
          title="Active Instructors"
          value={activeInstructors}
          icon={<SettingsIcon />}
          color="info"
          subtitle="Faculty members"
        />

        <StatCard
          title="Published Courses"
          value={publishedCourses}
          icon={<AddIcon />}
          color="success"
          subtitle="Ready for enrollment"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* CHART SECTON */}
        <Card variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
            User Growth (Last 6 Months)
          </Typography>
          <Box sx={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 8 }} />
                <CartesianGrid stroke="#ccc" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* QUICK ACTIONS */}
        <Card variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, justifyContent: 'center' }}>
            <Button 
              component={RouterLink} 
              to="/manage-courses" 
              variant="contained" 
              fullWidth 
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, gap: 1 }}
            >
              <AddIcon fontSize="small" />
              Create New Course
            </Button>
            <Button 
              component={RouterLink} 
              to="/manage-users" 
              variant="outlined" 
              fullWidth 
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, gap: 1 }}
            >
              <PersonAddIcon fontSize="small" />
              Invite User
            </Button>
            <Button 
              component={RouterLink} 
              to="/manage-users" 
              variant="outlined" 
              fullWidth 
              sx={{ py: 1.5, borderRadius: 2, color: 'text.primary', borderColor: 'divider', fontWeight: 600 }}
            >
              Manage Users
            </Button>
          </Box>
        </Card>
      </Box>

      {/* RECENT USERS TABLE */}
      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: 'divider', mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Recent Registrations
          </Typography>
          <Button component={RouterLink} to="/manage-users" color="primary" sx={{ fontWeight: 600, color: '#ec1818' }}>
            View All
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentUsers.map((user: any) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c', fontWeight: 700, fontSize: '0.8rem' }}>
                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.first_name} {user.last_name}
                        {!user.first_name && !user.last_name && user.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.email || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
                      bgcolor: user.role === 'ADMIN' ? '#fef2f2' : user.role === 'TEACHER' ? '#eff6ff' : '#f0fdf4',
                      color: user.role === 'ADMIN' ? '#dc2626' : user.role === 'TEACHER' ? '#2563eb' : '#16a34a'
                    }}>
                      {user.role || 'STUDENT'}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {recentUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No users found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
