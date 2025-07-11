// src/components/AccessibleCodePlayground.js - Enhanced version with complete navigation system
import React, { useState, useEffect, useRef } from 'react';

function AccessibleCodePlayground() {
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('Apasă "Alt+E" pentru a executa codul...');
  const [feedback, setFeedback] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [hasAnnouncedWelcome, setHasAnnouncedWelcome] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Editor gol + exemple de cod predefinite
  const codeExamples = [
    {
      title: "Editor Gol",
      description: "Începe să scrii propriul tău cod Java de la zero",
      code: `public class Main {
    public static void main(String[] args) {
        // Scrie codul tău aici
        
    }
}`,
      explanation: "Un editor gol pregătit pentru experimentele tale. Poți scrie orice cod Java aici.",
      isEmpty: true
    },
    {
      title: "Hello World",
      description: "Primul tău program Java - afișează un salut simplu",
      code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Bine ai venit în JavaVerse!");
    }
}`,
      explanation: "Acesta este cel mai simplu program Java. Metoda main este punctul de intrare în orice aplicație Java."
    },
    {
      title: "Variabile și Tipuri", 
      description: "Învață să declari și să folosești variabile în Java",
      code: `public class Variables {
    public static void main(String[] args) {
        int age = 25;
        String name = "Java Developer";
        double salary = 5000.50;
        boolean isEmployed = true;
        
        System.out.println("Nume: " + name);
        System.out.println("Vârsta: " + age);
        System.out.println("Salar: " + salary);
        System.out.println("Angajat: " + isEmployed);
    }
}`,
      explanation: "Java are mai multe tipuri de date: int pentru numere întregi, String pentru text, double pentru numere cu virgulă și boolean pentru adevărat/fals."
    },
    {
      title: "Structuri Condiționale",
      description: "Folosește if-else pentru a lua decizii în cod", 
      code: `public class Conditionals {
    public static void main(String[] args) {
        int score = 85;
        
        if (score >= 90) {
            System.out.println("Nota: A - Excelent!");
        } else if (score >= 80) {
            System.out.println("Nota: B - Foarte bine!");
        } else if (score >= 70) {
            System.out.println("Nota: C - Bine!");
        } else {
            System.out.println("Nota: F - Trebuie să mai studiezi!");
        }
        
        // Operatorul ternar
        String status = (score >= 70) ? "Promovat" : "Nepromovat";
        System.out.println("Status: " + status);
    }
}`,
      explanation: "Structurile condiționale permit programului să ia decizii. Poți folosi if, else if și else pentru diferite condiții."
    },
    {
      title: "Bucle",
      description: "Repetă operații cu for și while",
      code: `public class Loops {
    public static void main(String[] args) {
        // Bucla for
        System.out.println("Numerele de la 1 la 5:");
        for (int i = 1; i <= 5; i++) {
            System.out.println("Numărul: " + i);
        }
        
        // Bucla while
        System.out.println("\\nCountdown:");
        int countdown = 3;
        while (countdown > 0) {
            System.out.println(countdown + "...");
            countdown--;
        }
        System.out.println("Start!");
        
        // Enhanced for loop cu array
        String[] colors = {"roșu", "verde", "albastru"};
        System.out.println("\\nCulorile mele preferate:");
        for (String color : colors) {
            System.out.println("- " + color);
        }
    }
}`,
      explanation: "Buclele permit repetarea codului. For este ideal când știi de câte ori să repeți, while când condiția poate varia."
    },
    {
      title: "Arrays și Colecții",
      description: "Lucrează cu colecții de elemente",
      code: `public class Arrays {
    public static void main(String[] args) {
        // Array simplu
        String[] fruits = {"măr", "banană", "portocală", "strugure"};
        
        System.out.println("Fructele mele preferate:");
        for (int i = 0; i < fruits.length; i++) {
            System.out.println((i + 1) + ". " + fruits[i]);
        }
        
        // Array de numere
        int[] numbers = {10, 20, 30, 40, 50};
        int sum = 0;
        
        System.out.println("\\nCalculez suma numerelor...");
        for (int number : numbers) {
            sum += number;
            System.out.println("Adaug: " + number + ", Suma curentă: " + sum);
        }
        
        System.out.println("Suma finală: " + sum);
        System.out.println("Media: " + (sum / numbers.length));
    }
}`,
      explanation: "Array-urile țin mai multe valori de același tip. Poți accesa elementele cu index-uri care încep de la 0."
    },
    {
      title: "Metode și Funcții",
      description: "Organizarea codului în funcții reutilizabile",
      code: `public class Methods {
    public static void main(String[] args) {
        // Apelăm metodele create
        salutare("Ana");
        salutare("Ion");
        
        int rezultat = adunare(15, 25);
        System.out.println("15 + 25 = " + rezultat);
        
        double media = calculeazaMedia(8.5, 9.0, 7.5);
        System.out.println("Media notelor: " + media);
        
        // Metodă cu validare
        int varsta = 17;
        if (esteAdult(varsta)) {
            System.out.println("Persoana de " + varsta + " ani este adult.");
        } else {
            System.out.println("Persoana de " + varsta + " ani este minor.");
        }
    }
    
    // Metodă fără return
    public static void salutare(String nume) {
        System.out.println("Salut, " + nume + "! Bine ai venit!");
    }
    
    // Metodă cu return
    public static int adunare(int a, int b) {
        return a + b;
    }
    
    // Metodă cu mai mulți parametri
    public static double calculeazaMedia(double n1, double n2, double n3) {
        return (n1 + n2 + n3) / 3.0;
    }
    
    // Metodă cu boolean return
    public static boolean esteAdult(int varsta) {
        return varsta >= 18;
    }
}`,
      explanation: "Metodele împart codul în bucăți mici și reutilizabile. Pot primi parametri și pot returna valori sau să nu returneze nimic (void)."
    }
  ];

  // Anunțarea unui exemplu cu oprirea citării precedente
  const announceExample = (example, index) => {
    if (example && window.accessibilityManager) {
      window.accessibilityManager.stopReading();
      
      setTimeout(() => {
        let announcement;
        if (example.isEmpty) {
          announcement = `${example.title}. ${example.description}. ${example.explanation} Apasă Enter pentru a începe să scrii cod.`;
        } else {
          announcement = `Exemplul ${index} din ${codeExamples.length}: ${example.title}. ${example.description}. ${example.explanation} Apasă Enter pentru a activa editorul.`;
        }
        window.accessibilityManager.speak(announcement, 'high');
      }, 100);
    }
  };

  // Activarea/dezactivarea editorului
  const toggleEditor = () => {
    const newEditorState = !isEditorActive;
    setIsEditorActive(newEditorState);
    
    if (newEditorState) {
      // Activăm editorul
      const currentExample = codeExamples[selectedExampleIndex];
      setCode(currentExample.code);
      setOutput('Apasă "Alt+E" pentru a executa codul...');
      setFeedback('');
      
      if (window.accessibilityManager?.isActive && window.accessibilityManager?.speak) {
        const message = currentExample.isEmpty 
          ? `Editor activat. Poți începe să scrii cod de la zero. Se va citi fiecare caracter tastat. Alt+W pentru citirea liniei curente, Alt+E pentru execuție, Alt+F pentru feedback, Escape pentru ieșire.`
          : `Editor activat cu exemplul "${currentExample.title}". Se va citi fiecare caracter tastat. Alt+W pentru citirea liniei curente, Alt+E pentru execuție, Alt+F pentru feedback, Escape pentru ieșire.`;
        
        window.accessibilityManager.speak(message, 'high');
      }
      
      // Focus pe textarea după un scurt delay
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          updateCurrentLine();
        }
      }, 100);
    } else {
      // Dezactivăm editorul
      if (window.accessibilityManager?.isActive && window.accessibilityManager?.speak) {
        window.accessibilityManager.speak(
          'Editor dezactivat. Ai revenit la lista de exemple. Folosește săgețile sus și jos pentru navigare prin exemple.',
          'high'
        );
      }
    }
  };

  // Activarea editorului direct cu Alt+X
  const activateEditor = () => {
    if (!isEditorActive) {
      toggleEditor();
    } else {
      // Dacă editorul e deja activ, doar focusăm
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Executarea codului cu anunțuri îmbunătățite
  const executeCode = async () => {
    if (!code.trim()) {
      const message = 'Nu există cod pentru a fi executat';
      if (window.accessibilityManager?.speak) {
        window.accessibilityManager.speak(message, 'high');
      }
      return;
    }

    setIsExecuting(true);
    setOutput('Se execută codul...');
    
    if (window.accessibilityManager?.speak) {
      window.accessibilityManager.speak('Se execută codul...', 'high');
    }

    try {
      const response = await fetch('http://localhost:5000/api/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: 'java'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const result = data.output || 'Cod executat cu succes, dar fără output';
        setOutput(result);
        
        if (window.accessibilityManager?.speak) {
          window.accessibilityManager.speak(`Execuție completată cu succes! Rezultatul este: ${result}`, 'high');
        }
      } else {
        const error = data.error || 'Eroare necunoscută la execuție';
        setOutput(`Eroare: ${error}`);
        
        if (window.accessibilityManager?.speak) {
          window.accessibilityManager.speak(`Eroare la execuție: ${error}`, 'high');
        }
      }
    } catch (error) {
      console.error('Error executing code:', error);
      const errorMessage = 'Eroare la comunicarea cu serverul';
      setOutput(errorMessage);
      
      if (window.accessibilityManager?.speak) {
        window.accessibilityManager.speak(errorMessage, 'high');
      }
    } finally {
      setIsExecuting(false);
    }
  };

  // Obținerea feedback-ului AI cu anunțuri îmbunătățite
  const getFeedback = async () => {
    if (!code.trim()) {
      const message = 'Nu există cod pentru a fi analizat';
      if (window.accessibilityManager?.speak) {
        window.accessibilityManager.speak(message, 'high');
      }
      return;
    }

    setIsLoadingFeedback(true);
    setFeedback('Se generează feedback AI...');
    
    if (window.accessibilityManager?.speak) {
      window.accessibilityManager.speak('Se generează feedback AI...', 'high');
    }

    try {
      const response = await fetch('http://localhost:5000/api/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: 'java'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const feedbackText = data.feedback || 'Feedback generat cu succes';
        setFeedback(feedbackText);
        
        if (window.accessibilityManager?.speak) {
          window.accessibilityManager.speak(`Feedback AI primit: ${feedbackText}`, 'high');
        }
      } else {
        const error = data.error || 'Eroare la generarea feedback-ului';
        setFeedback(`Eroare: ${error}`);
        
        if (window.accessibilityManager?.speak) {
          window.accessibilityManager.speak(`Eroare la feedback: ${error}`, 'high');
        }
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      const errorMessage = 'Eroare la comunicarea cu serverul pentru feedback';
      setFeedback(errorMessage);
      
      if (window.accessibilityManager?.speak) {
        window.accessibilityManager.speak(errorMessage, 'high');
      }
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  // Citirea liniei curente în editor
  const readCurrentLine = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const lines = textarea.value.split('\n');
    const lineContent = lines[currentLine - 1] || '';
    const lineText = lineContent.trim() || 'linie goală';
    
    if (window.accessibilityManager?.speak) {
      window.accessibilityManager.speak(`Linia ${currentLine}: ${lineText}`, 'high');
    }
  };

  // Actualizarea liniei curente
  const updateCurrentLine = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const newLineNumber = textBeforeCursor.split('\n').length;
    
    if (newLineNumber !== currentLine) {
      setCurrentLine(newLineNumber);
      
      // Anunțăm schimbarea liniei doar dacă nu e în timpul tastării
      if (!isTyping && window.accessibilityManager?.speak) {
        window.accessibilityManager.speak(`Linia ${newLineNumber}`, 'high');
      }
    }
  };

  // Handler pentru schimbarea codului în editor
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    const oldCode = code;
    
    setCode(newCode);
    
    // Detectăm dacă s-a adăugat un caracter nou
    if (newCode.length > oldCode.length && window.accessibilityManager?.isActive) {
      const newChar = newCode.charAt(newCode.length - 1);
      setIsTyping(true);
      
      // Citim caracterul nou
      const charDescription = getCharDescription(newChar);
      window.accessibilityManager.speak(charDescription, 'high');
      
      // Resetăm flag-ul de tastare după un delay
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 300);
    }
    
    updateCurrentLine();
  };

  // Descrierea caracterelor pentru citire
  const getCharDescription = (char) => {
    const charDescriptions = {
      ' ': 'spațiu',
      '\n': 'linie nouă',
      '\t': 'tab',
      '.': 'punct',
      ',': 'virgulă',
      ';': 'punct și virgulă',
      ':': 'două puncte',
      '!': 'semnul exclamării',
      '?': 'semnul întrebării',
      '"': 'ghilimele',
      "'": 'apostrof',
      '(': 'paranteză deschisă',
      ')': 'paranteză închisă',
      '[': 'paranteză pătrată deschisă',
      ']': 'paranteză pătrată închisă',
      '{': 'acoladă deschisă',
      '}': 'acoladă închisă',
      '<': 'mai mic',
      '>': 'mai mare',
      '=': 'egal',
      '+': 'plus',
      '-': 'minus',
      '*': 'asterisc',
      '/': 'slash',
      '\\': 'backslash',
      '@': 'arobase',
      '#': 'diez',
      '$': 'dolar',
      '%': 'procent',
      '^': 'circumflex',
      '&': 'ampersand',
      '_': 'underscore',
      '|': 'bară verticală',
      '~': 'tildă',
      '`': 'accent grav'
    };
    
    return charDescriptions[char] || char;
  };

  // Handler pentru cursor și navigare cu săgeți în editor
  const handleEditorKeyDown = (e) => {
    // În editor activ
    if (isEditorActive) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Lăsăm navigarea normală, dar actualizăm linia curentă după
        setTimeout(updateCurrentLine, 50);
      } else if (e.altKey && e.key === 'w') {
        e.preventDefault();
        readCurrentLine();
      } else if (e.altKey && e.key === 'e') {
        e.preventDefault();
        executeCode();
      } else if (e.altKey && e.key === 'f') {
        e.preventDefault();
        getFeedback();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        toggleEditor();
      }
    }
  };

  // Listener global pentru comenzi cu tastatura
  useEffect(() => {
    const handleKeyPress = (e) => {
      const isAccessibilityMode = window.accessibilityManager?.isActive || false;
      
      if (!isAccessibilityMode) return;

      // Alt+X pentru activarea editorului
      if (e.altKey && e.key === 'x') {
        e.preventDefault();
        e.stopPropagation();
        activateEditor();
        return;
      }

      // În editor activ, procesăm doar comenzile de editor
      if (isEditorActive) {
        handleEditorKeyDown(e);
        return;
      }

      // Navigare prin exemple cu săgețile SUS/JOS DOAR când editorul nu este activ
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = selectedExampleIndex > 0 ? selectedExampleIndex - 1 : codeExamples.length - 1;
        setSelectedExampleIndex(newIndex);
        announceExample(codeExamples[newIndex], newIndex);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = selectedExampleIndex < codeExamples.length - 1 ? selectedExampleIndex + 1 : 0;
        setSelectedExampleIndex(newIndex);
        announceExample(codeExamples[newIndex], newIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        toggleEditor();
      }
    };

    document.addEventListener('keydown', handleKeyPress, true);
    return () => document.removeEventListener('keydown', handleKeyPress, true);
  }, [selectedExampleIndex, isEditorActive, codeExamples, currentLine]);

  // Inițializarea cu primul exemplu
  useEffect(() => {
    if (codeExamples.length > 0) {
      setCode(codeExamples[0].code);
    }
  }, []);

  // Anunț la încărcarea paginii - doar o dată
  useEffect(() => {
    if (window.accessibilityManager?.isActive && window.accessibilityManager?.speak && !hasAnnouncedWelcome) {
      setTimeout(() => {
        window.accessibilityManager.speak(
          `Playground de cod Java încărcat. Sunt disponibile ${codeExamples.length} exemple. Primul este un editor gol pentru propriul tău cod. Folosește săgețile sus și jos pentru navigare prin exemple. Enter pentru a activa editorul. Alt+X pentru a merge direct la editor.`,
          'high'
        );
        
        setTimeout(() => {
          const firstExample = codeExamples[0];
          announceExample(firstExample, 0);
        }, 3000);
        
        setHasAnnouncedWelcome(true);
      }, 1000);
    }
  }, [codeExamples, hasAnnouncedWelcome]);

  // Cleanup pentru timeout-ul de tastare
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const isAccessibilityMode = window.accessibilityManager?.isActive || false;

  return (
    <div className="code-playground-container">
      {isAccessibilityMode && (
        <div className="accessibility-instructions" style={{ 
          position: 'absolute', 
          left: '-9999px',
          width: '1px',
          height: '1px' 
        }}>
          <p>
            {isEditorActive 
              ? `Playground de cod Java - Editor activ pe linia ${currentLine}. Fiecare caracter tastat se va citi. Alt+W pentru citirea liniei curente. Alt+E pentru execuție, Alt+F pentru feedback, Escape pentru ieșire.`
              : "Playground de cod Java. Navighează prin exemple cu săgețile sus și jos. Enter pentru a activa editorul. Alt+X pentru a merge direct la editor."
            }
          </p>
        </div>
      )}

      <h1>Java Code Playground</h1>
      <p className="playground-description">
        Experimentează cu cod Java folosind exemplele de mai jos sau scrie propriul tău cod în editorul gol.
      </p>

      {/* Secțiunea cu toate exemplele afișate în pagină */}
      <div className="examples-section">
        <h2 style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>Exemple de cod</h2>
        
        {isAccessibilityMode && (
          <div className="accessibility-navigation-info" style={{ 
            textAlign: 'center', 
            padding: '20px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '8px', 
            margin: '20px 0',
            border: '2px solid #2196F3'
          }}>
            <p>
              <strong>Exemplul curent: {selectedExampleIndex + 1} din {codeExamples.length}</strong><br />
              <strong>{codeExamples[selectedExampleIndex]?.title}</strong><br />
              {isEditorActive ? `Editor ACTIV - Linia ${currentLine} - Escape pentru dezactivare` : 'Folosește săgețile sus și jos pentru navigare și Enter pentru activare editor'}<br />
              <em>Alt+X pentru a merge direct la editor</em>
            </p>
          </div>
        )}
        
        <div className="examples-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', margin: '20px 0' }}>
          {codeExamples.map((example, index) => (
            <div 
              key={index}
              className={`example-card ${isAccessibilityMode && index === selectedExampleIndex ? 'accessibility-focus' : ''}`}
              onClick={() => {
                if (!isEditorActive) {
                  setSelectedExampleIndex(index);
                  announceExample(example, index);
                }
              }}
              role={isAccessibilityMode ? "button" : undefined}
              aria-label={isAccessibilityMode ? `${example.isEmpty ? 'Editor gol' : `Exemplul ${index}`}: ${example.title}. ${example.description}` : undefined}
              tabIndex={isAccessibilityMode ? (index === selectedExampleIndex ? 0 : -1) : 0}
              style={{
                border: example.isEmpty ? '2px solid #4CAF50' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer',
                backgroundColor: 
                  example.isEmpty ? '#e8f5e8' :
                  (isAccessibilityMode && index === selectedExampleIndex ? '#e3f2fd' : '#f9f9f9'),
                transition: 'all 0.3s ease',
                outline: isAccessibilityMode && index === selectedExampleIndex ? '3px solid #ffff00' : 'none',
                opacity: isEditorActive && index !== selectedExampleIndex ? 0.5 : 1,
                position: 'relative'
              }}
            >
              {example.isEmpty && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  EDITOR GOLI
                </div>
              )}
              
              <h3 className="example-title" style={{ 
                margin: '0 0 10px 0', 
                color: example.isEmpty ? '#2E7D32' : '#333',
                fontWeight: example.isEmpty ? 'bold' : 'normal',
                ...(isAccessibilityMode ? { tabIndex: -1 } : {})
              }}>
                {example.title}
              </h3>
              <p className="example-description" style={{ 
                margin: '0 0 10px 0', 
                color: '#666', 
                fontSize: '14px',
                ...(isAccessibilityMode ? { tabIndex: -1 } : {})
              }}>
                {example.description}
              </p>
              <p className="example-explanation" style={{
                margin: '0 0 15px 0',
                color: '#555',
                fontSize: '13px',
                fontStyle: 'italic',
                ...(isAccessibilityMode ? { tabIndex: -1 } : {})
              }}>
                <strong>Explicație:</strong> {example.explanation}
              </p>
              
              {!example.isEmpty && (
                <div className="example-code-preview" style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  ...(isAccessibilityMode ? { tabIndex: -1 } : {})
                }}>
                  <code>{example.code.substring(0, 150)}...</code>
                </div>
              )}
              
              {!isAccessibilityMode && (
                <button 
                  className="load-example-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedExampleIndex(index);
                    if (!isEditorActive) {
                      toggleEditor();
                    }
                  }}
                  style={{
                    marginTop: '15px',
                    backgroundColor: example.isEmpty ? '#4CAF50' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {isEditorActive ? 'Selectează Exemplul' : 'Activează Editor'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editorul afișat doar când este activ */}
      {isEditorActive && (
        <div className="editor-section">
          <h2 style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>
            Editor de cod - {codeExamples[selectedExampleIndex].title}
          </h2>
          
          <div className="editor-container">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              onKeyDown={handleEditorKeyDown}
              onSelect={updateCurrentLine}
              className="simple-code-editor"
              placeholder="Scrie codul tău Java aici..."
              rows={20}
              cols={80}
              style={{
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: isAccessibilityMode ? '16px' : '14px',
                lineHeight: '1.6',
                border: '2px solid #ccc',
                padding: '15px',
                width: '100%',
                resize: 'vertical',
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
                borderRadius: '4px',
                outline: isAccessibilityMode ? '2px solid #ffff00' : 'none'
              }}
              aria-label={isAccessibilityMode ? `Editor de cod Java. Linia curentă: ${currentLine}. Fiecare caracter tastat se va citi. Alt+W pentru citirea liniei curente. Alt+E pentru execuție, Alt+F pentru feedback, Escape pentru ieșire.` : undefined}
            />
          </div>
          
          <div className="editor-actions" style={{ margin: '20px 0' }}>
            <button 
              onClick={executeCode}
              disabled={isExecuting}
              className="execute-btn"
              aria-label={isAccessibilityMode ? "Execută codul Java (Alt+E)" : undefined}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                marginRight: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '16px',
                opacity: isExecuting ? 0.6 : 1
              }}
            >
              {isExecuting ? '⏳ Se execută...' : '🚀 Execută Codul (Alt+E)'}
            </button>
            
            <button 
              onClick={getFeedback}
              disabled={isLoadingFeedback}
              className="feedback-btn"
              aria-label={isAccessibilityMode ? "Obține feedback AI pentru cod (Alt+F)" : undefined}
              style={{
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                marginRight: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '16px',
                opacity: isLoadingFeedback ? 0.6 : 1
              }}
            >
              {isLoadingFeedback ? '⏳ Se analizează...' : '🤖 Feedback AI (Alt+F)'}
            </button>
            
            <button 
              onClick={() => readCurrentLine()}
              className="read-line-btn"
              aria-label={isAccessibilityMode ? "Citește linia curentă (Alt+W)" : undefined}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                marginRight: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              📖 Citește Linia (Alt+W)
            </button>
            
            <button 
              onClick={toggleEditor}
              className="toggle-editor-btn"
              aria-label={isAccessibilityMode ? "Dezactivează editorul și revino la exemple (Escape)" : undefined}
              style={{
                backgroundColor: '#f44336',
                color: 'white', 
                border: 'none',
                padding: '12px 24px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              ❌ Închide Editor (Escape)
            </button>
          </div>
          
          {/* Informații despre poziția curentă pentru accessibility */}
          {isAccessibilityMode && (
            <div className="editor-status" style={{
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196F3',
              padding: '10px',
              borderRadius: '4px',
              margin: '10px 0',
              fontSize: '14px'
            }}>
              <strong>Poziția curentă:</strong> Linia {currentLine} | 
              <strong> Comenzi rapide:</strong> Alt+W (citește linia), Alt+E (execută), Alt+F (feedback), Escape (închide)
            </div>
          )}
          
          {/* Secțiunea cu rezultatul execuției */}
          <div className="output-section">
            <h3 style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>Rezultatul execuției:</h3>
            <div 
              className="output-console" 
              style={{
                backgroundColor: '#2d2d2d',
                color: '#ffffff',
                border: '1px solid #555',
                padding: '15px',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                whiteSpace: 'pre-wrap',
                minHeight: '120px',
                borderRadius: '4px',
                fontSize: '14px',
                ...(isAccessibilityMode ? { tabIndex: -1 } : {})
              }}
              aria-label={isAccessibilityMode ? "Rezultatul execuției codului" : undefined}
              role={isAccessibilityMode ? "log" : undefined}
              aria-live={isAccessibilityMode ? "polite" : undefined}
            >
              {output}
            </div>
          </div>

          {/* Secțiunea cu feedback-ul AI */}
          {feedback && (
            <div className="feedback-section">
              <h3 style={{ ...(isAccessibilityMode ? { tabIndex: -1 } : {}) }}>Feedback AI:</h3>
              <div 
                className="feedback-content"
                style={{
                  backgroundColor: '#f0f8ff',
                  border: '1px solid #87ceeb',
                  padding: '15px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  ...(isAccessibilityMode ? { tabIndex: -1 } : {})
                }}
                aria-label={isAccessibilityMode ? "Feedback de la inteligența artificială" : undefined}
                role={isAccessibilityMode ? "region" : undefined}
                aria-live={isAccessibilityMode ? "polite" : undefined}
              >
                {feedback}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instrucțiuni pentru utilizare */}
      {isAccessibilityMode && (
        <div className="accessibility-help" style={{ 
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '14px',
          maxWidth: '320px',
          zIndex: 1000,
          border: '2px solid #ffff00'
        }}>
          <p><strong>🎹 Comenzi rapide:</strong></p>
          {isEditorActive ? (
            <>
              <p>• <strong>Alt+W:</strong> citește linia curentă</p>
              <p>• <strong>Alt+E:</strong> execută codul</p>
              <p>• <strong>Alt+F:</strong> feedback AI</p>
              <p>• <strong>Escape:</strong> închide editorul</p>
              <p>• <strong>Săgeți:</strong> navigare prin cod</p>
              <p><em>💬 Se citește fiecare caracter tastat</em></p>
            </>
          ) : (
            <>
              <p>• <strong>Săgeți sus/jos:</strong> navigare exemple</p>
              <p>• <strong>Enter:</strong> activează editorul</p>
              <p>• <strong>Alt+X:</strong> direct la editor</p>
              <p><em>📝 Primul exemplu este editor gol</em></p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AccessibleCodePlayground;