import React, { useState, useEffect } from 'react';

function CourseDetails() {
  const [lessonsList, setLessonsList] = useState([]); // Lista de lecții
  const [course, setCourse] = useState(null); // Detaliile cursului

  useEffect(() => {
    // Simulăm încărcarea cursului și lecțiilor din backend
    const fetchedCourse = {
      name: "Introducere în Java",
      content: [
        { title: "Lecția 1: Instalarea Java și Setarea Mediului de Dezvoltare", content: "Instrucțiuni..." },
        { title: "Lecția 2: Tipuri de Date în Java", content: "Instrucțiuni..." },
        { title: "Lecția 3: Variabile și Operatori", content: "Instrucțiuni..." },
        { title: "Lecția 4: Controlul Fluxului", content: "Instrucțiuni..." },
        { title: "Lecția 5: Buclă `for` și `while`", content: "Instrucțiuni..." },
      ]
    };

    // Setează cursul și lecțiile
    setCourse(fetchedCourse);
    setLessonsList(fetchedCourse.content);
  }, []);

  function addLessonToList(lesson) {
    // Verifică dacă lecția este deja adăugată
    const existingLesson = lessonsList.find(l => l.title === lesson.title);
    if (!existingLesson) {
      setLessonsList([...lessonsList, lesson]); // Adaugă lecția la lista existentă
      console.log(`Lesson "${lesson.title}" added.`);
    } else {
      console.log(`Lesson "${lesson.title}" already exists, not adding.`);
    }
  }

  return (
    <div>
      <h1>{course?.name}</h1>
      <div>
        <h2>Lectii</h2>
        <ul>
          {lessonsList.map((lesson, index) => (
            <li key={index}>{lesson.title}</li>
          ))}
        </ul>
        {/* Exemple de lecție pe care le poți adăuga */}
        <button onClick={() => addLessonToList({ title: "Lecția 6: OOP în Java", content: "Instrucțiuni OOP" })}>
          Adaugă Lecția 6
        </button>
      </div>
    </div>
  );
}

export default CourseDetails;
