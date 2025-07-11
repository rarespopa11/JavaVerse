// src/components/CodePlayground.js - Versiune hibridă: interfață normală + accesibilitate îmbunătățită
import React, { useState, useEffect, useRef } from 'react';
import CodeEditor from './CodeEditor';
import Card from './Card';
import Button from './Button';
import '../styles/CodePlayground.css';

function CodePlayground() {
  // State pentru interfața normală
  const [selectedExample, setSelectedExample] = useState(null);
  const [code, setCode] = useState('');
  const [showAllExamples, setShowAllExamples] = useState(false);
  
  // State pentru accesibilitate
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [output, setOutput] = useState('Apasă "Alt+E" pentru a executa codul...');
  const [feedback, setFeedback] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [hasAnnouncedWelcome, setHasAnnouncedWelcome] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Exemple de cod predefinite (cu editor gol pentru accesibilitate)
  const predefinedExamples = [
    {
      id: 'editor-gol',
      name: 'Editor Gol',
      description: 'Începe să scrii propriul tău cod Java de la zero',
      code: `public class Main {
    public static void main(String[] args) {
        // Scrie codul tău aici
        
    }
}`,
      explanation: 'Un editor gol pregătit pentru experimentele tale. Poți scrie orice cod Java aici.',
      isEmpty: true
    },
    {
      id: 'hello-world',
      name: 'Hello World',
      description: 'Primul tău program Java - afișează un salut simplu',
      code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, JavaVerse!");
    }
}`,
      explanation: 'Acesta este cel mai simplu program Java. Metoda main este punctul de intrare în orice aplicație Java.'
    },
    {
      id: 'variables',
      name: 'Variabile și Tipuri de Date',
      description: 'Învață să declari și să folosești variabile în Java',
      code: `public class Variables {
    public static void main(String[] args) {
        // Declararea variabilelor de tip primitiv
        int number = 42;
        double pi = 3.14159;
        char letter = 'A';
        boolean isJavaFun = true;
        
        // Afișarea valorilor
        System.out.println("Numărul: " + number);
        System.out.println("PI: " + pi);
        System.out.println("Litera: " + letter);
        System.out.println("Java este distractiv? " + isJavaFun);
        
        // Declararea unui String (tip referință)
        String message = "Învățarea Java este fascinantă!";
        System.out.println(message);
    }
}`,
      explanation: 'Java are mai multe tipuri de date: int pentru numere întregi, String pentru text, double pentru numere cu virgulă și boolean pentru adevărat/fals.'
    },
    {
      id: 'loops',
      name: 'Bucle',
      description: 'Repetă operații cu for și while',
      code: `public class Loops {
    public static void main(String[] args) {
        // Bucla for - numără de la 1 la 5
        System.out.println("Exemplu de buclă for:");
        for (int i = 1; i <= 5; i++) {
            System.out.println("Numărul: " + i);
        }
        
        // Bucla while - numără de la 5 la 1
        System.out.println("\\nExemplu de buclă while:");
        int count = 5;
        while (count > 0) {
            System.out.println("Numărătoare inversă: " + count);
            count--;
        }
        
        // Bucla do-while - se execută cel puțin o dată
        System.out.println("\\nExemplu de buclă do-while:");
        int x = 1;
        do {
            System.out.println("Valoarea lui x: " + x);
            x++;
        } while (x <= 3);
    }
}`,
      explanation: 'Buclele permit repetarea codului. For este ideal când știi de câte ori să repeți, while când condiția poate varia.'
    },
    {
      id: 'conditionals',
      name: 'Instrucțiuni Condiționale',
      description: 'Folosește if-else pentru a lua decizii în cod',
      code: `public class Conditionals {
    public static void main(String[] args) {
        int time = 15;
        
        // Instrucțiune if-else
        System.out.println("Exemplu if-else:");
        if (time < 12) {
            System.out.println("Bună dimineața!");
        } else if (time < 18) {
            System.out.println("Bună ziua!");
        } else {
            System.out.println("Bună seara!");
        }
        
        // Instrucțiune switch
        System.out.println("\\nExemplu switch:");
        int day = 4;
        switch (day) {
            case 1:
                System.out.println("Luni");
                break;
            case 2:
                System.out.println("Marți");
                break;
            case 3:
                System.out.println("Miercuri");
                break;
            case 4:
                System.out.println("Joi");
                break;
            case 5:
                System.out.println("Vineri");
                break;
            case 6:
            case 7:
                System.out.println("Weekend");
                break;
            default:
                System.out.println("Zi invalidă");
        }
        
        // Operatorul ternar
        System.out.println("\\nExemplu operator ternar:");
        String status = (time < 18) ? "Zi" : "Seară";
        System.out.println("Este " + status + " acum.");
    }
}`,
      explanation: 'Structurile condiționale permit programului să ia decizii. Poți folosi if, else if și else pentru diferite condiții.'
    },
    {
      id: 'arrays',
      name: 'Tablouri',
      description: 'Lucrează cu colecții de elemente',
      code: `public class Arrays {
    public static void main(String[] args) {
        // Declarare și inițializare de tablou
        int[] numbers = {10, 20, 30, 40, 50};
        
        // Parcurgere cu index
        System.out.println("Parcurgere cu index:");
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("numbers[" + i + "] = " + numbers[i]);
        }
        
        // Parcurgere for-each
        System.out.println("\\nParcurgere for-each:");
        for (int number : numbers) {
            System.out.println("Valoare: " + number);
        }
        
        // Tablou bidimensional
        System.out.println("\\nTablou bidimensional:");
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
                System.out.print(matrix[i][j] + " ");
            }
            System.out.println();
        }
    }
}`,
      explanation: 'Array-urile țin mai multe valori de același tip. Poți accesa elementele cu index-uri care încep de la 0.'
    },
    {
      id: 'methods',
      name: 'Metode',
      description: 'Organizarea codului în funcții reutilizabile',
      code: `public class Methods {
    public static void main(String[] args) {
        // Apel de metodă fără parametri
        sayHello();
        
        // Apel de metodă cu parametri
        int sum = add(5, 3);
        System.out.println("Suma: " + sum);
        
        // Apel de metodă cu valoare de retur
        String message = createMessage("Java");
        System.out.println(message);
        
        // Metodă cu parametri variabili
        int total = addNumbers(1, 2, 3, 4, 5);
        System.out.println("Total: " + total);
    }
    
    // Metodă simplă fără valoare de retur
    public static void sayHello() {
        System.out.println("Salut din metodă!");
    }
    
    // Metodă cu parametri și valoare de retur
    public static int add(int a, int b) {
        return a + b;
    }
    
    // Metodă cu valoare de retur String
    public static String createMessage(String language) {
        return "Învăț programare " + language + "!";
    }
    
    // Metodă cu număr variabil de parametri
    public static int addNumbers(int... numbers) {
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        return sum;
    }
}`,
      explanation: 'Metodele împart codul în bucăți mici și reutilizabile. Pot primi parametri și pot returna valori sau să nu returneze nimic (void).'
    },
    {
      id: 'oop',
      name: 'Programare Orientată pe Obiecte',
      description: 'Lucrează cu clase și obiecte',
      code: `// Definirea clasei
