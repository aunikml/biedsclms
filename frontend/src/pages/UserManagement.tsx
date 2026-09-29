import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  MenuItem, Select, FormControl, InputLabel, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const ROLES = ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT'];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [password, setPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('users/');
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUsername(user.username);
      setEmail(user.email);
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setRole(user.role);
      setPassword(''); // Don't populate password on edit
    } else {
      setEditingUser(null);
      setUsername('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setRole('STUDENT');
      setPassword('');
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleSave = async () => {
    try {
      const payload: any = {
        username, email, first_name: firstName, last_name: lastName, role
      };
      // Only include password if it's set (required for create, optional for edit)
      if (password) {
        payload.password = password;
      }

      if (editingUser) {
        await api.patch(`users/${editingUser.id}/`, payload);
      } else {
        await api.post('users/', payload);
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save user", err);
      alert("Failed to save user. Please check the console for details.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`users/${id}/`);
        fetchUsers();
      } catch (err) {
        console.error("Failed to delete user", err);
        alert("Failed to delete user.");
      }
    }
  };

  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'ADMIN': return 'error';
      case 'MANAGER': return 'warning';
      case 'TEACHER': return 'info';
      default: return 'success';
    }
  };

  return (
    <Box>
      <PageHeader 
        title="User Management"
        subtitle="View, create, edit, and remove users across the platform."
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'User Management' }]}
        action={
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Add New User
          </Button>
        }
      />

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.first_name} {u.last_name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip label={u.role} size="small" color={getRoleColor(u.role) as any} sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenModal(u)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(u.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE / EDIT MODAL */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              label="Username" 
              fullWidth 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="First Name" 
                fullWidth 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
              />
              <TextField 
                label="Last Name" 
                fullWidth 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
              />
            </Box>
            <TextField 
              label="Email Address" 
              type="email" 
              fullWidth 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map(r => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField 
              label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
              type="password" 
              fullWidth 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required={!editingUser}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
          <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontWeight: 700 }}>
            {editingUser ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
