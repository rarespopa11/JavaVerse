import '../styles/Quiz.css';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function Quiz() {
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

  // SCHIMBARE: Obține userId din sessionStorage în loc de localStorage
  const userId = sessionStorage.getItem('userId');
  const authToken = sessionStorage.getItem('authToken');

  useEffect(() => {
    const courseIdFromUrl = window.location.pathname.split('/')[2];
    setCourseId(courseIdFromUrl);

    // Verificare autentificare
    if (!userId || !authToken) {
      console.error('Utilizatorul nu este autentificat');
      console.log('userId:', userId);
      console.log('authToken:', authToken ? 'exists' : 'missing');
      setError('Trebuie să fii autentificat pentru a susține testul.');
      return;
    }

    fetch(`http://localhost:5000/api/courses/${courseIdFromUrl}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.course && data.course.questions) {
          setQuestions(data.course.questions);
          setTotalLessons(data.course.totalLessons);
        }
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
        setError('Nu am putut încărca întrebările pentru test.');
      });
  }, [userId, authToken]);

  const handleAnswerChange = useCallback((index, answerIndex) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[index] = answerIndex;
    setSelectedAnswers(updatedAnswers);
  }, [selectedAnswers]);

  // Funcție pentru salvarea progresului la test
  const saveProgress = useCallback(async (testScore) => {
    if (!userId || !courseId) {
      console.error('Lipsesc informații esențiale: userId sau courseId');
      console.log('userId:', userId);
      console.log('courseId:', courseId);
      return;
    }

    setSaving(true);
    
    try {
      console.log('Salvare scor test - userId:', userId);
      console.log('Salvare scor test - courseId:', courseId);
      console.log('Salvare scor test - score:', testScore);

      // Obținem progresul existent pentru acest curs
      const progressResponse = await fetch(`http://localhost:5000/api/user/progress/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const progressData = await progressResponse.json();
      
      // Găsim progresul pentru cursul curent
      const currentProgress = progressData.find(p => p.courseId._id === courseId);
      
      // Determinăm câte lecții au fost completate (păstrăm valoarea existentă)
      const completedLessons = currentProgress ? currentProgress.completedLessons : totalLessons;

      // Salvăm progresul actualizat
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
    } finally {
      setSaving(false);
    }
  }, [userId, courseId, totalLessons, authToken]);

  const handleNext = useCallback(() => {
    if (isAnswerChecked) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsAnswerChecked(false);
      } else {
        const finalScore = Math.round((score / questions.length) * 100);
        saveProgress(finalScore);
        setIsFinished(true);
      }
    } else {
      if (selectedAnswers[currentQuestionIndex] === undefined) {
        alert('Te rugăm să selectezi un răspuns!');
        return;
      }

      if (selectedAnswers[currentQuestionIndex] === questions[currentQuestionIndex].correctAnswerIndex) {
        setScore(prevScore => prevScore + 1);
      }

      setIsAnswerChecked(true);
    }
  }, [isAnswerChecked, currentQuestionIndex, questions, selectedAnswers, score, saveProgress]);

  const handleRestart = useCallback(() => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsFinished(false);
    setIsAnswerChecked(false);
    setError(null);
  }, []);

  const handleBackToProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

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
      <h2>Întrebarea {currentQuestionIndex + 1}</h2>

      {!isFinished ? (
        <div className="question-container">
          <h3>{currentQuestion.question}</h3>
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
                >
                  <input
                    type="radio"
                    id={`question-${currentQuestionIndex}-option-${index}`}
                    name={`question-${currentQuestionIndex}`}
                    value={index}
                    checked={selectedAnswers[currentQuestionIndex] === index}
                    onChange={() => {}}
                  />
                  <label htmlFor={`question-${currentQuestionIndex}-option-${index}`}>{option}</label>
                </li>
              );
            })}
          </ul>
          <button 
            onClick={handleNext}
            disabled={saving}
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
            <button onClick={handleRestart}>Reia testul</button>
            <button onClick={handleBackToProfile}>Vizualizează profilul</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;