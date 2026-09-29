
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import CourseManagement from './pages/CourseManagement';
import CourseDetail from './pages/CourseDetail';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import Appearance from './pages/Appearance';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-courses" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'TEACHER']}>
                  <CourseManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-users" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appearance" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Appearance />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
