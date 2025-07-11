// src/components/AccessibleCoursesPage.js - Final fixed version
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';
import '../styles/CoursesPage.css';

function AccessibleCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const [hasAnnouncedCourses, setHasAnnouncedCourses] = useState(false);
  const [hasStartedNavigation, setHasStartedNavigation] = useState(false); // FIXAT: Flag pentru a ști când a început navigarea

  const { 
    isAccessibilityMode, 
    useCourseAccessibility, 
    useNavigationAccessibility,
    announceLoading, 
    announceError 
  } = useAccessibility();
  
  const { announceCourseProgress } = useCourseAccessibility();
  const { announcePageLoad } = useNavigationAccessibility();

  // FIXAT: Funcție pentru anunțarea unui curs cu numărul corect
  const announceCourse = (course, index) => {
    if (course && window.accessibilityManager && courses.length > 0) {
      // IMPORTANT: Opresc orice citire în curs
      window.accessibilityManager.stopReading();
      
      setTimeout(() => {
        const announcement = `Cursul ${index + 1} din ${courses.length}: ${course.name}. ${course.description}. Apasă Enter pentru a începe cursul.`;
        window.accessibilityManager.speak(announcement, 'high');
      }, 100);
    }
  };

  // Listener pentru comenzile rapide de accesibilitate - FIXAT
  useEffect(() => {
    if (!isAccessibilityMode) return;

    const handleKeyPress = (e) => {
      if (!isAccessibilityMode || courses.length === 0) return;

      // Navigare prin cursuri cu săgețile
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        
        // FIXAT: Marchează că navigarea a început
        if (!hasStartedNavigation) {
          setHasStartedNavigation(true);
        }
        
        const newIndex = selectedCourseIndex > 0 ? selectedCourseIndex - 1 : courses.length - 1;
        setSelectedCourseIndex(newIndex);
        announceCourse(courses[newIndex], newIndex);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        
        // FIXAT: Marchează că navigarea a început
        if (!hasStartedNavigation) {
          setHasStartedNavigation(true);
        }
        
        const newIndex = selectedCourseIndex < courses.length - 1 ? selectedCourseIndex + 1 : 0;
        setSelectedCourseIndex(newIndex);
        announceCourse(courses[newIndex], newIndex);
      }
      
      // Enter pentru selectarea cursului - DIRECT la curs
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const selectedCourse = courses[selectedCourseIndex];
        if (selectedCourse) {
          announceLoading(`Intri în cursul ${selectedCourse.name}...`);
          // Persistăm modul de accesibilitate
          sessionStorage.setItem('accessibilityModeActive', 'true');
          window.location.href = `/courses/${selectedCourse._id}/lesson/0`;
        }
      }
    };

    // FIXAT: Adăugăm pe capture pentru a fi mai aproape de elementul root
    document.addEventListener('keydown', handleKeyPress, true);
    return () => document.removeEventListener('keydown', handleKeyPress, true);
  }, [isAccessibilityMode, courses, selectedCourseIndex, hasStartedNavigation]);

  useEffect(() => {
    console.log('Fetching courses...');
    
    if (isAccessibilityMode) {
      announcePageLoad('Cursuri Java', 'Se încarcă lista cursurilor disponibile...');
    }
    
    fetch('http://localhost:5000/api/courses')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.courses) {
          console.log('Courses fetched successfully:', data.courses);
          setCourses(data.courses);
          
          // FIXAT: Anunțăm cursurile doar o dată, fără primul curs
          if (isAccessibilityMode && !hasAnnouncedCourses) {
            setTimeout(() => {
              const announcement = `S-au încărcat ${data.courses.length} cursuri Java. Folosește săgețile sus și jos pentru navigare și Enter pentru a începe cursul selectat.`;
              announceLoading(announcement);
              
              // FIXAT: NU mai anunțăm primul curs automat
              setHasAnnouncedCourses(true);
            }, 1000);
          }
        } else {
          console.error('No courses data received');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load courses');
        console.error('Error fetching courses:', err);
        setLoading(false);
        
        if (isAccessibilityMode) {
          announceError('Nu s-au putut încărca cursurile. Te rugăm să încerci din nou.');
        }
      });
  }, [isAccessibilityMode, announcePageLoad, announceLoading, announceError, hasAnnouncedCourses]);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
    </div>
  );

  return (
    <div className="courses-page">
      {isAccessibilityMode && (
        <div className="accessibility-instructions" style={{ 
          position: 'absolute', 
          left: '-9999px',
          width: '1px',
          height: '1px' 
        }}>
          <p>
            Pagina cu cursuri Java. Sunt disponibile {courses.length} cursuri. 
            Folosește săgețile sus și jos pentru navigare, Enter pentru a începe cursul selectat.
          </p>
        </div>
      )}
      
      <h1 className="page-title">Cursuri Java disponibile</h1>
      <div className="courses-grid">
        {courses.length === 0 ? (
          <p>No courses available</p>
        ) : (
          courses.map((course, index) => (
            <div 
              key={course._id} 
              className={`course-card ${isAccessibilityMode && index === selectedCourseIndex ? 'accessibility-focus' : ''}`}
              role={isAccessibilityMode ? "button" : undefined}
              aria-label={isAccessibilityMode ? `Cursul ${index + 1}: ${course.name}. ${course.description}` : undefined}
              tabIndex={isAccessibilityMode ? (index === selectedCourseIndex ? 0 : -1) : 0}
              onClick={() => {
                if (isAccessibilityMode) {
                  sessionStorage.setItem('accessibilityModeActive', 'true');
                }
                window.location.href = `/courses/${course._id}/lesson/0`;
              }}
            >
              <div className="course-content">
                <h2 className="course-title">{course.name}</h2>
                <p className="course-description">{course.description}</p>
              </div>
              
              {!isAccessibilityMode && (
                <Link 
                  to={`/courses/${course._id}/lesson/0`} 
                  className="course-link"
                >
                  Începe cursul
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AccessibleCoursesPage;