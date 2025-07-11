const mongoose = require('mongoose');

// Schema pentru lecție
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },    // Titlul lecției
  content: { type: String, required: true },  // Conținutul lecției
  examples: [{                             // Exemple de cod pentru lecție
    code: { type: String, required: true },
    explanation: { type: String, required: true }
  }],
  keyConcepts: [{ type: String }]           // Concepte cheie ale lecției
});

// Schema pentru întrebările testului
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true }, // Întrebarea
  options: { type: [String], required: true }, // Opțiunile de răspuns
  correctAnswerIndex: { type: Number, required: true } // Indexul răspunsului corect
});

// Schema pentru curs
const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    content: { 
      type: [{
        title: { type: String, required: true },
        content: { type: String, required: true },
        examples: [{
          code: { type: String, required: true },
          explanation: { type: String, required: true }
        }]
      }], 
      required: true 
    },
    totalLessons: { type: Number, required: true },
    questions: { // Adăugăm întrebările pentru test
      type: [questionSchema],
      required: true
    }
});  

// Crearea modelului pentru cursuri
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
