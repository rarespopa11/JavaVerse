import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CoursesPage.css';  // Asigură-te că stilurile sunt corecte

function CoursesPage() {
  const [courses, setCourses] = useState([]); // Starea pentru a salva cursurile
  const [loading, setLoading] = useState(true); // Starea pentru a arăta un loading până se încarcă cursurile
  const [error, setError] = useState(null); // Starea pentru a salva erorile, dacă apar

  useEffect(() => {
    // Fetch pentru a prelua cursurile de la backend
    console.log('Fetching courses...');
    fetch('http://localhost:5000/api/courses')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.courses) {
          console.log('Courses fetched successfully:', data.courses); // Adăugăm un log pentru a vedea ce răspuns ai
          setCourses(data.courses); // Setăm cursurile în starea locală
        } else {
          console.error('No courses data received');
        }
        setLoading(false); // Setăm loading pe false după ce am primit răspunsul
      })
      .catch((err) => {
        setError('Failed to load courses');
        console.error('Error fetching courses:', err); // Adaugă un log pentru eroare
        setLoading(false); // Dacă apare eroare, setăm loading pe false
      });
  }, []); // [] pentru a executa doar o singură dată când componenta se încarcă

  // Dacă datele sunt încă în proces de încărcare
  if (loading) return <div>Loading...</div>;

  // Dacă apare o eroare la fetch
  if (error) return <div>{error}</div>;

  return (
    <div className="courses-page">
      <h1 className="page-title">Cursuri Java disponibile</h1>
      <div className="courses-grid">
        {courses.length === 0 ? (
          <p>No courses available</p>
        ) : (
          courses.map((course) => (
            <div key={course._id} className="course-card">
              <h2 className="course-title">{course.name}</h2>
              <p className="course-description">{course.description}</p>
              {/* Schimbăm ruta pentru a naviga la prima lecție */}
              <Link to={`/courses/${course._id}/lesson/0`} className="course-link">
                Începe cursul
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
