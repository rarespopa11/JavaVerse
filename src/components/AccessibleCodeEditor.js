// src/components/AccessibleCodeEditor.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { useToast } from './ToastProvider';
import '../styles/CodeEditor.css';
import Button from './Button';

function AccessibleCodeEditor({ initialCode, lessonId, onChange, editorKey }) {
  const defaultCode = `public class Main {
    public static void main(String[] args) {
        // Scrie codul tău aici
        System.out.println("Bine ai venit la JavaVerse!");
    }
}`;

  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentCode, setCurrentCode] = useState(initialCode || defaultCode);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  const toast = useToast();
  
  const { 
    isAccessibilityMode, 
    useCodeEditorAccessibility,
    announceLoading,
    announceError 
  } = useAccessibility();
  
  const {
    announceCodeExecution,
    announceExecutionResult,
    announceFeedbackRequest,
    announceFeedbackReceived,
    announceCodeSaved,
    announceLineNavigation,
    announceCodeChange
  } = useCodeEditorAccessibility();

  // Funcții wrappate cu useCallback pentru a evita re-renderurile
  const handleRunCode = useCallback(async () => {
    console.log('🏃 Running code...');
    
    if (!isEditorReady || !editorRef.current) {
      console.log('⚠️ Editor not ready');
      toast.warning('Editorul nu este pregătit încă. Te rugăm să aștepți.');
      if (isAccessibilityMode) {
        announceError('Editorul nu este pregătit încă. Te rugăm să aștepți.');
      }
      return;
    }

    const codeToRun = editorRef.current.getValue();
    console.log('🏃 Code to run:', codeToRun.substring(0, 100));
    
    if (!codeToRun || codeToRun.trim() === '') {
      toast.warning('Te rugăm să scrii cod înainte de a-l rula.');
      if (isAccessibilityMode) {
        announceError('Te rugăm să scrii cod înainte de a-l rula.');
      }
      return;
    }
    
    setIsRunning(true);
    setOutput('Se execută codul...');
    
    if (isAccessibilityMode) {
      announceCodeExecution();
    }

    try {
      const token = sessionStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: codeToRun })
      });

      const data = await response.json();
      
      if (data.success) {
        const result = data.output || 'Codul a fost executat cu succes!';
        setOutput(result);
        toast.success('Codul a fost executat cu succes!');
        
        if (isAccessibilityMode) {
          announceExecutionResult(result, false);
        }
      } else {
        const errorMessage = `Eroare: ${data.error}`;
        setOutput(errorMessage);
        toast.error('Eroare la executarea codului.');
        
        if (isAccessibilityMode) {
          announceExecutionResult(data.error, true);
        }
      }
    } catch (error) {
      console.error('Error executing code:', error);
      const errorMessage = `Eroare: ${error.message}`;
      setOutput(errorMessage);
      toast.error('Eroare la comunicarea cu serverul.');
      
      if (isAccessibilityMode) {
        announceExecutionResult(error.message, true);
      }
    } finally {
      setIsRunning(false);
    }
  }, [isEditorReady, toast, isAccessibilityMode, announceError, announceCodeExecution, announceExecutionResult]);

  const handleGetFeedback = useCallback(async () => {
    const codeToAnalyze = editorRef.current ? editorRef.current.getValue() : '';
    console.log('🤖 Getting feedback for:', codeToAnalyze.substring(0, 50));
    
    if (!codeToAnalyze || codeToAnalyze.trim() === '') {
      toast.warning('Te rugăm să scrii cod înainte de a cere feedback.');
      if (isAccessibilityMode) {
        announceError('Te rugăm să scrii cod înainte de a cere feedback.');
      }
      return;
    }
    
    setIsAnalyzing(true);
    setFeedback('Se analizează codul...');
    setShowFeedback(true);
    
    if (isAccessibilityMode) {
      announceFeedbackRequest();
    }

    try {
      const token = sessionStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          code: codeToAnalyze,
          lessonId: lessonId 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setFeedback(data.feedback);
        toast.success('Feedback generat cu succes!');
        
        if (isAccessibilityMode) {
          announceFeedbackReceived(data.feedback);
        }
      } else {
        const errorMessage = 'Nu am putut genera feedback pentru acest cod.';
        setFeedback(errorMessage);
        toast.error('Eroare la generarea feedback-ului.');
        
        if (isAccessibilityMode) {
          announceError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      const errorMessage = 'Eroare la obținerea feedback-ului.';
      setFeedback(errorMessage);
      toast.error('Eroare la comunicarea cu serverul.');
      
      if (isAccessibilityMode) {
        announceError(errorMessage);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast, isAccessibilityMode, announceError, announceFeedbackRequest, announceFeedbackReceived, lessonId]);

  // Funcții separate pentru a evita dependențele în useEffect
  const readCurrentLine = useCallback(() => {
    if (!editorRef.current) return;
    
    const lines = currentCode.split('\n');
    const currentLine = lines[cursorPosition.line - 1] || '';
    const lineContent = currentLine.trim() || 'linie goală';
    
    if (announceLineNavigation) {
      announceLineNavigation(cursorPosition.line, lineContent);
    }
  }, [currentCode, cursorPosition.line, announceLineNavigation]);

  // Listener pentru comenzile rapide de accesibilitate
  useEffect(() => {
    if (!isAccessibilityMode) return;

    const handleKeyPress = (e) => {
      if (!isAccessibilityMode) return;

      // Execută codul cu Ctrl+Shift+E
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        handleRunCode();
        e.preventDefault();
      }
      
      // Cere feedback cu Ctrl+Shift+F
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        handleGetFeedback();
        e.preventDefault();
      }
      
      // Salvează codul cu Ctrl+Shift+S
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        if (announceCodeSaved) announceCodeSaved();
        e.preventDefault();
      }
      
      // Citește linia curentă cu Tab
      if (e.key === 'Tab' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        readCurrentLine();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAccessibilityMode, announceCodeSaved, handleGetFeedback, handleRunCode, readCurrentLine]);

  // Inițializarea Monaco Editor
  useEffect(() => {
    let isMounted = true;
    
    const loadMonacoEditor = async () => {
      try {
        console.log('📦 Loading Monaco Editor...');
        setIsEditorLoading(true);
        
        if (isAccessibilityMode) {
          announceLoading('Se încarcă editorul de cod...');
        }
        
        const monaco = await import('@monaco-editor/react');
        
        if (isMounted) {
          console.log('✅ Monaco Editor loaded successfully');
          monacoRef.current = monaco;
          setIsEditorLoading(false);
          setIsEditorReady(true);
          
          if (isAccessibilityMode) {
            setTimeout(() => {
              announceLoading('Editorul de cod este pregătit. Folosește Tab pentru a citi linia curentă.');
            }, 1000);
          }
        }
      } catch (error) {
        console.error('❌ Error loading Monaco Editor:', error);
        if (isMounted) {
          setIsEditorLoading(false);
          toast.error('Nu s-a putut încărca editorul de cod.');
          if (isAccessibilityMode) {
            announceError('Nu s-a putut încărca editorul de cod.');
          }
        }
      }
    };

    loadMonacoEditor();
    
    return () => {
      isMounted = false;
    };
  }, [toast, isAccessibilityMode, announceLoading, announceError]);

  const handleEditorDidMount = (editor) => {
    console.log('🚀 Editor mounted');
    editorRef.current = editor;
    setIsEditorReady(true);
    setIsEditorLoading(false);
    
    const codeToSet = initialCode || defaultCode;
    editor.setValue(codeToSet);
    setCurrentCode(codeToSet);
    
    // IMPORTANT: Marcăm și protejăm editorul pentru accesibilitate
    const editorElement = editor.getDomNode();
    editorElement.setAttribute('data-monaco-editor', 'true');
    editorElement.setAttribute('role', 'code');
    editorElement.setAttribute('aria-label', 'Editor de cod Java accesibil');
    
    // Prevenim interferența cu accessibility manager DOAR când e activ
    editorElement.addEventListener('keydown', (e) => {
      // Verificăm dacă accessibility mode este activ
      if (document.body.classList.contains('accessibility-mode')) {
        // Pentru tastele normale de editare, marcăm evenimentul
        if (!e.altKey && !e.ctrlKey && !e.metaKey) {
          e.monacoEditorEvent = true;
        }
      }
    }, false);
    
    // Listener pentru schimbări în cod
    editor.onDidChangeModelContent(() => {
      const newCode = editor.getValue();
      setCurrentCode(newCode);
      if (onChange) {
        onChange(newCode);
      }
      
      if (isAccessibilityMode) {
        announceCodeChange('modified');
      }
    });
    
    // Listener pentru schimbări în poziția cursorului
    editor.onDidChangeCursorPosition((e) => {
      const newPosition = {
        line: e.position.lineNumber,
        column: e.position.column
      };
      setCursorPosition(newPosition);
    });
    
    editor.focus();
  };

  const handleResetCode = useCallback(() => {
    if (window.confirm('Sigur dorești să resetezi codul? Toate modificările vor fi pierdute.')) {
      const codeToReset = initialCode || defaultCode;
      console.log('🔄 Resetting code to:', codeToReset.substring(0, 50));
      if (editorRef.current) {
        editorRef.current.setValue(codeToReset);
        setCurrentCode(codeToReset);
      }
      toast.info('Codul a fost resetat.');
      
      if (isAccessibilityMode) {
        announceCodeSaved();
      }
    }
  }, [initialCode, defaultCode, toast, isAccessibilityMode, announceCodeSaved]);

  useEffect(() => {
    if (editorRef.current && isEditorReady && initialCode) {
      console.log('📝 Updating editor with new initialCode');
      editorRef.current.setValue(initialCode);
      setCurrentCode(initialCode);
    }
  }, [initialCode, editorKey, isEditorReady]);

  return (
    <div className="code-editor-container">
      {isAccessibilityMode && (
        <div className="accessibility-instructions" style={{ 
          position: 'absolute', 
          left: '-9999px',
          width: '1px',
          height: '1px' 
        }}>
          <p>
            Editor de cod Java accesibil. Folosește Ctrl+Shift+E pentru execuție, Ctrl+Shift+F pentru feedback, 
            Tab pentru citirea liniei curente. Poziția curentă: linia {cursorPosition.line}, coloana {cursorPosition.column}.
          </p>
        </div>
      )}
      
      <div className="editor-header">
        <h3>Editor de cod Java</h3>
        <div className="editor-actions">
          <Button 
            variant="secondary"
            size="small"
            onClick={handleResetCode}
            icon="🔄"
            iconPosition="left"
            aria-label={isAccessibilityMode ? "Resetează codul la versiunea inițială" : undefined}
          >
            Resetează
          </Button>
          <Button 
            variant="info"
            size="small"
            onClick={handleGetFeedback}
            disabled={isAnalyzing || !isEditorReady}
            icon={isAnalyzing ? "⏳" : "🤖"}
            iconPosition="left"
            loading={isAnalyzing}
            aria-label={isAccessibilityMode ? "Cere feedback de la inteligența artificială" : undefined}
          >
            {isAnalyzing ? 'Se analizează...' : 'Obține feedback AI'}
          </Button>
          <Button 
            variant="primary"
            size="small"
            onClick={handleRunCode}
            disabled={isRunning || !isEditorReady}
            icon={isRunning ? "⏳" : "▶️"}
            iconPosition="left"
            loading={isRunning}
            aria-label={isAccessibilityMode ? "Execută codul Java scris" : undefined}
          >
            {isRunning ? 'Se execută...' : 'Rulează codul'}
          </Button>
        </div>
      </div>

      <div className="editor-wrapper">
        {isEditorLoading ? (
          <div className="editor-loading">
            <div className="loading-spinner"></div>
            <p>Se încarcă editorul...</p>
          </div>
        ) : monacoRef.current ? (
          <monacoRef.current.default
            key={editorKey}
            height="400px"
            language="java"
            theme="vs-dark"
            defaultValue={initialCode || defaultCode}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: isAccessibilityMode ? 16 : 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              folding: true,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
              readOnly: false,
              accessibilitySupport: isAccessibilityMode ? 'on' : 'auto',
              ariaLabel: 'Editor de cod Java accesibil',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                arrowSize: 30
              },
              // Setări suplimentare pentru accesibilitate
              quickSuggestions: {
                other: true,
                comments: false,
                strings: false
              },
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
              wordBasedSuggestions: true,
              selectOnLineNumbers: true,
              glyphMargin: false,
              showFoldingControls: 'mouseover',
              cursorBlinking: 'blink',
              cursorSmoothCaretAnimation: false,
              cursorStyle: 'line',
              cursorWidth: isAccessibilityMode ? 3 : 2,
              // Îmbunătățiri pentru navigare cu tastatura
              find: {
                addExtraSpaceOnTop: false,
                autoFindInSelection: 'never',
                seedSearchStringFromSelection: 'always'
              }
            }}
          />
        ) : (
          <div className="editor-fallback">
            <p>Nu s-a putut încărca editorul Monaco.</p>
            <textarea
              defaultValue={initialCode || defaultCode}
              className="fallback-editor"
              rows="20"
              placeholder="Scrie codul tău Java aici..."
              aria-label={isAccessibilityMode ? "Editor de cod Java alternativ" : undefined}
              onChange={(e) => {
                setCurrentCode(e.target.value);
                if (onChange) onChange(e.target.value);
              }}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: isAccessibilityMode ? '16px' : '14px',
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
                border: '2px solid #666',
                padding: '10px',
                lineHeight: '1.5'
              }}
            />
          </div>
        )}
      </div>

      <div className="output-container">
        <div className="output-header">
          <h4>Rezultat</h4>
        </div>
        <pre 
          className="output-content"
          aria-label={isAccessibilityMode ? "Rezultatul execuției codului" : undefined}
          role={isAccessibilityMode ? "log" : undefined}
          aria-live={isAccessibilityMode ? "polite" : undefined}
        >
          {output || 'Rulează codul pentru a vedea rezultatul'}
        </pre>
      </div>

      {showFeedback && (
        <div className="feedback-container">
          <div className="feedback-header">
            <h4>Feedback AI</h4>
            <button 
              className="close-feedback" 
              onClick={() => setShowFeedback(false)}
              aria-label="Închide feedback"
            >
              &times;
            </button>
          </div>
          <div 
            className="feedback-content"
            aria-label={isAccessibilityMode ? "Feedback de la inteligența artificială" : undefined}
            role={isAccessibilityMode ? "region" : undefined}
            aria-live={isAccessibilityMode ? "polite" : undefined}
          >
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}

export default AccessibleCodeEditor;