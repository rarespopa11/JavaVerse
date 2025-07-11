import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AddCoursePage.css';

function AddCoursePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const newCourse = {
      name,
      description,
      content: content.split('\n'),  // Împarte conținutul în linii separate
    };

    // Trimite cererea POST către server pentru a salva cursul
    fetch('http://localhost:5000/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCourse),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Navighează la pagina cu toate cursurile după ce cursul a fost adăugat
          navigate('/courses');
        } else {
          alert('Eroare la adăugarea cursului');
        }
      })
      .catch((error) => {
        console.error('Error adding course:', error);
        alert('Eroare la adăugarea cursului');
      });
  };

  return (
    <div className="add-course-page">
      <h1 className="add-course-title">Add a New Course</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Course Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Course Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Course Content (separate with new lines):</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Add Course</button>
      </form>
    </div>
  );
}

export default AddCoursePage;
