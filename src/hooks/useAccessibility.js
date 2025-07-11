// src/hooks/useAccessibility.js
import { useState, useEffect, useCallback } from 'react';
import accessibilityManager from '../utils/AccessibilityManager';

/**
 * Hook React pentru integrarea cu sistemul de accesibilitate
 * Permite componentelor să interacționeze cu funcționalitățile pentru nevăzători
 */
export const useAccessibility = () => {
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Monitorizăm schimbările de stare ale accessibility manager-ului
    const handleAccessibilityChange = (event) => {
      setIsAccessibilityMode(event.detail.isActive);
    };

    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);

    // Adăugăm listenerii
    document.addEventListener('accessibilityModeChanged', handleAccessibilityChange);
    
    // Monitorizăm schimbările de vorbire
    const checkSpeechStatus = () => {
      setIsSpeaking(accessibilityManager.isSpeaking);
    };
    
    const intervalId = setInterval(checkSpeechStatus, 200);

    // Setăm starea inițială
    setIsAccessibilityMode(accessibilityManager.isActive);
    setIsSpeaking(accessibilityManager.isSpeaking);

    // Cleanup
    return () => {
      document.removeEventListener('accessibilityModeChanged', handleAccessibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  // Funcții pentru interacțiunea cu accessibility manager
  const announce = useCallback((message, priority = 'normal') => {
    accessibilityManager.announce(message, priority);
  }, []);

  const stopReading = useCallback(() => {
    accessibilityManager.stopReading();
  }, []);

  const readPageContent = useCallback(() => {
    accessibilityManager.readCurrentPage();
  }, []);

  const readQuizQuestion = useCallback((question, options) => {
    accessibilityManager.readQuizQuestion(question, options);
  }, []);

  const announceQuizResult = useCallback((score, totalQuestions) => {
    accessibilityManager.announceQuizResult(score, totalQuestions);
  }, []);

  const readCodeLine = useCallback((lineNumber) => {
    accessibilityManager.readCodeLine(lineNumber);
  }, []);

  const announceCodeChange = useCallback((newCode, position) => {
    accessibilityManager.announceCodeChange(newCode, position);
  }, []);

  const announceNavigation = useCallback((pageName) => {
    announce(`Navigând la ${pageName}`, 'high');
  }, [announce]);

  const announceError = useCallback((errorMessage) => {
    announce(`Eroare: ${errorMessage}`, 'high');
  }, [announce]);

  const announceSuccess = useCallback((successMessage) => {
    announce(`Succes: ${successMessage}`, 'high');
  }, [announce]);

  const announceLoading = useCallback((loadingMessage = 'Se încarcă...') => {
    announce(loadingMessage, 'normal');
  }, [announce]);

  const announceFormError = useCallback((fieldName, errorMessage) => {
    announce(`Eroare la câmpul ${fieldName}: ${errorMessage}`, 'high');
  }, [announce]);

  const announceFormSuccess = useCallback((successMessage) => {
    announce(`Formular trimis cu succes: ${successMessage}`, 'high');
  }, [announce]);

  // Hook pentru componente specifice
  const useQuizAccessibility = () => {
    const announceQuestion = useCallback((questionNumber, totalQuestions, question, options) => {
      const text = `Întrebarea ${questionNumber} din ${totalQuestions}: ${question}. ` +
                  `Variantele de răspuns sunt: ` +
                  options.map((option, index) => `${index + 1}: ${option}`).join('. ') +
                  `. Folosește tastele 1 până la ${options.length} pentru a selecta răspunsul.`;
      announce(text, 'high');
    }, []);

    const announceAnswerSelected = useCallback((answerIndex, answerText) => {
      announce(`Ai selectat răspunsul ${answerIndex + 1}: ${answerText}`, 'normal');
    }, []);

    const announceQuizProgress = useCallback((currentQuestion, totalQuestions) => {
      announce(`Progres: întrebarea ${currentQuestion} din ${totalQuestions}`, 'normal');
    }, []);

    return {
      announceQuestion,
      announceAnswerSelected,
      announceQuizProgress,
      announceQuizResult
    };
  };

  const useCodeEditorAccessibility = () => {
    const announceCodeExecution = useCallback(() => {
      announce('Se execută codul...', 'high');
    }, []);

    const announceExecutionResult = useCallback((output, hasError = false) => {
      const prefix = hasError ? 'Eroare la execuție:' : 'Rezultatul execuției:';
      announce(`${prefix} ${output}`, 'high');
    }, []);

    const announceFeedbackRequest = useCallback(() => {
      announce('Se solicită feedback de la AI...', 'normal');
    }, []);

    const announceFeedbackReceived = useCallback((feedback) => {
      announce(`Feedback primit: ${feedback}`, 'high');
    }, []);

    const announceCodeSaved = useCallback(() => {
      announce('Codul a fost salvat', 'normal');
    }, []);

    const announceLineNavigation = useCallback((lineNumber, lineContent) => {
      announce(`Linia ${lineNumber}: ${lineContent}`, 'normal');
    }, []);

    return {
      announceCodeExecution,
      announceExecutionResult,
      announceFeedbackRequest,
      announceFeedbackReceived,
      announceCodeSaved,
      announceLineNavigation,
      announceCodeChange
    };
  };

  const useCourseAccessibility = () => {
    const announceLessonStart = useCallback((lessonTitle, lessonNumber, totalLessons) => {
      announce(`Începe lecția ${lessonNumber} din ${totalLessons}: ${lessonTitle}`, 'high');
    }, []);

    const announceLessonContent = useCallback((content) => {
      announce(`Conținutul lecției: ${content}`, 'normal');
    }, []);

    const announceCodeExample = useCallback((code, explanation) => {
      announce(`Exemplu de cod: ${code}. Explicație: ${explanation}`, 'normal');
    }, []);

    const announceLessonComplete = useCallback((lessonTitle) => {
      announce(`Lecția ${lessonTitle} a fost completată cu succes!`, 'high');
    }, []);

    const announceCourseProgress = useCallback((completedLessons, totalLessons) => {
      const percentage = Math.round((completedLessons / totalLessons) * 100);
      announce(`Progres curs: ${completedLessons} din ${totalLessons} lecții completate (${percentage}%)`, 'normal');
    }, []);

    return {
      announceLessonStart,
      announceLessonContent,
      announceCodeExample,
      announceLessonComplete,
      announceCourseProgress
    };
  };

  const useNavigationAccessibility = () => {
    const announcePageLoad = useCallback((pageName, pageDescription = '') => {
      announce(`Pagina ${pageName} încărcată. ${pageDescription}`, 'high');
    }, []);

    const announceMenuOpen = useCallback((menuName) => {
      announce(`Meniul ${menuName} este deschis. Folosește săgețile pentru navigare.`, 'normal');
    }, []);

    const announceMenuClose = useCallback((menuName) => {
      announce(`Meniul ${menuName} s-a închis`, 'normal');
    }, []);

    const announceModalOpen = useCallback((modalTitle, modalDescription = '') => {
      announce(`Modal deschis: ${modalTitle}. ${modalDescription}`, 'high');
    }, []);

    const announceModalClose = useCallback(() => {
      announce('Modal închis', 'normal');
    }, []);

    return {
      announcePageLoad,
      announceMenuOpen,
      announceMenuClose,
      announceModalOpen,
      announceModalClose
    };
  };

      return {
    // Stare
    isAccessibilityMode,
    isSpeaking,
    
    // Funcții generale
    announce,
    stopReading,
    readPageContent,
    
    // Funcții pentru anunțuri specifice
    announceNavigation,
    announceError,
    announceSuccess,
    announceLoading,
    announceFormError,
    announceFormSuccess,
    
    // Hooks specializate pentru componente
    useQuizAccessibility,
    useCodeEditorAccessibility,
    useCourseAccessibility,
    useNavigationAccessibility
  };
};

export default useAccessibility;