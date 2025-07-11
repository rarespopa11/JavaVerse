// src/components/Register.js - Modificat cu suport pentru Google OAuth și accesibilitate
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from './ToastProvider';
import { useAccessibility } from '../hooks/useAccessibility';
import '../styles/FormPage.css';
import '../styles/GoogleAuth.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        'Înregistrare', 
        'Creează un cont nou în JavaVerse completând numele de utilizator, email-ul și parola sau folosește Google pentru înregistrare rapidă.'
      );
    }
  }, [isAccessibilityMode, announcePageLoad]);

  // Verificăm dacă există parametri pentru autentificarea Google (redirect după înregistrare)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const error = params.get('error');

    if (error === 'auth_failed') {
      toast.error('Înregistrare Google eșuată. Te rugăm să încerci din nou.');
      if (isAccessibilityMode) {
        announceFormError('Google înregistrare', 'Înregistrare Google eșuată. Te rugăm să încerci din nou.');
      }
    }

    if (token && userId) {
      // Salvăm token-ul și userId-ul în sessionStorage
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userId', userId);
      
      const successMessage = 'Înregistrare Google reușită! Bine ai venit în JavaVerse!';
      toast.success(successMessage, 5000);
      if (isAccessibilityMode) {
        announceFormSuccess(successMessage);
      }
      
      // Redirecționăm către pagina principală
      navigate('/');
    }
  }, [location, toast, navigate, isAccessibilityMode, announceFormError, announceFormSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validare simplă
    if (!username || !email || !password) {
      const errorMessage = 'Te rugăm să completezi toate câmpurile';
      toast.warning(errorMessage);
      if (isAccessibilityMode) {
        announceFormError('formular', errorMessage);
      }
      return;
    }
    
    // Validare parolă
    if (password.length < 6) {
      const errorMessage = 'Parola trebuie să conțină cel puțin 6 caractere';
      toast.warning(errorMessage);
      if (isAccessibilityMode) {
        announceFormError('parolă', errorMessage);
      }
      return;
    }

    setIsLoading(true);
    
    if (isAccessibilityMode) {
      announceLoading('Se procesează înregistrarea...');
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();

      if (data.success) {
        const successMessage = 'Cont creat cu succes! Te poți autentifica acum.';
        toast.success(successMessage, 5000);
        if (isAccessibilityMode) {
          announceFormSuccess(successMessage);
        }
        navigate('/login');
      } else {
        let errorMessage;
        if (data.message.includes('email')) {
          errorMessage = 'Adresa de email este deja asociată unui cont.';
        } else if (data.message.includes('username')) {
          errorMessage = 'Numele de utilizator este deja folosit.';
        } else {
          errorMessage = data.message || 'Eroare la înregistrare. Te rugăm să încerci din nou.';
        }
        
        toast.error(errorMessage);
        if (isAccessibilityMode) {
          announceFormError('înregistrare', errorMessage);
        }
      }
    } catch (error) {
      console.error('Error during registration:', error);
      const errorMessage = 'Eroare de rețea. Te rugăm să încerci din nou.';
      toast.error(errorMessage);
      if (isAccessibilityMode) {
        announceFormError('conexiune', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Funcție pentru înregistrare cu Google
  const handleGoogleRegister = () => {
    setIsGoogleLoading(true);
    
    if (isAccessibilityMode) {
      announceLoading('Redirecționez către Google pentru înregistrare...');
    }
    
    // Redirecționăm către ruta Google OAuth din backend
    window.location.href = 'http://localhost:5000/auth/google';
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
            Formular de înregistrare. Completează numele de utilizator, email-ul și parola, apoi apasă Enter sau butonul Înregistrare.
            Alternativ, poți folosi butonul Google pentru înregistrare rapidă.
          </p>
        </div>
      )}
      
      <h1>Înregistrare</h1>
      
      {/* Buton Google Register */}
      <div className="google-auth-section">
        <button 
          type="button"
          className="google-login-btn"
          onClick={handleGoogleRegister}
          disabled={isGoogleLoading || isLoading}
          aria-label={isAccessibilityMode ? 
            (isGoogleLoading ? "Se redirecționează către Google..." : "Înregistrează-te cu Google") : 
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
          <label htmlFor="username">Nume de utilizator</label>
          <input 
            type="text" 
            id="username" 
            placeholder="Alege un nume de utilizator" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isGoogleLoading}
            aria-label={isAccessibilityMode ? "Numele de utilizator pentru contul nou, minim 3 caractere" : undefined}
            aria-describedby={isAccessibilityMode ? "username-help" : undefined}
          />
          {isAccessibilityMode && (
            <div id="username-help" style={{ fontSize: '0.9rem', color: '#bbb', marginTop: '5px' }}>
              Alege un nume de utilizator unic cu cel puțin 3 caractere
            </div>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Adresa ta de email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isGoogleLoading}
            aria-label={isAccessibilityMode ? "Adresa de email pentru contul nou" : undefined}
            aria-describedby={isAccessibilityMode ? "email-help" : undefined}
          />
          {isAccessibilityMode && (
            <div id="email-help" style={{ fontSize: '0.9rem', color: '#bbb', marginTop: '5px' }}>
              Introdu o adresă de email validă
            </div>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Parolă</label>
          <input 
            type="password" 
            id="password" 
            placeholder="Creează o parolă" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isGoogleLoading}
            aria-label={isAccessibilityMode ? "Parola pentru contul nou, minim 6 caractere" : undefined}
            aria-describedby={isAccessibilityMode ? "password-help" : undefined}
          />
          {isAccessibilityMode && (
            <div id="password-help" style={{ fontSize: '0.9rem', color: '#bbb', marginTop: '5px' }}>
              Parola trebuie să aibă cel puțin 6 caractere
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading || isGoogleLoading}
          aria-label={isAccessibilityMode ? 
            (isLoading ? "Se procesează înregistrarea..." : "Creează contul nou în JavaVerse") : 
            undefined
          }
        >
          {isLoading ? 'Se procesează...' : 'Înregistrare'}
        </button>
      </form>
      
      <p className="switch-page">
        Ai deja un cont?{' '}
        <Link 
          to="/login"
          aria-label={isAccessibilityMode ? "Mergi la pagina de autentificare dacă ai deja un cont" : undefined}
        >
          Autentifică-te
        </Link>
      </p>
    </div>
  );
}

export default Register;