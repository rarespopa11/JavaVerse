// src/components/AccessibleQuiz.js - Fixed version without "niciun element selectat"
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';
import '../styles/Quiz.css';

function AccessibleQuiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [totalLessons, setTotalLessons] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { isAccessibilityMode, useQuizAccessibility, announceLoading, announceError } = useAccessibility();
  const { announceQuestion, announceQuizProgress, announceQuizResult } = useQuizAccessibility();

  const userId = sessionStorage.getItem('userId');
  const authToken = sessionStorage.getItem('authToken');

  // Funcție pentru citirea textului cu punctuație (pentru întrebări de programare)
  const readTextWithPunctuation = useCallback((text) => {
    if (!text) return text;
    
    return text.split('').map(char => {
      const punctuationMap = {
        '=': ' egal ',
        ';': ' punct și virgulă ',
        '(': ' paranteză deschisă ',
        ')': ' paranteză închisă ',
        '{': ' acoladă deschisă ',
        '}': ' acoladă închisă ',
        '[': ' paranteză pătrată deschisă ',
        ']': ' paranteză pătrată închisă ',
        '.': ' punct ',
        ',': ' virgulă ',
        ':': ' două puncte ',
        '+': ' plus ',
        '-': ' minus ',
        '*': ' asterisc ',
        '/': ' slash ',
        '<': ' mai mic ',
        '>': ' mai mare ',
        '&': ' ampersand ',
        '|': ' bară verticală '
      };
      return punctuationMap[char] || char;
    }).join('');
  }, []);

  // FIXAT: handleAnswerChange cu anunț îmbunătățit care include textul răspunsului
  const handleAnswerChange = useCallback((index, answerIndex) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[index] = answerIndex;
    setSelectedAnswers(updatedAnswers);

    if (isAccessibilityMode && window.accessibilityManager) {
      // IMPORTANT: Opresc orice citire în curs
      window.accessibilityManager.stopReading();
      
      setTimeout(() => {
        // FIXAT: Anunț îmbunătățit - include textul răspunsului
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion && currentQuestion.options[answerIndex]) {
          const optionText = readTextWithPunctuation(currentQuestion.options[answerIndex]);
          window.accessibilityManager.speak(`Ai selectat răspunsul ${answerIndex + 1}: ${optionText}`, 'high');
        } else {
          window.accessibilityManager.speak(`Ai selectat răspunsul ${answerIndex + 1}.`, 'high');
        }
      }, 100);
    }
  }, [selectedAnswers, currentQuestionIndex, isAccessibilityMode, questions, readTextWithPunctuation]);

  const saveProgress = useCallback(async (testScore) => {
    if (!userId || !courseId) {
      console.error('Lipsesc informații esențiale: userId sau courseId');
      return;
    }

    setSaving(true);
    
    if (isAccessibilityMode) {
      announceLoading('Se salvează rezultatul testului...');
    }
    
    try {
      const progressResponse = await fetch(`http://localhost:5000/api/user/progress/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const progressData = await progressResponse.json();
      
      const currentProgress = progressData.find(p => p.courseId._id === courseId);
      const completedLessons = currentProgress ? currentProgress.completedLessons : totalLessons;

      const response = await fetch('http://localhost:5000/api/user/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId,
          courseId,
          completedLessons,
          totalLessons,
          testScore,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Eroare la salvarea progresului');
      }
      
      console.log('Progresul la test salvat cu succes');
    } catch (error) {
      console.error('Eroare la salvarea progresului testului:', error);
      setError('Nu am putut salva progresul. Te rugăm să încerci din nou.');
      if (isAccessibilityMode) {
        announceError('Nu am putut salva progresul. Te rugăm să încerci din nou.');
      }
    } finally {
      setSaving(false);
    }
  }, [userId, courseId, totalLessons, authToken, isAccessibilityMode, announceLoading, announceError]);

  // FIXAT: handleNext cu verificare îmbunătățită și anunțuri corecte
  const handleNext = useCallback(() => {
    if (isAnswerChecked) {
      // Mergem la următoarea întrebare
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setIsAnswerChecked(false);
        
        if (isAccessibilityMode) {
          announceQuizProgress(nextIndex + 1, questions.length);
          setTimeout(() => {
            const questionWithPunctuation = readTextWithPunctuation(questions[nextIndex].question);
            const optionsWithPunctuation = questions[nextIndex].options.map(readTextWithPunctuation);
            
            announceQuestion(
              nextIndex + 1,
              questions.length,
              questionWithPunctuation,
              optionsWithPunctuation
            );
          }, 1000);
        }
      } else {
        // Finalizăm testul
        const finalScore = Math.round((score / questions.length) * 100);
        saveProgress(finalScore);
        setIsFinished(true);
        
        if (isAccessibilityMode) {
          setTimeout(() => {
            // FIXAT: Anunțăm rezultatul cu punctajul obținut
            const resultMessage = `Test finalizat! Ai răspuns corect la ${score} din ${questions.length} întrebări. Punctajul obținut: ${finalScore} la sută.`;
            announceQuizResult(score, questions.length);
            
            setTimeout(() => {
              window.accessibilityManager.speak(resultMessage, 'high');
            }, 2000);
          }, 1000);
        }
      }
    } else {
      // FIXAT: Verificare corectă pentru răspuns selectat
      if (selectedAnswers[currentQuestionIndex] === undefined || selectedAnswers[currentQuestionIndex] === null) {
        const message = 'Te rugăm să selectezi un răspuns mai întâi!';
        if (isAccessibilityMode && window.accessibilityManager) {
          window.accessibilityManager.speak(message, 'high');
        }
        return;
      }

      const currentQuestion = questions[currentQuestionIndex];
      const selectedAnswer = selectedAnswers[currentQuestionIndex];
      const correctAnswerIndex = currentQuestion.correctAnswerIndex;
      const isCorrect = selectedAnswer === correctAnswerIndex;

      if (isCorrect) {
        setScore(prevScore => prevScore + 1);
      }

      setIsAnswerChecked(true);
      
      if (isAccessibilityMode && window.accessibilityManager) {
        let message = '';
        if (isCorrect) {
          message = 'Răspuns corect! ';
        } else {
          // FIXAT: Anunț îmbunătățit cu textul răspunsului corect
          const correctOption = readTextWithPunctuation(currentQuestion.options[correctAnswerIndex]);
          message = `Răspuns incorect. Răspunsul corect era răspunsul ${correctAnswerIndex + 1}: ${correctOption}. `;
        }
        message += 'Apasă Enter pentru a continua la următoarea întrebare.';
        
        setTimeout(() => {
          window.accessibilityManager.speak(message, 'high');
        }, 500);
      }
    }
  }, [isAnswerChecked, currentQuestionIndex, questions, selectedAnswers, score, saveProgress, isAccessibilityMode, announceQuestion, announceQuizProgress, announceQuizResult, readTextWithPunctuation]);

  // FIXAT: Listener pentru comenzile rapide de accesibilitate
  useEffect(() => {
    if (!isAccessibilityMode) return;

    const handleKeyPress = (e) => {
      if (!isAccessibilityMode) return;

      // FIXAT: Pentru sfârșitul quiz-ului - navigare prin comenzi rapide
      if (isFinished) {
        // Prevenim navigarea normală cu Tab
        if (e.key === 'Tab') {
          e.preventDefault();
          return;
        }
        return;
      }

      // Selectare răspuns cu tastele 1-4
      if (['1', '2', '3', '4'].includes(e.key)) {
        const answerIndex = parseInt(e.key) - 1;
        if (answerIndex < questions[currentQuestionIndex]?.options.length) {
          handleAnswerChange(currentQuestionIndex, answerIndex);
          e.preventDefault();
        }
      }
      
      // FIXAT: Enter pentru validare răspuns - eliminăm apelul direct la handleNext
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        
        // FIXAT: Verificăm dacă avem un răspuns selectat ÎNAINTE de orice altceva
        if ((selectedAnswers[currentQuestionIndex] === undefined || selectedAnswers[currentQuestionIndex] === null) && !isAnswerChecked) {
          const message = 'Te rugăm să selectezi un răspuns mai întâi! Folosește tastele 1, 2, 3 sau 4.';
          if (window.accessibilityManager) {
            window.accessibilityManager.speak(message, 'high');
          }
          return;
        }
        
        // FIXAT: În loc să apelăm handleNext direct, simulăm click pe buton
        const nextButton = document.querySelector('.quiz-container button:not([disabled])');
        if (nextButton && !saving) {
          // Folosim setTimeout pentru a evita probleme cu accessibility manager
          setTimeout(() => {
            nextButton.click();
          }, 100);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress, true);
    return () => document.removeEventListener('keydown', handleKeyPress, true);
  }, [isAccessibilityMode, currentQuestionIndex, questions, isFinished, selectedAnswers, isAnswerChecked, handleAnswerChange, saving]);

  useEffect(() => {
    const courseIdFromUrl = window.location.pathname.split('/')[2];
    setCourseId(courseIdFromUrl);

    if (!userId || !authToken) {
      console.error('Utilizatorul nu este autentificat');
      setError('Trebuie să fii autentificat pentru a susține testul.');
      if (isAccessibilityMode) {
        announceError('Trebuie să fii autentificat pentru a susține testul.');
      }
      return;
    }

    if (isAccessibilityMode) {
      announceLoading('Se încarcă întrebările testului...');
    }

    fetch(`http://localhost:5000/api/courses/${courseIdFromUrl}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.course && data.course.questions) {
          setQuestions(data.course.questions);
          setTotalLessons(data.course.totalLessons);
          
          if (isAccessibilityMode) {
            setTimeout(() => {
              const questionWithPunctuation = readTextWithPunctuation(data.course.questions[0].question);
              const optionsWithPunctuation = data.course.questions[0].options.map(readTextWithPunctuation);
              
              announceQuestion(
                1, 
                data.course.questions.length, 
                questionWithPunctuation, 
                optionsWithPunctuation
              );
            }, 1500);
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
        setError('Nu am putut încărca întrebările pentru test.');
        if (isAccessibilityMode) {
          announceError('Nu am putut încărca întrebările pentru test.');
        }
      });
  }, [userId, authToken, isAccessibilityMode, readTextWithPunctuation, announceError, announceLoading, announceQuestion]);

  const handleRestart = useCallback(() => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsFinished(false);
    setIsAnswerChecked(false);
    setError(null);
    
    if (isAccessibilityMode) {
      setTimeout(() => {
        const questionWithPunctuation = readTextWithPunctuation(questions[0].question);
        const optionsWithPunctuation = questions[0].options.map(readTextWithPunctuation);
        
        announceQuestion(1, questions.length, questionWithPunctuation, optionsWithPunctuation);
      }, 1000);
    }
  }, [isAccessibilityMode, questions, announceQuestion, readTextWithPunctuation]);

  const handleBackToProfile = useCallback(() => {
    if (isAccessibilityMode) {
      announceLoading('Navighez la profil...');
      sessionStorage.setItem('accessibilityModeActive', 'true');
    }
    navigate('/profile');
  }, [navigate, isAccessibilityMode, announceLoading]);

  const handleBackToCourses = useCallback(() => {
    if (isAccessibilityMode) {
      announceLoading('Navighez la cursuri...');
      sessionStorage.setItem('accessibilityModeActive', 'true');
    }
    navigate('/courses');
  }, [navigate, isAccessibilityMode, announceLoading]);

  // FIXAT: Anunț pentru sfârșitul testului cu comenzi rapide
  useEffect(() => {
    if (isFinished && isAccessibilityMode && window.accessibilityManager) {
      setTimeout(() => {
        const message = `Pentru a relua testul, apasă R. Pentru a vizualiza profilul, apasă Alt + R. Pentru a reveni la cursuri, apasă Alt + C.`;
        window.accessibilityManager.speak(message, 'high');
      }, 4000); // Mai mult timp pentru a se termina anunțul rezultatului
    }
  }, [isFinished, isAccessibilityMode]);

  // FIXAT: Listener pentru comenzi rapide la sfârșitul testului
  useEffect(() => {
    if (!isAccessibilityMode || !isFinished) return;

    const handleEndGameKeys = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRestart();
      } else if (e.altKey && e.key === 'r') {
        e.preventDefault();
        handleBackToProfile();
      } else if (e.altKey && e.key === 'c') {
        e.preventDefault();
        handleBackToCourses();
      }
    };

    document.addEventListener('keydown', handleEndGameKeys, true);
    return () => document.removeEventListener('keydown', handleEndGameKeys, true);
  }, [isAccessibilityMode, isFinished, handleRestart, handleBackToProfile, handleBackToCourses]);

  if (error && !questions.length) {
    return (
      <div className="quiz-error">
        <h2>Eroare la încărcarea testului</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Înapoi</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="quiz-loading">Se încarcă întrebările...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      {isAccessibilityMode && (
        <div className="accessibility-instructions" style={{ 
          position: 'absolute', 
          left: '-9999px',
          width: '1px',
          height: '1px' 
        }}>
          <p>
            Folosește tastele 1-4 pentru a selecta răspunsurile. Enter pentru a valida răspunsul sau a trece la următoarea întrebare.
          </p>
        </div>
      )}
      
      {/* FIXAT: Titlul să nu afișeze întrebarea greșită la sfârșit */}
      <h2>
        {isFinished ? 'Test finalizat' : `Întrebarea ${currentQuestionIndex + 1}`}
      </h2>

      {!isFinished ? (
        <div className="question-container">
          <h3 style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
            {currentQuestion.question}
          </h3>
          <ul>
            {currentQuestion.options.map((option, index) => {
              let className = '';
              if (selectedAnswers[currentQuestionIndex] === index) {
                className = 'selected';
              }
              if (isAnswerChecked) {
                if (index === questions[currentQuestionIndex].correctAnswerIndex) {
                  className = 'correct';
                } else if (selectedAnswers[currentQuestionIndex] === index) {
                  className = 'incorrect';
                }
              }
              return (
                <li
                  key={index}
                  className={className}
                  onClick={() => handleAnswerChange(currentQuestionIndex, index)}
                  role={isAccessibilityMode ? "button" : undefined}
                  aria-label={isAccessibilityMode ? `Opțiunea ${index + 1}: ${option}` : undefined}
                  tabIndex={isAccessibilityMode ? 0 : undefined}
                >
                  <input
                    type="radio"
                    id={`question-${currentQuestionIndex}-option-${index}`}
                    name={`question-${currentQuestionIndex}`}
                    value={index}
                    checked={selectedAnswers[currentQuestionIndex] === index}
                    onChange={() => {}}
                    style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}
                  />
                  <label 
                    htmlFor={`question-${currentQuestionIndex}-option-${index}`}
                    style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}
                  >
                    {isAccessibilityMode && `${index + 1}. `}{option}
                  </label>
                </li>
              );
            })}
          </ul>
          <button 
            onClick={handleNext}
            disabled={saving}
            aria-label={isAccessibilityMode ? 
              (isAnswerChecked ? 'Treci la următoarea întrebare' : 'Verifică răspunsul selectat') : 
              undefined
            }
          >
            {isAnswerChecked ? 'Next' : 'Verifică Răspunsul'}
          </button>
          {error && (
            <div className="quiz-error-message">
              <p>{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="result-container">
          <h3>Testul s-a încheiat</h3>
          <p>Punctajul tău: {score} din {questions.length}</p>
          <p className="score-percentage">Ai obținut {Math.round((score / questions.length) * 100)}%</p>
          
          {saving && <p>Se salvează rezultatul...</p>}
          
          <div className="result-actions">
            <button 
              onClick={handleRestart}
              aria-label={isAccessibilityMode ? 'Reîncep testul de la început' : undefined}
            >
              Reia testul
            </button>
            <button 
              onClick={handleBackToProfile}
              aria-label={isAccessibilityMode ? 'Merg la pagina de profil' : undefined}
            >
              Vizualizează profilul
            </button>
            <button 
              onClick={handleBackToCourses}
              aria-label={isAccessibilityMode ? 'Merg la pagina de cursuri' : undefined}
            >
              Înapoi la cursuri
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccessibleQuiz;