// src/components/AccessibilityIndicator.js
import React, { useEffect, useState } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import accessibilityManager from '../utils/AccessibilityManager';

const AccessibilityIndicator = () => {
  const { isAccessibilityMode, isSpeaking } = useAccessibility();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isAccessibilityMode && !sessionStorage.getItem('accessibilityHelpShown')) {
      setShowHelp(true);
      sessionStorage.setItem('accessibilityHelpShown', 'true');
      
      setTimeout(() => {
        setShowHelp(false);
      }, 10000);
    }
  }, [isAccessibilityMode]);

  if (!isAccessibilityMode) return null;

  return (
    <>
      <div className="accessibility-indicator" role="status" aria-live="polite">
        <span className={`status-dot ${isSpeaking ? 'speaking' : ''}`}></span>
        <span>Mod accesibilitate {isSpeaking ? '(vorbește)' : '(activ)'}</span>
        <span className="speed-indicator">
          Viteză: {Math.round(accessibilityManager.readingSpeed * 100)}%
        </span>
      </div>
      
      {showHelp && (
        <div className="accessibility-help-popup" role="alert">
          <h3>Comenzi rapide activate</h3>
          <ul>
            <li>Tab - Element următor</li>
            <li>F1 - Ajutor complet</li>
            <li>Alt+C, P, R, H - Navigare rapidă</li>
            <li>Escape - Oprește citirea</li>
          </ul>
          <p>Apasă F1 pentru lista completă de comenzi</p>
        </div>
      )}
      
      <style jsx>{`
        .accessibility-indicator {
          position: fixed;
          top: 10px;
          left: 10px;
          background: #000000;
          color: #ffffff;
          padding: 10px 15px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 2px solid #ffff00;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #ffff00;
        }

        .status-dot.speaking {
          background-color: #00ff00;
          animation: pulse-dot 1s infinite;
        }

        .speed-indicator {
          font-size: 12px;
          color: #ffff00;
          margin-left: 10px;
          padding-left: 10px;
          border-left: 1px solid #666;
        }

        @keyframes pulse-dot {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.5; 
            transform: scale(1.2); 
          }
        }

        .accessibility-help-popup {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #000000;
          color: #ffffff;
          border: 2px solid #ffff00;
          padding: 20px;
          max-width: 300px;
          font-size: 14px;
          z-index: 10000;
          border-radius: 8px;
        }

        .accessibility-help-popup h3 {
          margin: 0 0 10px 0;
          color: #ffff00;
          font-size: 16px;
        }

        .accessibility-help-popup ul {
          margin: 0;
          padding: 0 0 0 20px;
        }

        .accessibility-help-popup li {
          margin: 5px 0;
        }

        .accessibility-help-popup p {
          margin: 10px 0 0 0;
          font-style: italic;
          color: #ffff00;
        }
      `}</style>
    </>
  );
};

export default AccessibilityIndicator;