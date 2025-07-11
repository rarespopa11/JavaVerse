// src/components/CourseDetailPage.js - Fixed version without "Pagina lecție încărcată"
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';
import '../styles/CourseDetailPage.css';

function CourseDetailPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(parseInt(lessonId) || 0);
  const [isPreview, setIsPreview] = useState(true);
  const [openLessonIndex, setOpenLessonIndex] = useState(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [error, setError] = useState(null);
  const [hasAnnouncedContent, setHasAnnouncedContent] = useState(false);

  const { 
    isAccessibilityMode, 
    useCourseAccessibility,
    useNavigationAccessibility,
    announceLoading,
    announceError 
  } = useAccessibility();
  
  const {
    announceCourseProgress
  } = useCourseAccessibility();
  
  const { announcePageLoad } = useNavigationAccessibility();

  const userId = sessionStorage.getItem('userId');
  const authToken = sessionStorage.getItem('authToken');

  const saveUserProgress = useCallback(async (completedLessons) => {
    if (!userId || !authToken) {
      console.log('Utilizatorul nu este autentificat. Progresul nu va fi salvat.');
      return;
    }

    setSavingProgress(true);
    
    if (isAccessibilityMode) {
      announceLoading('Se salvează progresul...');
    }

    try {
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
          totalLessons: course.totalLessons,
          testScore: null
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`Progresul utilizatorului a fost salvat. Lecții completate: ${completedLessons}`);
        if (isAccessibilityMode) {
          announceCourseProgress(completedLessons, course.totalLessons);
        }
      } else {
        console.error('Eroare la salvarea progresului:', data.message);
      }
    } catch (error) {
      console.error('Eroare la salvarea progresului:', error);
    } finally {
      setSavingProgress(false);
    }
  }, [userId, authToken, courseId, course, isAccessibilityMode, announceLoading, announceCourseProgress]);

  const handleStartCourse = useCallback(() => {
    setIsPreview(false);
    setCurrentLessonIndex(0);
    setHasAnnouncedContent(false);
    navigate(`/courses/${courseId}/lesson/1`);
    
    if (isAccessibilityMode && course) {
      const firstLesson = course.content[0];
      setTimeout(() => {
        // FIXAT: Anunț direct fără "Pagina lecție încărcată"
        let lessonAnnouncement = `Lecția 1 din ${course.content.length}: ${firstLesson.title}. ${firstLesson.content}`;
        
        if (firstLesson.examples && firstLesson.examples.length > 0) {
          lessonAnnouncement += `. Această lecție conține ${firstLesson.examples.length} exemple de cod:`;
          firstLesson.examples.forEach((example, index) => {
            lessonAnnouncement += ` Exemplul ${index + 1}: `;
            const codeWithPunctuation = example.code.split('').map(char => {
              const punctuationMap = {
                '.': ' punct ',
                ';': ' punct și virgulă ',
                '(': ' paranteză deschisă ',
                ')': ' paranteză închisă ',
                '{': ' acoladă deschisă ',
                '}': ' acoladă închisă ',
                '=': ' egal '
              };
              return punctuationMap[char] || char;
            }).join('');
            lessonAnnouncement += codeWithPunctuation + `. ${example.explanation}.`;
          });
        }
        
        // FIXAT: Folosim speak direct în loc de announcePageLoad
        window.accessibilityManager?.speak(lessonAnnouncement, 'high');
        setHasAnnouncedContent(true);
      }, 500);
    }
  }, [courseId, navigate, isAccessibilityMode, course]);

  const handleNextLesson = useCallback(() => {
    if (currentLessonIndex < course.content.length - 1) {
      const nextLessonIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(nextLessonIndex);
      setHasAnnouncedContent(false);
      
      saveUserProgress(nextLessonIndex + 1);
      
      navigate(`/courses/${courseId}/lesson/${nextLessonIndex + 1}`);
      
      if (isAccessibilityMode) {
        setTimeout(() => {
          // FIXAT: Anunț când lecția s-a finalizat
          window.accessibilityManager?.speak("Lecție finalizată.", 'high');
          
          setTimeout(() => {
            const nextLesson = course.content[nextLessonIndex];
            // FIXAT: Anunț direct fără "Pagina lecție încărcată"
            let lessonAnnouncement = `Lecția ${nextLessonIndex + 1} din ${course.content.length}: ${nextLesson.title}. ${nextLesson.content}`;
            
            if (nextLesson.examples && nextLesson.examples.length > 0) {
              lessonAnnouncement += `. Această lecție conține ${nextLesson.examples.length} exemple de cod:`;
              nextLesson.examples.forEach((example, index) => {
                lessonAnnouncement += ` Exemplul ${index + 1}: `;
                const codeWithPunctuation = example.code.split('').map(char => {
                  const punctuationMap = {
                    '.': ' punct ',
                    ';': ' punct și virgulă ',
                    '(': ' paranteză deschisă ',
                    ')': ' paranteză închisă ',
                    '{': ' acoladă deschisă ',
                    '}': ' acoladă închisă ',
                    '=': ' egal '
                  };
                  return punctuationMap[char] || char;
                }).join('');
                lessonAnnouncement += codeWithPunctuation + `. ${example.explanation}.`;
              });
            }
            
            // FIXAT: Folosim speak direct în loc de announcePageLoad
            window.accessibilityManager?.speak(lessonAnnouncement, 'high');
            setHasAnnouncedContent(true);
          }, 1000);
        }, 300);
      }
    }
  }, [currentLessonIndex, course, courseId, navigate, isAccessibilityMode, saveUserProgress]);

  const handleBack = useCallback(() => {
    if (currentLessonIndex === 0) {
      navigate(`/courses/${courseId}/lesson/0`);
      setIsPreview(true);
      setHasAnnouncedContent(false);
      
      if (isAccessibilityMode) {
        setTimeout(() => {
          // FIXAT: Folosim speak direct în loc de announcePageLoad
          window.accessibilityManager?.speak('Înapoi la prezentarea cursului.', 'high');
          setHasAnnouncedContent(true);
        }, 500);
      }
    } else {
      const previousLessonIndex = currentLessonIndex - 1;
      setCurrentLessonIndex(previousLessonIndex);
      setHasAnnouncedContent(false);
      navigate(`/courses/${courseId}/lesson/${previousLessonIndex + 1}`);
      
      if (isAccessibilityMode) {
        const previousLesson = course.content[previousLessonIndex];
        setTimeout(() => {
          // FIXAT: Anunț direct fără "Pagina lecție încărcată"
          let lessonAnnouncement = `Lecția ${previousLessonIndex + 1} din ${course.content.length}: ${previousLesson.title}. ${previousLesson.content}`;
          
          if (previousLesson.examples && previousLesson.examples.length > 0) {
            lessonAnnouncement += `. Această lecție conține ${previousLesson.examples.length} exemple de cod:`;
            previousLesson.examples.forEach((example, index) => {
              lessonAnnouncement += ` Exemplul ${index + 1}: `;
              const codeWithPunctuation = example.code.split('').map(char => {
                const punctuationMap = {
                  '.': ' punct ',
                  ';': ' punct și virgulă ',
                  '(': ' paranteză deschisă ',
                  ')': ' paranteză închisă ',
                  '{': ' acoladă deschisă ',
                  '}': ' acoladă închisă ',
                  '=': ' egal '
                };
                return punctuationMap[char] || char;
              }).join('');
              lessonAnnouncement += codeWithPunctuation + `. ${example.explanation}.`;
            });
          }
          
          // FIXAT: Folosim speak direct în loc de announcePageLoad
          window.accessibilityManager?.speak(lessonAnnouncement, 'high');
          setHasAnnouncedContent(true);
        }, 500);
      }
    }
  }, [currentLessonIndex, courseId, navigate, isAccessibilityMode, course]);

  const handleStartTest = useCallback(() => {
    saveUserProgress(course.totalLessons);
    
    if (isAccessibilityMode) {
      announceLoading('Navighez la test...');
      sessionStorage.setItem('accessibilityModeActive', 'true');
    }
    
    navigate(`/courses/${courseId}/test`);
  }, [course, courseId, navigate, isAccessibilityMode, announceLoading, saveUserProgress]);

  // FIXAT: Listener pentru comenzile rapide de accesibilitate cu logică corectă pentru ultima lecție
  useEffect(() => {
    if (!isAccessibilityMode) return;

    const handleKeyPress = (e) => {
      if (!isAccessibilityMode) return;

      // FIXAT: Navigare prin lecții cu logică corectă pentru ultima lecție
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        
        // FIXAT: La ultima lecție, săgeata stânga duce la penultima lecție, NU la test
        handleBack();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        if (isPreview) {
          handleStartCourse();
        } else if (currentLessonIndex < course?.content?.length - 1) {
          handleNextLesson();
        } else {
          // FIXAT: DOAR săgeata dreapta la ultima lecție duce la test
          handleStartTest();
        }
      }
      
      // Enter pentru a începe cursul dacă suntem în preview
      if (e.key === 'Enter' && isPreview) {
        e.preventDefault();
        e.stopPropagation();
        handleStartCourse();
      }
      
      // T pentru test dacă am terminat lecțiile
      if (e.key === 't' && !isPreview && currentLessonIndex >= course?.content?.length - 1) {
        e.preventDefault();
        e.stopPropagation();
        handleStartTest();
      }
    };

    document.addEventListener('keydown', handleKeyPress, true);
    return () => document.removeEventListener('keydown', handleKeyPress, true);
  }, [isAccessibilityMode, currentLessonIndex, course, isPreview, handleBack, handleStartCourse, handleNextLesson, handleStartTest]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (isAccessibilityMode) {
          announceLoading('Se încarcă cursul...');
        }

        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course. Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.course) {
          setCourse(data.course);
          setLoading(false);
          
          if (isAccessibilityMode && !hasAnnouncedContent) {
            setTimeout(() => {
              if (isPreview) {
                announcePageLoad(
                  `Cursul ${data.course.name}`, 
                  `${data.course.description}. Cursul conține ${data.course.content.length} lecții. Folosește săgeata dreapta sau Enter pentru a începe cursul.`
                );
              } else {
                const currentLesson = data.course.content[currentLessonIndex];
                // FIXAT: Anunț direct fără "Pagina lecție încărcată"
                let lessonAnnouncement = `Lecția ${currentLessonIndex + 1} din ${data.course.content.length}: ${currentLesson.title}. ${currentLesson.content}`;
                
                if (currentLesson.examples && currentLesson.examples.length > 0) {
                  lessonAnnouncement += `. Această lecție conține ${currentLesson.examples.length} exemple de cod:`;
                  currentLesson.examples.forEach((example, index) => {
                    lessonAnnouncement += ` Exemplul ${index + 1}: `;
                    const codeWithPunctuation = example.code.split('').map(char => {
                      const punctuationMap = {
                        '.': ' punct ',
                        ';': ' punct și virgulă ',
                        '(': ' paranteză deschisă ',
                        ')': ' paranteză închisă ',
                        '{': ' acoladă deschisă ',
                        '}': ' acoladă închisă ',
                        '[': ' paranteză pătrată deschisă ',
                        ']': ' paranteză pătrată închisă ',
                        '=': ' egal ',
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
                    
                    lessonAnnouncement += codeWithPunctuation + `. ${example.explanation}.`;
                  });
                }
                
                // FIXAT: Anunț corect pentru ultima lecție
                if (currentLessonIndex >= data.course.content.length - 1) {
                  lessonAnnouncement += ` Aceasta este ultima lecție. Folosește săgeata dreapta pentru a merge la test.`;
                } else {
                  lessonAnnouncement += ` Folosește săgețile stânga și dreapta pentru navigare.`;
                }
                
                // FIXAT: Folosim speak direct în loc de announcePageLoad
                window.accessibilityManager?.speak(lessonAnnouncement, 'high');
              }
              setHasAnnouncedContent(true);
            }, 1000);
          }
        } else {
          throw new Error('Course data not available');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Nu am putut încărca cursul. Te rugăm să încerci din nou.');
        setLoading(false);
        
        if (isAccessibilityMode) {
          announceError('Nu am putut încărca cursul. Te rugăm să încerci din nou.');
        }
      }
    };

    fetchCourse();
  }, [courseId, isAccessibilityMode, announceLoading, announceError, announcePageLoad, currentLessonIndex, isPreview, hasAnnouncedContent]);

  const toggleLessonPreview = (index) => {
    setOpenLessonIndex(openLessonIndex === index ? null : index);
    
    if (isAccessibilityMode) {
      const lesson = course.content[index];
      if (openLessonIndex === index) {
        announceLoading(`S-a închis previzualizarea pentru ${lesson.title}`);
      } else {
        setTimeout(() => {
          // FIXAT: Folosim speak direct în loc de announcePageLoad
          window.accessibilityManager?.speak(lesson.content, 'high');
        }, 300);
      }
    }
  };

  useEffect(() => {
    if (lessonId === "0" && currentLessonIndex === 0) {
      setIsPreview(true);
      setHasAnnouncedContent(false);
    }
  }, [lessonId, currentLessonIndex]);

  const handleBackToCourses = () => {
    if (isAccessibilityMode) {
      sessionStorage.setItem('accessibilityModeActive', 'true');
    }
    navigate('/courses');
  };

  if (loading) return (
    <div className="loading-container">
      Se încarcă cursul...
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      {error}
    </div>
  );
  
  if (!course) return (
    <div className="error-container">
      Cursul nu a fost găsit.
    </div>
  );

  const currentLesson = course.content[currentLessonIndex];

  return (
    <div className="course-detail-page">
      {isAccessibilityMode && (
        <div className="accessibility-instructions" style={{ 
          position: 'absolute', 
          left: '-9999px',
          width: '1px',
          height: '1px' 
        }}>
          <p>
            {isPreview 
              ? `Cursul ${course.name}. Conține ${course.content.length} lecții. Apasă Enter pentru a începe.`
              : `Lecția ${currentLessonIndex + 1} din ${course.content.length}: ${currentLesson.title}. 
                 Folosește săgețile stânga/dreapta pentru navigare. 
                 ${currentLessonIndex >= course.content.length - 1 ? 'Apasă săgeata dreapta pentru test.' : ''}`
            }
          </p>
        </div>
      )}
      
      <h1 className="course-detail-title">{course.name}</h1>
      <p className="course-detail-description">{course.description}</p>

      {isPreview ? (
        <>
          <h3 className="course-detail-content-title">Conținutul Cursului:</h3>
          <div className="course-preview">
            {course.content.map((lesson, index) => (
              <div key={index} className="course-preview-item">
                <div 
                  onClick={() => toggleLessonPreview(index)} 
                  className="lesson-title"
                  role={isAccessibilityMode ? "button" : undefined}
                  aria-label={isAccessibilityMode ? `Lecția ${index + 1}: ${lesson.title}` : undefined}
                  tabIndex={isAccessibilityMode ? 0 : undefined}
                >
                  {lesson.title}
                </div>

                {openLessonIndex === index && (
                  <div className="lesson-preview">
                    <p>{lesson.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="course-buttons">
            <button 
              className="back-to-courses-btn" 
              onClick={handleBackToCourses}
              aria-label={isAccessibilityMode ? "Înapoi la lista de cursuri" : undefined}
            >
              Înapoi la Cursuri
            </button>
            <button 
              className="start-course-btn" 
              onClick={handleStartCourse}
              aria-label={isAccessibilityMode ? "Începe cursul cu prima lecție" : undefined}
            >
              Începe Cursul
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="lesson-header" style={{ marginBottom: '20px' }}>
            <h3 className="lesson-title-display" style={{ 
              fontSize: '1.5rem', 
              color: '#333', 
              margin: '0 0 10px 0',
              ...(isAccessibilityMode ? { tabIndex: -1 } : {})
            }}>
              {currentLesson.title}
            </h3>
          </div>
          
          <div className="course-detail-content">
            <p>{currentLesson.content}</p>
            
            {currentLesson.examples && currentLesson.examples.length > 0 && (
              <div className="lesson-code-examples">
                <h3 style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>Exemple de cod:</h3>
                {currentLesson.examples.map((example, index) => (
                  <div key={index} className="code-example">
                    <pre className="code-block" style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                      {example.code}
                    </pre>
                    <p className="code-explanation" style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                      {example.explanation}
                    </p>
                  </div>
                ))}
                <p className="code-editor-note" style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
                  💡 Pentru a experimenta cu codul, vizitează <strong>Playground</strong>-ul din meniu!
                </p>
              </div>
            )}
          </div>
          
          <div className="course-buttons">
            <button 
              className="back-btn" 
              onClick={handleBack}
              aria-label={isAccessibilityMode ? 
                (currentLessonIndex === 0 ? 'Înapoi la conținutul cursului' : 'Lecția anterioară') : 
                undefined
              }
            >
              {currentLessonIndex === 0 ? 'Înapoi la Conținutul Cursului' : 'Lecția Anterioară'}
            </button>

            {savingProgress && <span className="saving-progress">Salvare progres...</span>}

            {currentLessonIndex < course.content.length - 1 ? (
              <button 
                className="next-lesson-btn" 
                onClick={handleNextLesson}
                disabled={savingProgress}
                aria-label={isAccessibilityMode ? "Mergi la lecția următoare" : undefined}
              >
                Lecția Următoare
              </button>
            ) : (
              <button 
                className="start-test-btn" 
                onClick={handleStartTest}
                disabled={savingProgress}
                aria-label={isAccessibilityMode ? "Începe testul pentru acest curs" : undefined}
              >
                Începe Testul
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CourseDetailPage;