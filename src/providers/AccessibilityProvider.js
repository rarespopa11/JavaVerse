// src/providers/AccessibilityProvider.js - Improved with persistent mode
import React, { createContext, useContext, useEffect, useState } from 'react';
import accessibilityManager from '../utils/AccessibilityManager';

const AccessibilityContext = createContext();

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);

  useEffect(() => {
    // Listener pentru schimbări de mod accesibilitate
    const handleAccessibilityChange = (event) => {
      setIsAccessibilityMode(event.detail.isActive);
    };

    document.addEventListener('accessibilityModeChanged', handleAccessibilityChange);
    
    // ÎMBUNĂTĂȚIRE: Verificăm starea salvată în sessionStorage
    const checkSavedAccessibilityState = () => {
      const savedState = sessionStorage.getItem('accessibilityModeActive');
      
      if (savedState === 'true') {
        // Reactivăm modul de accesibilitate fără să anunțăm din nou welcome message
        if (!accessibilityManager.isActive) {
          accessibilityManager.isAccessibilityMode = true;
          accessibilityManager.addAccessibilityStyles();
          accessibilityManager.updateFocusableElements();
          
          // Anunțăm că modul este activ pe această pagină
          setTimeout(() => {
            accessibilityManager.speak("Modul pentru nevăzători este activ pe această pagină.", 'high');
          }, 1000);
          
          document.dispatchEvent(new CustomEvent('accessibilityModeChanged', {
            detail: { isActive: true }
          }));
        }
        
        setIsAccessibilityMode(true);
      } else {
        // Setăm starea inițială
        setIsAccessibilityMode(accessibilityManager.isActive);
      }
    };

    // Verificăm imediat starea salvată
    checkSavedAccessibilityState();

    // ÎMBUNĂTĂȚIRE: Modificăm anunțarea instrucțiunilor inițiale
    const announceInitialInstructions = () => {
      // Verificăm dacă modul nu este deja activ
      const savedState = sessionStorage.getItem('accessibilityModeActive');
      
      if (savedState !== 'true') {
        setTimeout(() => {
          accessibilityManager.speak(
            "Bine ai venit în JavaVerse! Pentru a activa modul pentru nevăzători, apasă Control plus Shift plus A",
            'high'
          );
        }, 2000);
      }
    };

    // ÎMBUNĂTĂȚIRE: Anunțăm de fiecare dată când se încarcă o pagină nouă
    if (sessionStorage.getItem('accessibilityModeActive') !== 'true') {
      announceInitialInstructions();
      // Nu mai setăm flag-ul pentru a permite anunțul pe fiecare pagină nouă
    }

    return () => {
      document.removeEventListener('accessibilityModeChanged', handleAccessibilityChange);
    };
  }, []);

  // ÎMBUNĂTĂȚIRE: Listener pentru beforeunload pentru a salva starea
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAccessibilityMode) {
        sessionStorage.setItem('accessibilityModeActive', 'true');
      } else {
        sessionStorage.removeItem('accessibilityModeActive');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAccessibilityMode]);

  const value = {
    isAccessibilityMode,
    accessibilityManager
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};