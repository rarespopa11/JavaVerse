import React, { useState, useEffect, createContext, useContext } from 'react';
import Toast from './Toast';

// Creăm un context pentru toast-uri
const ToastContext = createContext();

/**
 * Hook custom pentru utilizarea toast-urilor oriunde în aplicație
 * @returns {Object} Funcții pentru afișarea diferitelor tipuri de toast-uri
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast trebuie folosit în interiorul unui ToastProvider');
  }
  return context;
};

/**
 * Provider pentru sistemul de toast-uri
 * @param {Object} props - Proprietățile componentei
 * @param {React.ReactNode} props.children - Componentele copil
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  // Adaugă un nou toast
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration, visible: true }]);
    return id;
  };
  
  // Funcție pentru diferite tipuri de toast-uri
  const showToast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    warning: (message, duration) => addToast(message, 'warning', duration)
  };
  
  // Elimină un toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            visible={toast.visible}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;