import React, { useState, useEffect, useRef } from 'react';
import { useToast } from './ToastProvider';
import '../styles/CodeEditor.css';
import Button from './Button';

function CodeEditor({ initialCode, lessonId, onChange, editorKey }) {
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
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  const toast = useToast();

  // Inițializarea Monaco Editor
  useEffect(() => {
    let isMounted = true;
    
    const loadMonacoEditor = async () => {
      try {
        console.log('📦 Loading Monaco Editor...');
        setIsEditorLoading(true);
        
        const monaco = await import('@monaco-editor/react');
        
        if (isMounted) {
          console.log('✅ Monaco Editor loaded successfully');
          monacoRef.current = monaco;
          setIsEditorLoading(false);
          setIsEditorReady(true);
        }
      } catch (error) {
        console.error('❌ Error loading Monaco Editor:', error);
        if (isMounted) {
          setIsEditorLoading(false);
          toast.error('Nu s-a putut încărca editorul de cod.');
        }
      }
    };

    loadMonacoEditor();
    
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleEditorDidMount = (editor) => {
    console.log('🚀 Editor mounted');
    editorRef.current = editor;
    setIsEditorReady(true);
    setIsEditorLoading(false);
    
    // Setăm valoarea inițială
    const codeToSet = initialCode || defaultCode;
    editor.setValue(codeToSet);
    
    // Marcăm editorul pentru AccessibilityManager
    const editorElement = editor.getDomNode();
    editorElement.setAttribute('data-monaco-editor', 'true');
    editorElement.setAttribute('role', 'code');
    editorElement.setAttribute('aria-label', 'Editor de cod Java');
    
    // PROTECȚIE COMPLETĂ pentru modul accesibilitate
    editorElement.addEventListener('keydown', (e) => {
      // Verificăm dacă suntem în modul de accesibilitate ȘI în edit mode
      const accessibilityManager = window.accessibilityManager;
      if (accessibilityManager && 
          accessibilityManager.isAccessibilityMode && 
          accessibilityManager.isEditMode) {
        console.log('🔍 Monaco in accessibility edit mode, marking all events:', e.key);
        // Marcăm TOATE evenimentele ca venind din Monaco
        e.monacoEditorEvent = true;
      }
    }, false);
    
    // Și pentru input events
    editorElement.addEventListener('input', (e) => {
      const accessibilityManager = window.accessibilityManager;
      if (accessibilityManager && 
          accessibilityManager.isAccessibilityMode && 
          accessibilityManager.isEditMode) {
        console.log('🔍 Monaco input in accessibility edit mode, marking event');
        e.monacoEditorEvent = true;
      }
    }, false);
    
    // DEBUG: Monitorizăm când se schimbă conținutul
    editor.onDidChangeModelContent((e) => {
      console.log('📝 Content changed:', e);
      if (onChange) {
        const currentCode = editor.getValue();
        onChange(currentCode);
      }
    });
    
    // DEBUG: Monitorizăm schimbările de cursor
    editor.onDidChangeCursorPosition((e) => {
      console.log('🎯 Cursor position changed:', {
        line: e.position.lineNumber,
        column: e.position.column,
        reason: e.reason
      });
    });
    
    // DEBUG: Monitorizăm focus/blur
    editor.onDidFocusEditorText(() => {
      console.log('✅ Editor focused');
    });
    
    editor.onDidBlurEditorText(() => {
      console.log('❌ Editor blurred');
    });
    
    // Focus pe editor
    editor.focus();
    
    console.log('✅ Monaco Editor ready and focused');
  };

  const handleRunCode = async () => {
    console.log('🏃 Running code...');
    
    if (!isEditorReady || !editorRef.current) {
      console.log('⚠️ Editor not ready');
      toast.warning('Editorul nu este pregătit încă. Te rugăm să aștepți.');
      return;
    }

    // Obținem codul direct din editor
    const codeToRun = editorRef.current.getValue();
    console.log('🏃 Code to run:', codeToRun.substring(0, 100));
    
    // Verificăm că avem cod de rulat
    if (!codeToRun || codeToRun.trim() === '') {
      toast.warning('Te rugăm să scrii cod înainte de a-l rula.');
      return;
    }
    
    setIsRunning(true);
    setOutput('Se execută codul...');

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
        setOutput(data.output || 'Codul a fost executat cu succes!');
        toast.success('Codul a fost executat cu succes!');
      } else {
        setOutput(`Eroare: ${data.error}`);
        toast.error('Eroare la executarea codului.');
      }
    } catch (error) {
      console.error('Error executing code:', error);
      setOutput(`Eroare: ${error.message}`);
      toast.error('Eroare la comunicarea cu serverul.');
    } finally {
      setIsRunning(false);
      // NU resetăm editorul aici - păstrăm codul intact
    }
  };

  const handleGetFeedback = async () => {
    // Obținem codul direct din editor
    const codeToAnalyze = editorRef.current ? editorRef.current.getValue() : '';
    console.log('🤖 Getting feedback for:', codeToAnalyze.substring(0, 50));
    
    if (!codeToAnalyze || codeToAnalyze.trim() === '') {
      toast.warning('Te rugăm să scrii cod înainte de a cere feedback.');
      return;
    }
    
    setIsAnalyzing(true);
    setFeedback('Se analizează codul...');
    setShowFeedback(true);

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
      } else {
        setFeedback('Nu am putut genera feedback pentru acest cod.');
        toast.error('Eroare la generarea feedback-ului.');
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedback('Eroare la obținerea feedback-ului.');
      toast.error('Eroare la comunicarea cu serverul.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetCode = () => {
    if (window.confirm('Sigur dorești să resetezi codul? Toate modificările vor fi pierdute.')) {
      const codeToReset = initialCode || defaultCode;
      console.log('🔄 Resetting code to:', codeToReset.substring(0, 50));
      if (editorRef.current) {
        editorRef.current.setValue(codeToReset);
      }
      toast.info('Codul a fost resetat.');
    }
  };

  // Actualizăm codul când se schimbă initialCode sau editorKey - DOAR dacă e diferit
  useEffect(() => {
    if (editorRef.current && isEditorReady && initialCode) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== initialCode) {
        console.log('📝 Updating editor with new initialCode');
        editorRef.current.setValue(initialCode);
      }
    }
  }, [initialCode, editorKey, isEditorReady]);

  return (
    <div className="code-editor-container">
      <div className="editor-header">
        <h3>Editor de cod Java</h3>
        <div className="editor-actions">
          <Button 
            variant="secondary"
            size="small"
            onClick={handleResetCode}
            icon="🔄"
            iconPosition="left"
            aria-label="Resetează codul la versiunea inițială"
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
            aria-label="Cere feedback de la inteligența artificială pentru codul scris"
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
            aria-label="Execută codul Java scris în editor"
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
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              wordWrap: 'on',
              readOnly: false,
              // Setări esențiale pentru funcționarea corectă
              acceptSuggestionOnEnter: 'off',
              quickSuggestions: false,
              suggestOnTriggerCharacters: false,
              wordBasedSuggestions: false,
              // Dezactivăm funcții care pot interfera
              formatOnPaste: false,
              formatOnType: false,
              // Cursor settings
              cursorBlinking: 'blink',
              cursorSmoothCaretAnimation: false,
              cursorStyle: 'line',
              cursorWidth: 2,
              // Scrollbar simplu
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
              },
              // Selection și focus
              selectOnLineNumbers: true,
              glyphMargin: false,
              // Disable features that might interfere
              contextmenu: false,
              mouseWheelZoom: false,
              links: false,
              // Ensure proper text handling
              stopRenderingLineAfter: 10000,
              renderWhitespace: 'none',
              renderControlCharacters: false
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
              aria-label="Editor de cod Java alternativ"
              onChange={(e) => {
                if (onChange) onChange(e.target.value);
              }}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '14px',
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
                border: '1px solid #666',
                padding: '10px'
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
          aria-label="Rezultatul execuției codului"
          role="log"
          aria-live="polite"
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
              aria-label="Închide fereastra de feedback"
            >
              &times;
            </button>
          </div>
          <div 
            className="feedback-content"
            aria-label="Feedback de la inteligența artificială"
            role="region"
            aria-live="polite"
          >
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeEditor;