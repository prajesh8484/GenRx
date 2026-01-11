import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Search from './pages/Search';
import Upload from './pages/Upload';
import JanAushadhi from './pages/JanAushadhi';
import CursorBackground from './components/CursorBackground';

import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Login />;
};

function App() {
  return (
    <AccessibilityProvider>
    <AuthProvider>
    <LanguageProvider>
      <CursorBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/stores" element={<JanAushadhi />} />
                  {/* Redirect unknown routes to dashboard */}
                  <Route path="*" element={<Dashboard />} /> 
                </Routes>
              </>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
    </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;
