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

        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/projects" element={
          <PrivateRoute>
            <ProjectList />
          </PrivateRoute>
        } />

        <Route path="/projects/new" element={
          <PrivateRoute>
            <ProjectForm />
          </PrivateRoute>
        } />

        <Route path="/projects/:id" element={
          <PrivateRoute>
            <ProjectDetail />
          </PrivateRoute>
        } />

        <Route path="/repositories" element={
          <PrivateRoute>
            <Repositories />
          </PrivateRoute>
        } />

        <Route path="/logs" element={
          <PrivateRoute>
            <ActivityLogs />
          </PrivateRoute>
        } />

        <Route path="/monitors" element={
          <PrivateRoute>
            <Monitors />
          </PrivateRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
