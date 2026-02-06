import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectList from './features/projects/ProjectList';
import ProjectForm from './features/projects/ProjectForm';
import ProjectDetail from './pages/ProjectDetail';
import Repositories from './pages/Repositories';
import ActivityLogs from './pages/ActivityLogs';
import Monitors from './pages/Monitors';
import ApiTests from './pages/ApiTests';
import Layout from './components/Layout';

// Simple Auth Layout Stub
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('token'); // Simple check
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes Wrapped in Layout */}
        <Route element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/logs" element={<ActivityLogs />} />
          <Route path="/monitors" element={<Monitors />} />
          <Route path="/tests" element={<ApiTests />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
