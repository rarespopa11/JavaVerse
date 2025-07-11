// src/components/Header.js - Versiune actualizată pentru accesibilitate
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import { useAccessibility } from '../hooks/useAccessibility';
import '../styles/Header.css';

function Header({ isAuthenticated, handleLogout }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { 
    isAccessibilityMode, 
    useNavigationAccessibility,
    announceNavigation 
  } = useAccessibility();
  
  const { announceMenuOpen, announceMenuClose } = useNavigationAccessibility();

  useEffect(() => {
    const handleScroll = () => {
      if (!isAccessibilityMode) {
        const isScrolled = window.scrollY > 10;
        if (isScrolled !== scrolled) {
          setScrolled(isScrolled);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled, isAccessibilityMode]);

  const toggleMenu = () => {
    const newMenuState = !menuOpen;
    setMenuOpen(newMenuState);
    
    if (isAccessibilityMode) {
      if (newMenuState) {
        announceMenuOpen('navigare principală');
      } else {
        announceMenuClose('navigare principală');
      }
    }
  };

  const handleNavigation = (destination, callback) => {
    if (isAccessibilityMode) {
      announceNavigation(destination);
    }
    if (callback) {
      setTimeout(callback, 100);
    }
  };

  if (isAccessibilityMode) {
    // Versiune simplificată pentru nevăzători
    return (
      <header className="jv-header accessibility-header">
        <div className="jv-header-container">
          <div className="jv-header-logo">
            <h1>JavaVerse - Mod Accesibilitate</h1>
          </div>

          <nav className="jv-header-nav" role="navigation" aria-label="Meniu principal">
            {isAuthenticated ? (
              <ul className="jv-nav-list">
                <li className="jv-nav-item">
                  <Link 
                    to="/courses" 
                    className="jv-nav-link"
                    onClick={() => handleNavigation('cursuri')}
                    aria-label="Cursuri - Tasta C"
                  >
                    Cursuri (C)
                  </Link>
                </li>
                <li className="jv-nav-item">
                  <Link 
                    to="/playground" 
                    className="jv-nav-link"
                    onClick={() => handleNavigation('playground')}
                    aria-label="Playground - Tasta P"
                  >
                    Playground (P)
                  </Link>
                </li>
                <li className="jv-nav-item">
                  <Link 
                    to="/profile" 
                    className="jv-nav-link"
                    onClick={() => handleNavigation('profil')}
                    aria-label="Profil - Tasta R"
                  >
                    Profil (R)
                  </Link>
                </li>
                <li className="jv-nav-item">
                  <button
                    className="jv-nav-link logout-btn"
                    onClick={() => handleNavigation('deconectare', handleLogout)}
                    aria-label="Deconectare"
                  >
                    Deconectare
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="jv-nav-list">
                <li className="jv-nav-item">
                  <Link 
                    to="/login"
                    className="jv-nav-link"
                    onClick={() => handleNavigation('autentificare', () => navigate('/login'))}
                    aria-label="Autentificare"
                  >
                    Autentificare
                  </Link>
                </li>
                <li className="jv-nav-item">
                  <Link 
                    to="/register"
                    className="jv-nav-link"
                    onClick={() => handleNavigation('înregistrare', () => navigate('/register'))}
                    aria-label="Înregistrare"
                  >
                    Înregistrare
                  </Link>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </header>
    );
  }

  // Versiunea normală pentru utilizatorii care văd
  return (
    <header className={`jv-header ${scrolled ? 'jv-header-scrolled' : ''}`}>
      <div className="jv-header-container">
        <div className="jv-header-logo">
          <Link to="/" className="logo-link">
            <h1 className="text-gradient">JavaVerse</h1>
          </Link>
        </div>

        <div className="jv-header-mobile-toggle" onClick={toggleMenu}>
          <div className={`menu-icon ${menuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <nav className={`jv-header-nav ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <ul className="jv-nav-list">
              <li className="jv-nav-item">
                <Link to="/courses" className="jv-nav-link">
                  Cursuri
                </Link>
              </li>
              <li className="jv-nav-item">
                <Link to="/playground" className="jv-nav-link">
                  Playground
                </Link>
              </li>
              <li className="jv-nav-item">
                <Link to="/profile" className="jv-nav-link">
                  Profil
                </Link>
              </li>
              <li className="jv-nav-item">
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={handleLogout}
                  icon="🚪"
                  iconPosition="left"
                >
                  Deconectare
                </Button>
              </li>
            </ul>
          ) : (
            <ul className="jv-nav-list">
              <li className="jv-nav-item">
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => navigate('/login')}
                >
                  Autentificare
                </Button>
              </li>
              <li className="jv-nav-item">
                <Button 
                  variant="primary" 
                  size="small" 
                  onClick={() => navigate('/register')}
                  glow={true}
                >
                  Înregistrare
                </Button>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
