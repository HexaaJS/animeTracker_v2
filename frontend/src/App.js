import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import AddAnime from './pages/AddAnime';
import EditAnime from './pages/EditAnime';
import Profile from './pages/Profile';
import './App.css';
import Footer from './components/Footer';

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/setup" />;
};

// Composant pour les routes publiques (si déjà connecté, rediriger)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/setup" element={
        <PublicRoute>
          <Setup />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/add-anime" element={
        <ProtectedRoute>
          <AddAnime />
        </ProtectedRoute>
      } />
      <Route path="/edit-anime/:id" element={
        <ProtectedRoute>
          <EditAnime />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
      <Footer />
    </ThemeProvider>
  );
}

export default App;