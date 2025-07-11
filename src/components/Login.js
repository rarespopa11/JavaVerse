// src/components/Login.js - Modificat cu suport pentru Google OAuth și accesibilitate
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from './ToastProvider';
import { useAccessibility } from '../hooks/useAccessibility';
import '../styles/FormPage.css';
import '../styles/GoogleAuth.css'; // CSS pentru butoanele Google

function Login({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Suport pentru accesibilitate
  const { 
    isAccessibilityMode, 
    useNavigationAccessibility,
    announceFormError,
    announceFormSuccess,
    announceLoading 
  } = useAccessibility();
  
  const { announcePageLoad } = useNavigationAccessibility();

  // Anunțăm încărcarea paginii pentru utilizatorii cu accesibilitate
  useEffect(() => {
    if (isAccessibilityMode) {
      announcePageLoad(
        'Autentificare', 
        'Completează email-ul și parola pentru a te autentifica în JavaVerse sau folosește Google pentru autentificare rapidă.'
      );
    }
  }, [isAccessibilityMode, announcePageLoad]);

  // Verificăm dacă există parametri pentru autentificarea Google
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const error = params.get('error');

    if (error === 'auth_failed') {
      toast.error('Autentificare Google eșuată. Te rugăm să încerci din nou.');
      if (isAccessibilityMode) {
        announceFormError('Google autentificare', 'Autentificare Google eșuată. Te rugăm să încerci din nou.');
      }
    }

    if (token && userId) {
      // Salvăm token-ul și userId-ul în sessionStorage
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userId', userId);
      
      // Setăm starea de autentificare
      setIsAuthenticated(true);
      
      const successMessage = 'Autentificare Google reușită! Bine ai venit!';
      toast.success(successMessage);
      if (isAccessibilityMode) {
        announceFormSuccess(successMessage);
      }
      
      // Redirecționăm către pagina principală
      navigate('/');
    }
  }, [location, setIsAuthenticated, toast, navigate, isAccessibilityMode, announceFormError, announceFormSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validare simplă
    if (!formData.email || !formData.password) {
      const errorMessage = 'Te rugăm să completezi toate câmpurile.';
      toast.warning(errorMessage);
      if (isAccessibilityMode) {
        announceFormError('formular', errorMessage);
      }
      return;
    }
    
    setIsLoading(true);
    
    if (isAccessibilityMode) {
      announceLoading('Se procesează autentificarea...');
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Stocăm token-ul în sessionStorage
        sessionStorage.setItem('authToken', data.token);
        
        try {
          // Extragem userId din token
          const base64Url = data.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64)
            .split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const decoded = JSON.parse(jsonPayload);
          
          sessionStorage.setItem('userId', decoded.id || decoded.userId);
        } catch (err) {
          console.error("Error decoding token:", err);
          await fetchUserProfile(data.token);
        }
        
        setIsAuthenticated(true);
        
        const successMessage = 'Autentificare reușită! Bine ai venit!';
        toast.success(successMessage);
        if (isAccessibilityMode) {
          announceFormSuccess(successMessage);
        }
        
        navigate('/');
      } else {
        const errorMessage = data.message || 'Autentificare eșuată. Verifică email-ul și parola.';
        toast.error(errorMessage);
        if (isAccessibilityMode) {
          announceFormError('autentificare', errorMessage);
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      const errorMessage = 'Eroare de rețea. Te rugăm să încerci din nou.';
      toast.error(errorMessage);
      if (isAccessibilityMode) {
        announceFormError('conexiune', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Funcție pentru autentificare Google
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    
    if (isAccessibilityMode) {
      announceLoading('Redirecționez către Google pentru autentificare...');
    }
    
    // Redirecționăm către ruta Google OAuth din backend
    window.location.href = 'http://localhost:5000/auth/google';
  };

  // Funcție de rezervă pentru obținerea profilului
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        sessionStorage.setItem('userId', userData.user._id);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      if (isAccessibilityMode) {
        announceFormError('profil', 'Autentificare reușită, dar există probleme la obținerea profilului.');
      } else {
        toast.warning('Autentificare reușită, dar există probleme la obținerea profilului.');
      }
    }
  };

  return (
    <div className="form-container">
      {isAccessibilityMode && (
        <div className="accessibility-instructions" style={{ 
          position: 'absolute', 
          left: '-9999px',
          width: '1px',
          height: '1px' 
        }}>
          <p>
            Formular de autentificare. Completează email-ul și parola, apoi apasă Enter sau butonul Autentificare.
            Alternativ, poți folosi butonul Google pentru autentificare rapidă.
          </p>
        </div>
      )}
      
      <h1>Autentificare</h1>
      
      {/* Buton Google Login */}
      <div className="google-auth-section">
        <button 
          type="button"
          className="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          aria-label={isAccessibilityMode ? 
            (isGoogleLoading ? "Se redirecționează către Google..." : "Autentifică-te cu Google") : 
            undefined
          }
        >
          <div className="google-icon">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <span>{isGoogleLoading ? 'Se redirecționează...' : 'Continuă cu Google'}</span>
        </button>
        
        <div className="auth-divider">
          <span>sau</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isGoogleLoading}
            aria-label={isAccessibilityMode ? "Adresa de email pentru autentificare" : undefined}
            aria-describedby={isAccessibilityMode ? "email-help" : undefined}
          />
          {isAccessibilityMode && (
            <div id="email-help" style={{ fontSize: '0.9rem', color: '#bbb', marginTop: '5px' }}>
              Introdu adresa de email asociată contului tău
            </div>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Parolă</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isGoogleLoading}
            aria-label={isAccessibilityMode ? "Parola contului tău" : undefined}
            aria-describedby={isAccessibilityMode ? "password-help" : undefined}
          />
          {isAccessibilityMode && (
            <div id="password-help" style={{ fontSize: '0.9rem', color: '#bbb', marginTop: '5px' }}>
              Introdu parola contului tău
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading || isGoogleLoading}
          aria-label={isAccessibilityMode ? 
            (isLoading ? "Se procesează autentificarea..." : "Autentifică-te în JavaVerse") : 
            undefined
          }
        >
          {isLoading ? 'Se procesează...' : 'Autentificare'}
        </button>
      </form>
      
      <div className="switch-page">
        Nu ai un cont?{' '}
        <Link 
          to="/register"
          aria-label={isAccessibilityMode ? "Mergi la pagina de înregistrare pentru a crea un cont nou" : undefined}
        >
          Înregistrează-te
        </Link>
      </div>
    </div>
  );
}

export default Login;