class Car {
    // Atribute (variabile de instanță)
    private String make;
    private String model;
    private int year;
    
    // Constructor
    public Car(String make, String model, int year) {
        this.make = make;
        this.model = model;
        this.year = year;
    }
    
    // Metode getter
    public String getMake() {
        return make;
    }
    
    public String getModel() {
        return model;
    }
    
    public int getYear() {
        return year;
    }
    
    // Metode setter
    public void setYear(int year) {
        if (year > 0) {
            this.year = year;
        }
    }
    
    // Alte metode
    public void displayInfo() {
        System.out.println("Mașină: " + year + " " + make + " " + model);
    }
    
    // Metoda toString supraîncărcată
    @Override
    public String toString() {
        return year + " " + make + " " + model;
    }
}

// Clasa principală cu metoda main
public class OOPExample {
    public static void main(String[] args) {
        // Crearea obiectelor
        Car car1 = new Car("Toyota", "Corolla", 2020);
        Car car2 = new Car("Honda", "Civic", 2019);
        
        // Accesarea metodelor
        car1.displayInfo();
        car2.displayInfo();
        
        // Utilizarea getter-ilor
        System.out.println("Car 1 make: " + car1.getMake());
        
        // Utilizarea setter-ilor
        car2.setYear(2022);
        System.out.println("Car 2 updated year: " + car2.getYear());
        
        // Utilizarea toString
        System.out.println("Car 1: " + car1);
    }
}`,
      explanation: 'Programarea orientată pe obiecte folosește clase și obiecte pentru organizarea codului într-un mod mai structurat.'
    }
  ];

  // Inițializare
  useEffect(() => {
    if (predefinedExamples.length > 0) {
      setSelectedExample(predefinedExamples[0]);
      setCode(predefinedExamples[0].code);
    }
  }, []);

  // FUNCȚII PENTRU ACCESIBILITATE

  // Anunțarea unui exemplu cu oprirea citării precedente
  const announceExample = (example, index) => {
    if (example && window.accessibilityManager) {
      window.accessibilityManager.stopReading();
      
      setTimeout(() => {
        let announcement;
        if (example.isEmpty) {
          announcement = `${example.name}. ${example.description}. ${example.explanation} Apasă Enter pentru a începe să scrii cod.`;
        } else {
          announcement = `Exemplul ${index + 1} din ${predefinedExamples.length}: ${example.name}. ${example.description}. ${example.explanation} Apasă Enter pentru a activa editorul.`;
        }
        window.accessibilityManager.speak(announcement, 'high');
      }, 100);
    }
  };

  // Activarea/dezactivarea editorului (pentru accesibilitate)
  const toggleEditor = () => {
    const newEditorState = !isEditorActive;
    setIsEditorActive(newEditorState);
    
    if (newEditorState) {
      // Activăm editorul
      const currentExample = predefinedExamples[selectedExampleIndex];
      setCode(currentExample.code);
      setOutput('Apasă "Alt+E" pentru a executa codul...');
      setFeedback('');
      
      if (window.accessibilityManager?.isActive && window.accessibilityManager?.speak) {
        const message = currentExample.isEmpty 
          ? `Editor activat. Poți începe să scrii cod de la zero. Se va citi fiecare caracter tastat. Alt+W pentru citirea liniei curente, Alt+E pentru execuție, Alt+F pentru feedback, Escape pentru ieșire.`
          : `Editor activat cu exemplul "${currentExample.name}". Se va citi fiecare caracter tastat. Alt+W pentru citirea liniei curente, Alt+E pentru execuție, Alt+F pentru feedback, Escape pentru ieșire.`;
        
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
    const codeToExecute = isEditorActive ? code : (selectedExample?.code || code);
    
    if (!codeToExecute.trim()) {
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
      // FIXAT: Adăugăm token de autentificare pentru modul accesibilitate
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          code: codeToExecute,
          language: 'java'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
      const errorMessage = `Eroare la comunicarea cu serverul: ${error.message}`;
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
    const codeToAnalyze = isEditorActive ? code : (selectedExample?.code || code);
    
    if (!codeToAnalyze.trim()) {
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
      // FIXAT: Adăugăm token de autentificare pentru modul accesibilitate
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          code: codeToAnalyze,
          language: 'java'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
      const errorMessage = `Eroare la comunicarea cu serverul pentru feedback: ${error.message}`;
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

  // FIXAT: Handler pentru schimbarea codului în editor cu citire corectă a caracterelor
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    const oldCode = code;
    
    setCode(newCode);
    
    // FIXAT: Detectăm ultimul caracter adăugat corect
    if (newCode.length > oldCode.length && window.accessibilityManager?.isActive) {
      // Găsim poziția unde s-a făcut modificarea
      let diffIndex = -1;
      for (let i = 0; i < Math.min(newCode.length, oldCode.length); i++) {
        if (newCode[i] !== oldCode[i]) {
          diffIndex = i;
          break;
        }
      }
      
      // Dacă nu am găsit diferența în mijloc, caracterul a fost adăugat la sfârșit
      if (diffIndex === -1) {
        diffIndex = oldCode.length;
      }
      
      const newChar = newCode.charAt(diffIndex);
      setIsTyping(true);
      
      // FIXAT: Citim caracterul nou corect
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

  // FIXAT: Descrierea caracterelor pentru citire - cu toate caracterele speciale
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
      '<': 'mai mic decât',
      '>': 'mai mare decât',
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
      '&': 'și comercial',
      '_': 'underscore',
      '|': 'bară verticală',
      '~': 'tildă',
      '`': 'accent grav'
    };
    
    return charDescriptions[char] || char;
  };

  // Handler pentru cursor și navigare cu săgeți în editor
  const handleEditorKeyDown = (e) => {
    // În editor activ pentru accesibilitate
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

  // FUNCȚII PENTRU INTERFAȚA NORMALĂ
  const handleExampleChange = (example) => {
    setSelectedExample(example);
    setCode(example.code);
  };

  const handleResetCode = () => {
    if (selectedExample) {
      setCode(selectedExample.code);
    }
  };

  // Listener global pentru comenzi cu tastatura (doar pentru accesibilitate)
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
        const newIndex = selectedExampleIndex > 0 ? selectedExampleIndex - 1 : predefinedExamples.length - 1;
        setSelectedExampleIndex(newIndex);
        announceExample(predefinedExamples[newIndex], newIndex);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = selectedExampleIndex < predefinedExamples.length - 1 ? selectedExampleIndex + 1 : 0;
        setSelectedExampleIndex(newIndex);
        announceExample(predefinedExamples[newIndex], newIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        toggleEditor();
      }
    };

    document.addEventListener('keydown', handleKeyPress, true);
    return () => document.removeEventListener('keydown', handleKeyPress, true);
  }, [selectedExampleIndex, isEditorActive, predefinedExamples, currentLine]);

  // Anunț la încărcarea paginii pentru accesibilitate - doar o dată
  useEffect(() => {
    if (window.accessibilityManager?.isActive && window.accessibilityManager?.speak && !hasAnnouncedWelcome) {
      setTimeout(() => {
        window.accessibilityManager.speak(
          `Playground de cod Java încărcat. Sunt disponibile ${predefinedExamples.length} exemple. Primul este un editor gol pentru propriul tău cod. Folosește săgețile sus și jos pentru navigare prin exemple. Enter pentru a activa editorul. Alt+X pentru a merge direct la editor.`,
          'high'
        );
        
        setTimeout(() => {
          const firstExample = predefinedExamples[0];
          announceExample(firstExample, 0);
        }, 3000);
        
        setHasAnnouncedWelcome(true);
      }, 1000);
    }
  }, [predefinedExamples, hasAnnouncedWelcome]);

  // Cleanup pentru timeout-ul de tastare
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const isAccessibilityMode = window.accessibilityManager?.isActive || false;
  const visibleExamples = showAllExamples ? predefinedExamples : predefinedExamples.slice(0, 3);

  // RENDER PENTRU MODUL ACCESIBILITATE
  if (isAccessibilityMode) {
    return (
      <div className="code-playground-container">
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

        <h1>Java Code Playground</h1>
        <p className="playground-description">
          Experimentează cu cod Java folosind exemplele de mai jos sau scrie propriul tău cod în editorul gol.
        </p>

        {/* Secțiunea cu toate exemplele afișate în pagină pentru accesibilitate */}
        <div className="examples-section">
          <h2 style={{ tabIndex: -1 }}>Exemple de cod</h2>
          
          <div className="accessibility-navigation-info" style={{ 
            textAlign: 'center', 
            padding: '20px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '8px', 
            margin: '20px 0',
            border: '2px solid #2196F3'
          }}>
            <p>
              <strong>Exemplul curent: {selectedExampleIndex + 1} din {predefinedExamples.length}</strong><br />
              <strong>{predefinedExamples[selectedExampleIndex]?.name}</strong><br />
              {isEditorActive ? `Editor ACTIV - Linia ${currentLine} - Escape pentru dezactivare` : 'Folosește săgețile sus și jos pentru navigare și Enter pentru activare editor'}<br />
              <em>Alt+X pentru a merge direct la editor</em>
            </p>
          </div>
          
          <div className="examples-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', margin: '20px 0' }}>
            {predefinedExamples.map((example, index) => (
              <div 
                key={example.id}
                className={`example-card ${index === selectedExampleIndex ? 'accessibility-focus' : ''}`}
                onClick={() => {
                  if (!isEditorActive) {
                    setSelectedExampleIndex(index);
                    announceExample(example, index);
                  }
                }}
                role="button"
                aria-label={`${example.isEmpty ? 'Editor gol' : `Exemplul ${index + 1}`}: ${example.name}. ${example.description}`}
                tabIndex={index === selectedExampleIndex ? 0 : -1}
                style={{
                  border: example.isEmpty ? '2px solid #4CAF50' : '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  cursor: 'pointer',
                  backgroundColor: 
                    example.isEmpty ? '#e8f5e8' :
                    (index === selectedExampleIndex ? '#e3f2fd' : '#f9f9f9'),
                  transition: 'all 0.3s ease',
                  outline: index === selectedExampleIndex ? '3px solid #ffff00' : 'none',
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
                    EDITOR GOL
                  </div>
                )}
                
                <h3 className="example-title" style={{ 
                  margin: '0 0 10px 0', 
                  color: example.isEmpty ? '#2E7D32' : '#333',
                  fontWeight: example.isEmpty ? 'bold' : 'normal',
                  tabIndex: -1
                }}>
                  {example.name}
                </h3>
                <p className="example-description" style={{ 
                  margin: '0 0 10px 0', 
                  color: '#666', 
                  fontSize: '14px',
                  tabIndex: -1
                }}>
                  {example.description}
                </p>
                <p className="example-explanation" style={{
                  margin: '0 0 15px 0',
                  color: '#555',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  tabIndex: -1
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
                    tabIndex: -1
                  }}>
                    <code>{example.code.substring(0, 150)}...</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editorul afișat doar când este activ pentru accesibilitate */}
        {isEditorActive && (
          <div className="editor-section">
            <h2 style={{ tabIndex: -1 }}>
              Editor de cod - {predefinedExamples[selectedExampleIndex].name}
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
                  fontSize: '16px',
                  lineHeight: '1.6',
                  border: '2px solid #ccc',
                  padding: '15px',
                  width: '100%',
                  resize: 'vertical',
                  backgroundColor: '#1e1e1e',
                  color: '#ffffff',
                  borderRadius: '4px',
                  outline: '2px solid #ffff00'
                }}
                aria-label={`Editor de cod Java. Linia curentă: ${currentLine}. Fiecare caracter tastat se va citi. Alt+W pentru citirea liniei curente. Alt+E pentru execuție, Alt+F pentru feedback, Escape pentru ieșire.`}
              />
            </div>
            
            <div className="editor-actions" style={{ margin: '20px 0' }}>
              <button 
                onClick={executeCode}
                disabled={isExecuting}
                className="execute-btn"
                aria-label="Execută codul Java (Alt+E)"
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
                aria-label="Obține feedback AI pentru cod (Alt+F)"
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
                aria-label="Citește linia curentă (Alt+W)"
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
                aria-label="Dezactivează editorul și revino la exemple (Escape)"
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
            
            {/* Secțiunea cu rezultatul execuției */}
            <div className="output-section">
              <h3 style={{ tabIndex: -1 }}>Rezultatul execuției:</h3>
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
                  tabIndex: -1
                }}
                aria-label="Rezultatul execuției codului"
                role="log"
                aria-live="polite"
              >
                {output}
              </div>
            </div>

            {/* Secțiunea cu feedback-ul AI */}
            {feedback && (
              <div className="feedback-section">
                <h3 style={{ tabIndex: -1 }}>Feedback AI:</h3>
                <div 
                  className="feedback-content"
                  style={{
                    backgroundColor: '#f0f8ff',
                    border: '1px solid #87ceeb',
                    padding: '15px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    tabIndex: -1
                  }}
                  aria-label="Feedback de la inteligența artificială"
                  role="region"
                  aria-live="polite"
                >
                  {feedback}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instrucțiuni pentru utilizare în modul accesibilitate */}
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
      </div>
    );
  }

  // RENDER PENTRU MODUL NORMAL (PENTRU VĂZĂTORI)
  return (
    <div className="code-playground-container">
      <h1 className="code-playground-title">Playground Java</h1>
      <p className="code-playground-description">
        Experimentează cu Java în editorul nostru interactiv. Alege unul dintre exemplele predefinite 
        sau scrie propriul tău cod pentru a învăța prin practică.
      </p>

      <div className="playground-layout">
        <div className="examples-sidebar">
          <h3>Exemple</h3>
          <div className="examples-list">
            {visibleExamples.map((example) => (
              <Card 
                key={example.id}
                className={`example-card ${selectedExample?.id === example.id ? 'selected' : ''}`}
                variant="dark"
                title={example.name}
                onClick={() => handleExampleChange(example)}
                hoverable={true}
              />
            ))}
            
            {!showAllExamples && predefinedExamples.length > 3 && (
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => setShowAllExamples(true)}
                className="show-more-btn"
              >
                Arată toate exemplele
              </Button>
            )}
            
            {showAllExamples && (
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => setShowAllExamples(false)}
                className="show-less-btn"
              >
                Arată mai puține
              </Button>
            )}
          </div>
          
          <div className="playground-tips">
            <h4>Sfaturi</h4>
            <ul>
              <li>Folosește exemplele pentru a învăța sintaxa Java</li>
              <li>Experimentează prin modificarea codului</li>
              <li>Rulează codul pentru a vedea rezultatele imediat</li>
              <li>Cere feedback AI pentru a îmbunătăți codul</li>
            </ul>
          </div>
        </div>
        
        <div className="code-editor-area">
          <div className="editor-header-bar">
            <h3>Editor: {selectedExample?.name || 'Selectează un exemplu'}</h3>
            <Button 
              variant="secondary" 
              size="small"
              onClick={handleResetCode}
              icon="🔄"
              iconPosition="left"
              disabled={!selectedExample}
            >
              Reset la exemplu
            </Button>
          </div>
          
          <CodeEditor 
            initialCode={code} 
            onChange={setCode} 
          />
        </div>
      </div>
    </div>
  );
}

export default CodePlayground;