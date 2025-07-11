// src/components/Modal.js
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Modal.css';

/**
 * Componentă reutilizabilă pentru modals personalizate
 * Se integrează perfect cu design-ul cosmic al aplicației
 */
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'info',
  showCloseButton = true,
  actions = null,
  size = 'medium'
}) {
  
  // Gestionăm click-ul pe overlay pentru închidere
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Gestionăm ESC pentru închidere - hook-ul trebuie să fie întotdeauna apelat
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Blocare scroll pe body când modal-ul este deschis
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Nu renderăm nimic dacă modal-ul nu este deschis
  if (!isOpen) return null;

  // Obținem iconița în funcție de tipul modal-ului
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'achievement':
        return '🏆';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  // Obținem clasa CSS pentru tipul modal-ului
  const getModalTypeClass = () => {
    return `modal-${type}`;
  };

  // Obținem clasa CSS pentru dimensiunea modal-ului
  const getSizeClass = () => {
    return `modal-${size}`;
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-container ${getModalTypeClass()} ${getSizeClass()}`}>
        {/* Header modal */}
        <div className="modal-header">
          <div className="modal-icon">
            {getIcon()}
          </div>
          {title && <h3 className="modal-title">{title}</h3>}
          {showCloseButton && (
            <button className="modal-close-btn" onClick={onClose} aria-label="Închide">
              ×
            </button>
          )}
        </div>

        {/* Conținut modal */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer cu acțiuni */}
        {actions && (
          <div className="modal-footer">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning', 'achievement']),
  showCloseButton: PropTypes.bool,
  actions: PropTypes.node,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default Modal;