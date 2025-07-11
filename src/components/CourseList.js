import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  // Fetch cursuri de la API
  useEffect(() => {
    fetch('http://localhost:5000/api/courses')  // Asigură-te că API-ul tău este corect configurat
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching courses:', error));
  }, []);

  // Funcția care redirecționează utilizatorul către detaliile unui curs
  const handleStartCourse = (courseId) => {
    navigate(`/course-details/${courseId}`);
  };

  return (
    <div>
      <h1>Lista de Cursuri</h1>
      {courses.length === 0 ? (
        <p>Nu sunt cursuri disponibile.</p>
      ) : (
        courses.map(course => (
          <div key={course._id} style={{ margin: '20px 0' }}>
            <h2>{course.name}</h2>
            <p>{course.description}</p>
            <button onClick={() => handleStartCourse(course._id)}>Start Course</button>
          </div>
        ))
      )}
    </div>
  );
};

export default CourseList;
