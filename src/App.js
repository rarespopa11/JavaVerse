// src/App.js - Versiunea completă cu suport pentru accesibilitate
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import StarsBackground from './components/StarsBackground';
import { ToastProvider } from './components/ToastProvider';
import { AccessibilityProvider } from './providers/AccessibilityProvider';
import { useAccessibility } from './hooks/useAccessibility';
import AccessibilityIndicator from './components/AccessibilityIndicator';

// Import componente accesibile
import AccessibleMainPage from './components/AccessibleMainPage';
import AccessibleCoursesPage from './components/AccessibleCoursesPage';
import AccessibleQuiz from './components/AccessibleQuiz';

// Import componente normale
import MainPage from './components/MainPage';
import CoursesPage from './components/CoursesPage';
import CourseDetailPage from './components/CourseDetailPage';
import Quiz from './components/Quiz';
import CodePlayground from './components/CodePlayground';

import './styles/theme.css';
import './App.css';

// Componentă wrapper pentru rutele care determină ce componentă să folosească
function RouteWrapper({ AccessibleComponent, NormalComponent, ...props }) {
  const { isAccessibilityMode } = useAccessibility();
  
  const ComponentToRender = isAccessibilityMode ? AccessibleComponent : NormalComponent;
  return <ComponentToRender {...props} />;
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isAccessibilityMode, announceNavigation } = useAccessibility();

  useEffect(() => {
    // Verificăm sessionStorage în loc de localStorage
    const token = sessionStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    // Ștergem din sessionStorage în loc de localStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    setIsAuthenticated(false);
    
    if (isAccessibilityMode) {
      announceNavigation('Deconectat cu succes. Redirecționez către pagina principală.');
    }
    
    window.location.href = '/';
  };

  // Adăugăm clase CSS pentru accesibilitate la body
  useEffect(() => {
    if (isAccessibilityMode) {
      document.body.classList.add('accessibility-mode');
      document.body.style.fontSize = '18px';
      document.body.style.lineHeight = '1.6';
    } else {
      document.body.classList.remove('accessibility-mode');
      document.body.style.fontSize = '';
      document.body.style.lineHeight = '';
    }
  }, [isAccessibilityMode]);

  return (
    <Router>
      <div className="App">
        {/* Adăugăm fundalul cu stele peste întreaga aplicație */}
        <StarsBackground />
        
        {/* Indicator pentru modul de accesibilitate */}
        <AccessibilityIndicator />
        
        <Header 
          isAuthenticated={isAuthenticated} 
          handleLogout={handleLogout} 
        />
        
        <div className="body-content">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <RouteWrapper 
                    AccessibleComponent={AccessibleCoursesPage}
                    NormalComponent={CoursesPage}
                  />
                ) : (
                  <RouteWrapper 
                    AccessibleComponent={AccessibleMainPage}
                    NormalComponent={MainPage}
                  />
                )
              } 
            />
            
            <Route 
              path="/login" 
              element={<Login setIsAuthenticated={setIsAuthenticated} />} 
            />
            
            <Route 
              path="/register" 
              element={<Register />} 
            />
            
            <Route 
              path="/courses" 
              element={
                <RouteWrapper 
                  AccessibleComponent={AccessibleCoursesPage}
                  NormalComponent={CoursesPage}
                />
              } 
            />
            
            <Route 
              path="/courses/:courseId/lesson/:lessonId" 
              element={<CourseDetailPage />} 
            />
            
            <Route 
              path="/courses/:courseId/test" 
              element={
                <RouteWrapper 
                  AccessibleComponent={AccessibleQuiz}
                  NormalComponent={Quiz}
                />
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                isAuthenticated ? (
                  <Profile />
                ) : (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                )
              } 
            />
            
            <Route 
              path="/playground" 
              element={<CodePlayground />}
            />
          </Routes>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ToastProvider>
      <AccessibilityProvider>
        <AppContent />
      </AccessibilityProvider>
    </ToastProvider>
  );
}

export default App;