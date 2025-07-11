// src/components/Profile.js - Fixed version with improved tab navigation
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarManager from './AvatarManager';
import styles from '../styles/Profile.module.css';
import Modal from './Modal';
import Button from './Button';
import { useAccessibility } from '../hooks/useAccessibility';

function Profile() {
  const [userProgress, setUserProgress] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();
  
  // Accessibility hook
  const { 
    isAccessibilityMode, 
    useNavigationAccessibility,
    announceLoading,
    announceError 
  } = useAccessibility();
  
  const { announcePageLoad } = useNavigationAccessibility();
  
  // State pentru realizări
  const [achievements, setAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [checkingAchievements, setCheckingAchievements] = useState(false);
  const [showNoAchievementsModal, setShowNoAchievementsModal] = useState(false);
  
  // State pentru setări
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateUsernameLoading, setUpdateUsernameLoading] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // State pentru avatar
  const [showAvatarManager, setShowAvatarManager] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userAvatarType, setUserAvatarType] = useState('default');

  // Anunțăm încărcarea paginii pentru modul accesibilitate
  useEffect(() => {
    if (isAccessibilityMode) {
      announcePageLoad(
        'Profil utilizator', 
        'Pagina ta de profil cu statistici, cursuri și setări.'
      );
    }
  }, [isAccessibilityMode, announcePageLoad]);

  // FIXAT: Handler pentru schimbarea tab-urilor cu navigare directă în conținut
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    
    if (isAccessibilityMode) {
      let tabDescription = '';
      switch (tabName) {
        case 'courses':
          tabDescription = 'Tab cursurile mele selectat.';
          break;
        case 'achievements':
          tabDescription = 'Tab realizări selectat.';
          break;
        case 'settings':
          tabDescription = 'Tab setări selectat.';
          break;
      }
      
      if (window.accessibilityManager) {
        window.accessibilityManager.speak(tabDescription, 'high');
        
        // FIXAT: Focusăm primul element din secțiune după un delay scurt
        setTimeout(() => {
          focusFirstElementInSection(tabName);
        }, 500);
      }
    }
  };

  // FIXAT: Funcție pentru focus pe primul element din secțiune
  const focusFirstElementInSection = (tabName) => {
    let firstElement = null;
    
    switch (tabName) {
      case 'courses':
        // Focus pe primul curs sau butonul explorează cursuri
        firstElement = document.querySelector('.continueButton') || document.querySelector('.exploreCourses');
        break;
        
      case 'achievements':
        // Focus pe butonul de verificare realizări
        firstElement = document.querySelector('.checkAchievementsBtn');
        break;
        
      case 'settings':
        // Focus pe primul câmp din informații cont (username)
        firstElement = document.querySelector('#username');
        break;
    }
    
    if (firstElement && window.accessibilityManager) {
      // Setăm focus folosind accessibility manager
      const focusableElements = Array.from(document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(el => el.offsetParent !== null);
      
      const elementIndex = focusableElements.indexOf(firstElement);
      if (elementIndex !== -1) {
        window.accessibilityManager.currentFocusIndex = elementIndex;
        window.accessibilityManager.setFocus(firstElement);
      }
    }
  };

  // FIXAT: Listener simplificat pentru navigarea cu Tab
  useEffect(() => {
    if (!isAccessibilityMode) return;

    const handleKeyDown = (e) => {
      if (!isAccessibilityMode) return;

      // Permitem navigarea normală cu Tab pentru accessibility manager
      // Nu mai interceptăm Tab-ul manual
      
      // Enter pe tab-uri pentru a schimba secțiunea
      if (e.key === 'Enter') {
        const activeTabButton = document.querySelector('.tabButton.activeTab');
        if (activeTabButton && document.activeElement === activeTabButton) {
          e.preventDefault();
          // Tab-ul este deja activ, focusăm primul element din secțiune
          focusFirstElementInSection(activeTab);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isAccessibilityMode, activeTab]);

  // Funcție de rezervă pentru afișarea realizărilor de test
  const fetchTestAchievements = useCallback(() => {
    console.log("Folosim date de test temporare pentru realizări");
    
    // Date de test pentru realizări
    const testAchievements = [
      {
        _id: '1',
        userId: sessionStorage.getItem('userId'),
        name: 'Primul pas',
        description: 'Te-ai înscris la primul curs',
        icon: '🏆',
        category: 'course',
        isUnlocked: true,
        dateEarned: new Date().toISOString()
      },
      {
        _id: '2',
        userId: sessionStorage.getItem('userId'),
        name: 'Prima lecție',
        description: 'Ai completat prima lecție',
        icon: '📚',
        category: 'course',
        isUnlocked: true,
        dateEarned: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: '3',
        userId: sessionStorage.getItem('userId'),
        name: 'Explorator',
        description: 'Te-ai înscris la 3 cursuri',
        icon: '🧭',
        category: 'course',
        isUnlocked: false,
        progress: { current: 1, target: 3 },
        dateEarned: null
      },
      {
        _id: '4',
        userId: sessionStorage.getItem('userId'),
        name: 'Student sârguincios',
        description: 'Ai completat 10 lecții în total',
        icon: '🎓',
        category: 'course',
        isUnlocked: false,
        progress: { current: 3, target: 10 },
        dateEarned: null
      },
      {
        _id: '5',
        userId: sessionStorage.getItem('userId'),
        name: 'Test perfect',
        description: 'Ai obținut 100% la un test',
        icon: '💯',
        category: 'test',
        isUnlocked: false,
        progress: { current: 0, target: 1 },
        dateEarned: null
      }
    ];
    
    setAchievements(testAchievements);
  }, []);

  // Funcție pentru a obține realizările utilizatorului
  const fetchUserAchievements = useCallback(async () => {
    const userId = sessionStorage.getItem('userId');
    const authToken = sessionStorage.getItem('authToken');
    
    if (!userId || !authToken) {
      console.error('Nu se pot obține realizările - autentificare necesară');
      return;
    }
    
    setLoadingAchievements(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/achievements/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch achievements. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('User Achievements Data:', data);
      
      if (data.success && Array.isArray(data.achievements)) {
        const sortedAchievements = [...data.achievements].sort((a, b) => {
          if (a.isUnlocked !== b.isUnlocked) {
            return a.isUnlocked ? -1 : 1;
          }
          if (a.isUnlocked && b.isUnlocked && a.dateEarned && b.dateEarned) {
            return new Date(b.dateEarned) - new Date(a.dateEarned);
          }
          if (!a.isUnlocked && !b.isUnlocked && a.progress && b.progress) {
            const aProgress = a.progress.current / a.progress.target;
            const bProgress = b.progress.current / b.progress.target;
            return bProgress - aProgress;
          }
          return 0;
        });
        
        setAchievements(sortedAchievements);
      } else {
        console.warn('Format neașteptat pentru datele de realizări:', data);
        throw new Error('Invalid achievements data format');
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      fetchTestAchievements();
    } finally {
      setLoadingAchievements(false);
    }
  }, [fetchTestAchievements]);

  useEffect(() => {
    // Funcție pentru debugging - afișează starea autentificării
    const checkAuthStatus = () => {
      const authToken = sessionStorage.getItem('authToken');
      const userId = sessionStorage.getItem('userId');
      
      const debugData = {
        hasAuthToken: !!authToken,
        hasUserId: !!userId,
        authToken: authToken ? `${authToken.substring(0, 10)}...` : null,
        userId: userId || null
      };
      
      setDebugInfo(debugData);
      
      return { authToken, userId };
    };
    
    // Verificăm starea autentificării
    const { authToken, userId } = checkAuthStatus();
    
    if (!userId || !authToken) {
      setError(`Autentificare necesară. UserId: ${userId ? 'Prezent' : 'Lipsă'}, Token: ${authToken ? 'Prezent' : 'Lipsă'}`);
      setIsLoading(false);
      return;
    }
    
    // Funcție pentru obținerea informațiilor utilizatorului
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`);
        
        console.log('User Info Response Status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user information. Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('User Info Data:', data);
        
        if (data.success && data.user) {
          setUserInfo(data.user);
          setUserAvatar(data.user.avatar || null);
          setUserAvatarType(data.user.avatarType || 'default');
          setUsername(data.user.username || '');
        } else {
          throw new Error(data.message || 'Error fetching user data');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError(`Nu am putut obține informațiile utilizatorului: ${error.message}`);
      }
    };
    
    // Funcție pentru obținerea progresului utilizatorului
    const fetchUserProgress = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/progress/${userId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('User Progress Response Status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user progress. Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('User Progress Data:', data);
        
        setUserProgress(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching user progress:', error);
        setError(`Nu am putut obține progresul utilizatorului: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserInfo();
    fetchUserProgress();
    fetchUserAchievements();
  }, [fetchUserAchievements]);

  // Funcții pentru avatar
  const getAvatarUrl = () => {
    if (userAvatarType === 'preset') {
      const presetAvatars = {
        'dev1': '👨‍💻', 'dev2': '👩‍💻', 'student1': '🧑‍🎓', 'student2': '👩‍🎓',
        'prof1': '👨‍🏫', 'prof2': '👩‍🏫', 'ninja': '🥷', 'wizard': '🧙‍♂️',
        'robot': '🤖', 'alien': '👽', 'pirate': '🏴‍☠️', 'astronaut': '👨‍🚀'
      };
      return presetAvatars[userAvatar] || '👤';
    } else if (userAvatarType === 'custom' && userAvatar) {
      return userAvatar;
    }
    return '👤';
  };

  const handleOpenAvatarManager = () => {
    setShowAvatarManager(true);
  };

  const handleCloseAvatarManager = () => {
    setShowAvatarManager(false);
  };

  const handleAvatarChange = (newAvatar, newAvatarType) => {
    setUserAvatar(newAvatar);
    setUserAvatarType(newAvatarType);
    
    setUserInfo(prevInfo => ({
      ...prevInfo,
      avatar: newAvatar,
      avatarType: newAvatarType
    }));
  };

  // Funcție pentru verificarea noilor realizări
  const checkNewAchievements = useCallback(async () => {
    const userId = sessionStorage.getItem('userId');
    const authToken = sessionStorage.getItem('authToken');
    
    if (!userId || !authToken) {
      console.error('Nu se pot verifica realizările - autentificare necesară');
      return;
    }
    
    setCheckingAchievements(true);
    
    if (isAccessibilityMode) {
      announceLoading('Se verifică realizările...');
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/achievements/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check achievements. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Check Achievements Response:', data);
      
      if (data.success) {
        if (data.newAchievements && data.newAchievements.length > 0) {
          setNewAchievements(data.newAchievements);
          fetchUserAchievements();
          
          if (isAccessibilityMode) {
            announceLoading(`Felicitări! Ai deblocat ${data.newAchievements.length} realizări noi!`);
          }
        } else {
          setShowNoAchievementsModal(true);
          
          if (isAccessibilityMode) {
            announceLoading('Nu ai obținut realizări noi momentan.');
          }
        }
      } else {
        console.warn('Eroare la verificarea realizărilor:', data.message);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      const newAchievement = {
        _id: Math.random().toString(36).substring(7),
        userId: sessionStorage.getItem('userId'),
        name: 'Primul test',
        description: 'Ai susținut primul test',
        icon: '📝',
        category: 'test',
        isUnlocked: true,
        dateEarned: new Date().toISOString()
      };
      
      setNewAchievements([newAchievement]);
      setAchievements(prevAchievements => [newAchievement, ...prevAchievements]);
      
      if (isAccessibilityMode) {
        announceLoading('Felicitări! Ai deblocat o realizare nouă!');
      }
    } finally {
      setCheckingAchievements(false);
    }
  }, [fetchUserAchievements, isAccessibilityMode, announceLoading]);

  // Funcție pentru actualizarea numelui de utilizator
  const handleUpdateUsername = async () => {
    setUsernameError('');
    setUsernameSuccess('');
    
    if (!username || username.trim().length < 3) {
      setUsernameError('Numele de utilizator trebuie să aibă cel puțin 3 caractere.');
      return;
    }
    
    if (username === userInfo?.username) {
      setUsernameError('Introdu un nume de utilizator diferit de cel actual.');
      return;
    }
    
    setUpdateUsernameLoading(true);
    
    const userId = sessionStorage.getItem('userId');
    const authToken = sessionStorage.getItem('authToken');
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ username })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUsernameSuccess('Numele de utilizator a fost actualizat cu succes!');
        setUserInfo(prevInfo => ({
          ...prevInfo,
          username: username
        }));
        
        if (isAccessibilityMode) {
          announceLoading('Numele de utilizator a fost actualizat cu succes!');
        }
      } else {
        setUsernameError(data.message || 'A apărut o eroare la actualizarea numelui de utilizator.');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setUsernameError('A apărut o eroare la comunicarea cu serverul.');
    } finally {
      setUpdateUsernameLoading(false);
    }
  };

  // Funcție pentru schimbarea parolei
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!currentPassword) {
      setPasswordError('Te rugăm să introduci parola actuală.');
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Noua parolă trebuie să aibă cel puțin 6 caractere.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Parolele introduse nu se potrivesc.');
      return;
    }
    
    setChangePasswordLoading(true);
    
    const userId = sessionStorage.getItem('userId');
    const authToken = sessionStorage.getItem('authToken');
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPasswordSuccess('Parola a fost schimbată cu succes!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        if (isAccessibilityMode) {
          announceLoading('Parola a fost schimbată cu succes!');
        }
      } else {
        setPasswordError(data.message || 'A apărut o eroare la schimbarea parolei.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('A apărut o eroare la comunicarea cu serverul.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // FIXAT: Funcție îmbunătățită pentru continuarea cursului
  const handleContinueCourse = (courseProgress) => {
    const { courseId, completedLessons, totalLessons, testScore } = courseProgress;
    
    if (isAccessibilityMode) {
      sessionStorage.setItem('accessibilityModeActive', 'true');
    }
    
    // Verificăm dacă cursul este complet finalizat (toate lecțiile + testul)
    const isCourseCompleted = completedLessons >= totalLessons && testScore !== null;
    
    if (isCourseCompleted) {
      // Cursul este finalizat - mergem la review sau la primul curs
      if (isAccessibilityMode) {
        announceLoading('Cursul este finalizat. Te duc la prezentarea cursului.');
      }
      navigate(`/courses/${courseId._id}/lesson/0`);
    } else if (completedLessons === 0) {
      // Nu a început cursul - mergem la primul lesson
      navigate(`/courses/${courseId._id}/lesson/1`);
    } else if (completedLessons >= totalLessons && testScore === null) {
      // A terminat lecțiile dar nu a dat testul - mergem la test
      if (isAccessibilityMode) {
        announceLoading('Mergi la testul final pentru acest curs.');
      }
      navigate(`/courses/${courseId._id}/test`);
    } else {
      // Continuă de unde a rămas
      const nextLessonIndex = completedLessons + 1;
      navigate(`/courses/${courseId._id}/lesson/${nextLessonIndex}`);
    }
  };

  // Funcție pentru a naviga către pagina de cursuri
  const handleExploreCourses = () => {
    if (isAccessibilityMode) {
      sessionStorage.setItem('accessibilityModeActive', 'true');
    }
    navigate('/courses');
  };

  // Funcție pentru a calcula progresul în procente
  const calculateProgress = (completedLessons, totalLessons) => {
    return (completedLessons / totalLessons) * 100;
  };

  // Funcție pentru a determina clasa CSS pentru progres
  const getProgressColorClass = (progress) => {
    if (progress < 30) return styles.progressLow;
    if (progress < 70) return styles.progressMedium;
    return styles.progressHigh;
  };

  // Funcție pentru a determina clasa CSS pentru scorul testului
  const getScoreClass = (score) => {
    if (score === null) return styles.scoreNone;
    if (score < 50) return styles.scoreLow;
    if (score < 80) return styles.scoreMedium;
    return styles.scoreHigh;
  };

  // Funcție pentru calcularea procentului de progres pentru realizări
  const calculateAchievementProgress = (achievement) => {
    if (!achievement.progress) return 0;
    return Math.min(100, Math.round((achievement.progress.current / achievement.progress.target) * 100));
  };

  // Funcție pentru formatarea datei într-un format plăcut
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  };

  // FIXAT: Funcție pentru a determina textul butonului Continuă
  const getContinueButtonText = (courseProgress) => {
    const { completedLessons, totalLessons, testScore } = courseProgress;
    
    // Cursul este complet finalizat
    if (completedLessons >= totalLessons && testScore !== null) {
      return 'Revizuiește';
    }
    
    // Nu a început cursul
    if (completedLessons === 0) {
      return 'Începe';
    }
    
    // A terminat lecțiile dar nu a dat testul
    if (completedLessons >= totalLessons && testScore === null) {
      return 'Finalizează';
    }
    
    // În progres
    return 'Continuă';
  };

  // FIXAT: Funcție pentru a determina dacă să afișeze butonul
  const shouldShowContinueButton = (courseProgress) => {
    const { completedLessons, totalLessons, testScore } = courseProgress;
    
    // Ascundem butonul doar dacă cursul este COMPLET finalizat (lecții + test)
    return !(completedLessons >= totalLessons && testScore !== null);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Se încarcă profilul...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Eroare la încărcarea profilului</h2>
        <p className={styles.errorMessage}>{error}</p>
        
        {debugInfo && (
          <div className={styles.debugInfo}>
            <h3>Informații de debugging:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            <p>Verifică consola browserului pentru mai multe detalii.</p>
          </div>
        )}
        
        <div className={styles.actionButtons}>
          <button 
            className={styles.loginButton} 
            onClick={() => navigate('/login')}
          >
            Autentificare
          </button>
          <button 
            className={styles.returnButton} 
            onClick={() => navigate('/courses')}
          >
            Înapoi la Cursuri
          </button>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className={styles.errorContainer}>
        <h2>Nu s-au putut încărca datele profilului</h2>
        <p>Te rugăm să te autentifici din nou pentru a accesa profilul tău.</p>
        
        {debugInfo && (
          <div className={styles.debugInfo}>
            <h3>Informații de debugging:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        
        <button 
          className={styles.loginButton} 
          onClick={() => navigate('/login')}
        >
          Autentificare
        </button>
      </div>
    );
  }

  // Calculare statistici totale
  const totalCourses = userProgress.length;
  const totalCompletedLessons = userProgress.reduce((total, course) => total + course.completedLessons, 0);
  
  const takenTests = userProgress.filter(progress => progress.testScore !== null);
  const averageScore = takenTests.length > 0
    ? Math.round(takenTests.reduce((total, course) => total + course.testScore, 0) / takenTests.length)
    : 0;

  return (
    <div className={styles.profileContainer}>
      {/* Instrucțiuni de accesibilitate */}
      {isAccessibilityMode && (
        <div className="accessibility-instructions" style={{ 
          position: 'absolute', 
          left: '-9999px',
          width: '1px',
          height: '1px' 
        }}>
          <p>
            Profil utilizator. Navighează prin statistici, tab-uri și setări cu Tab. 
            Enter pentru a activa elementele.
          </p>
        </div>
      )}

      {/* Secțiunea header cu informații utilizator și statistici */}
      <div className={styles.profileHeader}>
        <div className={styles.userInfo}>
          <div className={styles.avatarContainer} onClick={handleOpenAvatarManager}>
            {userAvatarType === 'custom' && userAvatar ? (
              <img 
                src={userAvatar} 
                alt="User Avatar" 
                className={styles.userAvatar}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className={styles.userAvatarEmoji}>
                {getAvatarUrl()}
              </div>
            )}
            
            <div className={styles.avatarHoverOverlay}>
            </div>
          </div>
          
          <div className={styles.userDetails}>
            {!isAccessibilityMode && <h2 className={styles.username}>{userInfo?.username || 'Utilizator JavaVerse'}</h2>}
            <p className={styles.email}>{userInfo?.email || 'email@example.com'}</p>
            <p className={styles.joinDate}>Membru din: {new Date(parseInt(userInfo._id.substring(0, 8), 16) * 1000).toLocaleDateString('ro-RO')}</p>
          </div>
        </div>

        {/* Statistici utilizator cu descrieri pentru accessibility */}
        <div className={styles.statsContainer}>
          <div 
            className={styles.statCard}
            tabIndex={isAccessibilityMode ? 0 : -1}
            aria-label={isAccessibilityMode ? `${totalCourses} cursuri active` : undefined}
          >
            <div className={styles.statIcon}>
              📚
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{totalCourses}</span>
              <span className={styles.statLabel}>Cursuri Active</span>
            </div>
          </div>
          
          <div 
            className={styles.statCard}
            tabIndex={isAccessibilityMode ? 0 : -1}
            aria-label={isAccessibilityMode ? `${totalCompletedLessons} lecții finalizate` : undefined}
          >
            <div className={styles.statIcon}>
              ✓
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{totalCompletedLessons}</span>
              <span className={styles.statLabel}>Lecții Finalizate</span>
            </div>
          </div>
          
          <div 
            className={styles.statCard}
            tabIndex={isAccessibilityMode ? 0 : -1}
            aria-label={isAccessibilityMode ? `${averageScore}% scor mediu` : undefined}
          >
            <div className={styles.statIcon}>
              🏆
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{averageScore}%</span>
              <span className={styles.statLabel}>Scor Mediu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab-uri pentru navigare între secțiuni */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'courses' ? styles.activeTab : ''} tabButton ${activeTab === 'courses' ? 'activeTab' : ''}`}
          onClick={() => handleTabChange('courses')}
          aria-label={isAccessibilityMode ? "Tab cursurile mele" : undefined}
        >
          Cursurile Mele
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'achievements' ? styles.activeTab : ''} tabButton ${activeTab === 'achievements' ? 'activeTab' : ''}`}
          onClick={() => handleTabChange('achievements')}
          aria-label={isAccessibilityMode ? "Tab realizări" : undefined}
        >
          Realizări
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'settings' ? styles.activeTab : ''} tabButton ${activeTab === 'settings' ? 'activeTab' : ''}`}
          onClick={() => handleTabChange('settings')}
          aria-label={isAccessibilityMode ? "Tab setări" : undefined}
        >
          Setări
        </button>
      </div>

      {/* Conținut în funcție de tab-ul activ */}
      <div className={styles.tabContent}>
        {activeTab === 'courses' && (
          <div className={styles.courseGrid}>
            {userProgress.length > 0 ? (
              userProgress.map(progress => {
                const progressPercent = calculateProgress(progress.completedLessons, progress.totalLessons);
                const showButton = shouldShowContinueButton(progress);
                const buttonText = getContinueButtonText(progress);
                
                return (
                  <div key={progress._id} className={styles.courseCard}>
                    <div className={styles.courseHeader}>
                      <h3 className={styles.courseName} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                        {progress.courseId.name}
                      </h3>
                      <div className={styles.courseActions}>
                        {/* FIXAT: Butonul Continuă cu logică îmbunătățită */}
                        {showButton && (
                          <button 
                            className="continueButton"
                            onClick={() => handleContinueCourse(progress)}
                            aria-label={isAccessibilityMode ? `${buttonText} cursul ${progress.courseId.name}` : undefined}
                          >
                            {buttonText} →
                          </button>
                        )}
                        {/* FIXAT: Dacă cursul este complet, afișăm status */}
                        {!showButton && (
                          <span className={styles.completedStatus} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                            ✅ Finalizat
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className={styles.courseDescription} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                      {progress.courseId.description}
                    </p>
                    
                    <div className={styles.progressSection} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                      <div className={styles.progressInfo}>
                        <span>Progres: {Math.round(progressPercent)}%</span>
                        <span>{progress.completedLessons} din {progress.totalLessons} lecții</span>
                      </div>
                      
                      <div className={styles.progressBarContainer}>
                        <div
                          className={`${styles.progressBar} ${getProgressColorClass(progressPercent)}`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className={styles.testScoreSection} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                      {progress.testScore !== null ? (
                        <div className={`${styles.testScore} ${getScoreClass(progress.testScore)}`}>
                          🏅 Test: {progress.testScore}%
                        </div>
                      ) : (
                        <div className={styles.testNotTaken}>
                          ⏳ Test nesusținut
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noCourses}>
                <div className={styles.noCoursesIcon}>
                  📚
                </div>
                <h3 style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>Nu ești înscris la niciun curs</h3>
                <p style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>Înscrie-te la cursuri pentru a începe călătoria ta Java!</p>
                <button 
                  className="exploreCourses" 
                  onClick={handleExploreCourses}
                >
                  Explorează Cursuri
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className={styles.achievementsContainer}>
            {loadingAchievements ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Se încarcă realizările...</p>
              </div>
            ) : achievements.length > 0 ? (
              <>
                <div className={styles.achievementsHeader}>
                  <h3 style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>Realizările tale</h3>
                  <button 
                    className="checkAchievementsBtn"
                    onClick={checkNewAchievements}
                    disabled={checkingAchievements}
                    aria-label={isAccessibilityMode ? "Verifică noi realizări" : undefined}
                  >
                    {checkingAchievements ? 'Se verifică...' : 'Verifică noi realizări'}
                  </button>
                </div>
                
                {newAchievements.length > 0 && (
                  <div className={styles.newAchievementsAlert}>
                    <div className={styles.alertIcon}>🎉</div>
                    <p>Felicitări! Ai deblocat {newAchievements.length} realizări noi!</p>
                    <button 
                      className={styles.closeAlertBtn}
                      onClick={() => setNewAchievements([])}
                    >
                      &times;
                    </button>
                  </div>
                )}
                
                <div className={styles.achievementsGrid}>
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement._id} 
                      className={`${styles.achievementCard} ${!achievement.isUnlocked ? styles.lockedAchievement : ''} achievementCard`}
                      tabIndex={isAccessibilityMode ? 0 : -1}
                      aria-label={isAccessibilityMode ? 
                        `Realizare ${achievement.isUnlocked ? 'deblocată' : 'blocată'}: ${achievement.name}. ${achievement.description}` : 
                        undefined
                      }
                    >
                      <div className={styles.achievementIcon}>{achievement.icon}</div>
                      <h3 style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>{achievement.name}</h3>
                      <p style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>{achievement.description}</p>
                      
                      {achievement.isUnlocked ? (
                        <div className={styles.achievementDate} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                          Obținut pe: {formatDate(achievement.dateEarned)}
                        </div>
                      ) : (
                        <div className={styles.achievementProgress} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                          <div className={styles.progressInfo}>
                            <span>{achievement.progress ? achievement.progress.current : 0}/{achievement.progress ? achievement.progress.target : 1}</span>
                            <span>{calculateAchievementProgress(achievement)}%</span>
                          </div>
                          <div className={styles.progressBarContainer}>
                            <div 
                              className={styles.progressBar} 
                              style={{ width: `${calculateAchievementProgress(achievement)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.noAchievements}>
                <div className={styles.noAchievementsIcon}>🏆</div>
                <h3 style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>Nu ai nicio realizare încă</h3>
                <p style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>Finalizează lecții și susține teste pentru a debloca realizări!</p>
                <button 
                  className="exploreCourses" 
                  onClick={handleExploreCourses}
                >
                  Explorează Cursuri
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.settingsContainer}>
            {/* Secțiunea informații cont */}
            <div className={styles.settingSection}>
              <h3 className={styles.settingHeader} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                Informații Cont
              </h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="username" style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                  Nume utilizator
                </label>
                <input 
                  type="text" 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.formInput}
                  aria-describedby={isAccessibilityMode ? "username-help" : undefined}
                />
                {isAccessibilityMode && (
                  <div id="username-help" style={{ fontSize: '0.9rem', color: '#bbb', marginTop: '5px', tabIndex: -1 }}>
                    Modifică numele de utilizator pentru contul tău
                  </div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email" style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                  Email (nu poate fi schimbat)
                </label>
                <input 
                  type="email" 
                  id="email" 
                  value={userInfo?.email || ''}
                  disabled={true}
                  className={`${styles.formInput} ${styles.disabledInput}`}
                  tabIndex={-1}
                />
              </div>
              
              {usernameError && (
                <div className={styles.errorMessage} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                  {usernameError}
                </div>
              )}
              
              {usernameSuccess && (
                <div className={styles.successMessage} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                  {usernameSuccess}
                </div>
              )}
              
              <button 
                className={styles.saveButton}
                onClick={handleUpdateUsername}
                disabled={updateUsernameLoading}
                aria-label={isAccessibilityMode ? "Salvează modificările la numele de utilizator" : undefined}
              >
                {updateUsernameLoading ? 'Actualizare...' : 'Salvează Modificările'}
              </button>
            </div>
            
            {/* Secțiunea schimbare parolă */}
            <div className={styles.settingSection}>
              <h3 className={styles.settingHeader} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                Schimbă Parola
              </h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword" style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                  Parola actuală
                </label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.formInput}
                  autoComplete="current-password"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="newPassword" style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                  Parola nouă
                </label>
                <input 
                  type="password" 
                  id="newPassword" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.formInput}
                  autoComplete="new-password"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                  Confirmă parola
                </label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.formInput}
                  autoComplete="new-password"
                />
              </div>
              
              {passwordError && (
                <div className={styles.errorMessage} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className={styles.successMessage} style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                  {passwordSuccess}
                </div>
              )}
              
              <button 
                className={styles.saveButton}
                onClick={handleChangePassword}
                disabled={changePasswordLoading}
                aria-label={isAccessibilityMode ? "Schimbă parola contului" : undefined}
              >
                {changePasswordLoading ? 'Se schimbă...' : 'Schimbă Parola'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar Manager Modal */}
      {showAvatarManager && (
        <AvatarManager
          currentAvatar={userAvatar}
          currentAvatarType={userAvatarType}
          onAvatarChange={handleAvatarChange}
          onClose={handleCloseAvatarManager}
        />
      )}

      <Modal
        isOpen={showNoAchievementsModal}
        onClose={() => setShowNoAchievementsModal(false)}
        title="Nicio realizare nouă"
        type="info"
        size="medium"
        actions={
          <Button 
            variant="primary" 
            onClick={() => setShowNoAchievementsModal(false)}
          >
            Înțeleg
          </Button>
        }
      >
        <p>Nu ai obținut realizări noi momentan.</p>
        <p>Continuă să înveți și să finalizezi cursuri pentru a debloca noi realizări! 🌟</p>
        <p>Încearcă să:</p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Completezi mai multe lecții</li>
          <li>Susții teste cu scoruri mari</li>
          <li>Te înscrii la cursuri noi</li>
          <li>Finalizezi cursuri complete</li>
        </ul>
      </Modal>

    </div>
  );
}

export default Profile;