import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

// Definim componenta de prezentare a editorului de cod integrat
const IntegratedCodeEditor = () => {
  return (
    <div className="editor-showcase">
      <h1>Editor de Cod Integrat pentru JavaVerse</h1>
      
      <section className="editor-features">
        <h2>Caracteristici principale</h2>
        <ul>
          <li><strong>Editor Monaco</strong> - același motor care stă la baza VS Code</li>
          <li><strong>Evidențiere de sintaxă</strong> pentru Java</li>
          <li><strong>Execuție cod</strong> în timp real prin API extern</li>
          <li><strong>Feedback AI</strong> pentru analiza și îmbunătățirea codului</li>
          <li><strong>Exemple predefinite</strong> pentru învățare prin practică</li>
          <li><strong>Playground</strong> pentru experimentare liberă</li>
          <li><strong>Integrare</strong> cu cursuri și lecții</li>
        </ul>
      </section>
      
      <section className="implementation-details">
        <h2>Implementare</h2>
        <p>
          Componenta de editor integrează <code>@monaco-editor/react</code> pentru interfața de editare 
          și folosește JDoodle API prin backend-ul JavaVerse pentru execuție. Feedback-ul este generat 
          folosind API OpenAI, interpretând codul și oferind sugestii personalizate.
        </p>
        <p>
          Statisticile de utilizare sunt înregistrate în MongoDB pentru a permite analiza modului în 
          care utilizatorii interacționează cu editorul și pentru a personaliza experiența de învățare.
        </p>
      </section>
      
      <section className="integration-guide">
        <h2>Integrare în aplicație</h2>
        <p>Pentru integrarea în aplicația JavaVerse, trebuie:</p>
        <ol>
          <li>Instalarea pachetelor necesare: <code>@monaco-editor/react</code></li>
          <li>Adăugarea fișierelor de componente: <code>CodeEditor.js</code> și <code>CodePlayground.js</code></li>
          <li>Adăugarea fișierelor CSS: <code>CodeEditor.css</code> și <code>CodePlayground.css</code></li>
          <li>Crearea modelului de date pentru execuțiile de cod: <code>CodeExecution.js</code></li>
          <li>Adăugarea rutelor pentru backend: <code>codeExecutionRoutes.js</code></li>
          <li>Adăugarea componentei în paginile relevante, de exemplu:</li>
        </ol>
        <pre>
{`// În CourseDetailPage.js
import CodeEditor from './CodeEditor';

// În secțiunea de lecții:
{currentLesson && currentLesson.examples && currentLesson.examples.length > 0 && (
  <div className="lesson-code-example">
    <h3>Încearcă exemplul de cod:</h3>
    <CodeEditor initialCode={currentLesson.examples[0].code} lessonId={currentLesson._id} />
  </div>
)}`}
        </pre>
      </section>
      
      <section className="next-steps">
        <h2>Evoluții viitoare</h2>
        <ul>
          <li>Salvarea codului utilizatorului în profil</li>
          <li>Exerciții practice cu verificarea automată a soluțiilor</li>
          <li>Partajarea codului între utilizatori</li>
          <li>Suport pentru alte limbaje de programare</li>
          <li>Integrarea de funcții avansate precum debugging</li>
        </ul>
      </section>
    </div>
  );
};

// Dacă dorim să implementăm această componentă direct pentru prezentare
if (document.getElementById('code-editor-showcase')) {
  const root = ReactDOM.createRoot(document.getElementById('code-editor-showcase'));
  root.render(
    <React.StrictMode>
      <IntegratedCodeEditor />
    </React.StrictMode>
  );
}

// Exportăm componenta pentru a putea fi utilizată în alte părți ale aplicației
export default IntegratedCodeEditor;