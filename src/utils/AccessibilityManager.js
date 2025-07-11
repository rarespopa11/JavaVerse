// src/utils/AccessibilityManager.js - Fixed version
class AccessibilityManager {
  constructor() {
    this.isAccessibilityMode = false;
    this.speechSynthesis = window.speechSynthesis;
    this.currentUtterance = null;
    this.voice = null;
    this.isReading = false;
    this.readingQueue = [];
    this.shortcuts = new Map();
    this.focusedElement = null;
    this.navigationMode = 'normal';
    this.currentFocusIndex = 0;
    this.focusableElements = [];
    this.navigationHistory = [];
    this.readingSpeed = 1.0;
    
    // Mod de editare
    this.isEditMode = false;
    this.currentEditElement = null;
    this.lastTypedChar = '';
    this.typingTimer = null;
    
    // Pentru alegerea editorului
    this.waitingForEditorChoice = false;
    this.currentEditorElement = null;
    
    // Setări pentru citire live
    this.liveReadingEnabled = true;
    this.readFullWords = true;
    this.charEchoEnabled = true;
    
    // Flag special pentru Monaco Editor
    this.isInMonacoEditor = false;
    this.monacoActive = false;
    
    this.initializeVoice();
    this.setupGlobalListeners();
    this.registerShortcuts();
  }

  initializeVoice() {
    const setVoice = () => {
      const voices = this.speechSynthesis.getVoices();
      
      // Lista de voci românești preferate (în ordinea preferinței)
      const romanianVoiceNames = [
        'Microsoft Andrei - Romanian (Romania)',
        'Microsoft Ioana - Romanian (Romania)',
        'Google română',
        'Romanian Romania',
        'Romanian Female',
        'Romanian Male'
      ];
      
      // Căutăm mai întâi după nume specific
      let selectedVoice = null;
      for (const voiceName of romanianVoiceNames) {
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes(voiceName.toLowerCase())
        );
        if (selectedVoice) break;
      }
      
      // Dacă nu găsim după nume, căutăm după cod de limbă
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang === 'ro-RO') || 
                       voices.find(voice => voice.lang.startsWith('ro')) ||
                       voices.find(voice => voice.lang.includes('ro'));
      }
      
      // Fallback la prima voce disponibilă
      this.voice = selectedVoice || voices[0];
      
      // Afișăm informații despre vocea selectată
      if (this.voice) {
        console.log(`Voce selectată: ${this.voice.name} (${this.voice.lang})`);
        
        // Anunțăm utilizatorul despre vocea selectată
        if (this.voice.lang.startsWith('ro')) {
          console.log('✓ Voce românească activată cu succes!');
        } else {
          console.warn('⚠ Nu s-a găsit o voce românească. Folosesc:', this.voice.name);
          console.log('Sugestie: Instalați o voce românească în sistemul de operare.');
        }
      }
      
      // Listăm toate vocile disponibile pentru debugging
      console.log('Voci disponibile:');
      voices.forEach(voice => {
        if (voice.lang.includes('ro')) {
          console.log(`  ✓ ${voice.name} - ${voice.lang} (Română)`);
        }
      });
    };

    // Încercăm să setăm vocea imediat
    if (this.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      // Așteptăm ca vocile să se încarce
      this.speechSynthesis.addEventListener('voiceschanged', setVoice);
    }
    
    // Forțăm o reîncărcare după 100ms pentru siguranță
    setTimeout(() => {
      if (!this.voice || !this.voice.lang.includes('ro')) {
        setVoice();
      }
    }, 100);
  }

  setupGlobalListeners() {
    // Expunem managerul la nivel global pentru verificări
    window.accessibilityManager = this;
    
    // Detectăm când intrăm/ieșim din Monaco prin multiple metode
    document.addEventListener('focusin', (e) => {
      const inMonaco = this.isMonacoRelated(e.target);
      if (inMonaco && !this.monacoActive) {
        this.monacoActive = true;
        this.isInMonacoEditor = true;
        console.log('📝 Monaco Editor ACTIVATED - ALL accessibility disabled');
      }
    }, true);
    
    document.addEventListener('focusout', (e) => {
      // Verificăm după un mic delay dacă am ieșit complet din Monaco
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (!this.isMonacoRelated(activeElement) && this.monacoActive) {
          this.monacoActive = false;
          this.isInMonacoEditor = false;
          console.log('📝 Monaco Editor DEACTIVATED - Accessibility re-enabled');
        }
      }, 50);
    }, true);
    
    // Click detection pentru Monaco
    document.addEventListener('click', (e) => {
      if (this.isAccessibilityMode) {
        const clickedMonaco = this.isMonacoRelated(e.target);
        if (clickedMonaco !== this.monacoActive) {
          this.monacoActive = clickedMonaco;
          this.isInMonacoEditor = clickedMonaco;
          console.log(`📝 Monaco state changed via click: ${clickedMonaco}`);
        }
      }
    }, true);
    
    // CRITICAL: Keydown handler cu verificare strictă pentru Monaco
    document.addEventListener('keydown', (e) => {
      // Dacă Monaco este activ, procesăm DOAR Escape și Ctrl+Shift+A
      if (this.monacoActive && this.isAccessibilityMode) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.exitMonacoEditor();
          return false;
        }
        // Permitem Ctrl+Shift+A pentru a dezactiva modul accesibilitate complet
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.toggleAccessibilityMode();
          return false;
        }
        // BLOCARE TOTALĂ pentru orice altă tastă
        return;
      }
      
      // Ctrl + Shift + A pentru activarea modului (în afara Monaco)
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        e.stopPropagation();
        this.toggleAccessibilityMode();
        return;
      }

      if (!this.isAccessibilityMode) {
        return;
      }

      // În modul editare pentru alte elemente (non-Monaco)
      if (this.isEditMode && !this.monacoActive) {
        this.handleEditModeKeydown(e);
        return;
      }

      // Prevenim comportamentul default doar pentru taste speciale în modul navigare
      if (!this.isEditMode && ['Tab', 'Enter', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      this.handleAccessibilityShortcuts(e);
    }, true); // Capture phase pentru prioritate maximă
    
    // Blocăm și keyup în Monaco pentru siguranță
    document.addEventListener('keyup', (e) => {
      if (this.monacoActive && this.isAccessibilityMode) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }, true);
    
    // Blocăm și keypress în Monaco
    document.addEventListener('keypress', (e) => {
      if (this.monacoActive && this.isAccessibilityMode) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }, true);
    
    // Handler pentru input events
    document.addEventListener('input', (e) => {
      // Dacă suntem în Monaco, nu procesăm deloc
      if (this.monacoActive || this.isInMonacoEditor) {
        return;
      }
      
      if (this.isAccessibilityMode && this.isEditMode && this.liveReadingEnabled) {
        this.handleLiveReading(e);
      }
    }, true);

    // Actualizăm lista de elemente focusabile când se schimbă DOM-ul
    const observer = new MutationObserver(() => {
      if (this.isAccessibilityMode && !this.isEditMode && !this.monacoActive) {
        this.updateFocusableElements();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Metodă îmbunătățită pentru detectarea Monaco
  isMonacoRelated(element) {
    if (!element || !element.nodeType) return false;
    
    // Listă extinsă de indicatori Monaco
    const monacoIndicators = [
      // Clase Monaco
      '.monaco-editor',
      '.overflow-guard',
      '.inputarea',
      '.view-line',
      '.view-lines',
      '.lines-content',
      '.monaco-editor-background',
      '.monaco-scrollable-element',
      '.cursor',
      '.cursors-layer',
      '.minimap',
      '.decorationsOverviewRuler',
      '.editor-container',
      '.editor-widget',
      
      // ID-uri și atribute
      '#code-editor',
      '[data-uri*="monaco"]',
      '[data-mode-id]',
      
      // Containere custom
      '.code-editor',
      '.editor-wrapper',
      '.code-editor-container',
      '.monaco-container'
    ];
    
    // Verificăm elementul și toți părinții
    let currentElement = element;
    let depth = 0;
    const maxDepth = 15; // Limităm adâncimea pentru performanță
    
    while (currentElement && depth < maxDepth) {
      // Verificare clase directe
      if (currentElement.classList) {
        for (const indicator of monacoIndicators) {
          if (indicator.startsWith('.') && currentElement.classList.contains(indicator.slice(1))) {
            return true;
          }
        }
      }
      
      // Verificare ID
      if (currentElement.id === 'code-editor') {
        return true;
      }
      
      // Verificare atribute
      if (currentElement.getAttribute) {
        if (currentElement.getAttribute('data-uri')?.includes('monaco') ||
            currentElement.getAttribute('data-mode-id') ||
            currentElement.getAttribute('role') === 'code' ||
            currentElement.getAttribute('data-monaco-editor') === 'true') {
          return true;
        }
      }
      
      // Verificare querySelector pentru toate indicatoarele
      for (const indicator of monacoIndicators) {
        if (currentElement.matches && currentElement.matches(indicator)) {
          return true;
        }
      }
      
      currentElement = currentElement.parentElement;
      depth++;
    }
    
    return false;
  }

  registerShortcuts() {
    // Comenzi de navigare principală
    this.shortcuts.set('Tab', () => this.navigateNext());
    this.shortcuts.set('Shift+Tab', () => this.navigatePrevious());
    this.shortcuts.set('Enter', () => this.activateElement());
    this.shortcuts.set(' ', () => this.toggleReading());
    this.shortcuts.set('Escape', () => this.stopReading());
    
    // Navigare rapidă cu F-keys - MODIFICAT pentru F2 și F3
    this.shortcuts.set('F1', () => this.readHelp());
    this.shortcuts.set('F2', () => this.navigateToLogin()); // NOU - pentru login
    this.shortcuts.set('F3', () => this.navigateToRegister()); // NOU - pentru register
    // F4 eliminat complet
    
    // Navigare în pagini
    this.shortcuts.set('alt+c', () => this.navigateToCourses());
    this.shortcuts.set('alt+p', () => this.navigateToPlayground());
    this.shortcuts.set('alt+r', () => this.navigateToProfile());
    this.shortcuts.set('alt+h', () => this.goHome());
    
    // Comenzi utilitare
    this.shortcuts.set('alt+m', () => this.readCurrentPage());
    this.shortcuts.set('alt+n', () => this.readNavigationInfo());
    this.shortcuts.set('alt+s', () => this.adjustSpeed());
    this.shortcuts.set('+', () => this.increaseSpeed()); // NOU - pentru mărirea vitezei
    this.shortcuts.set('-', () => this.decreaseSpeed()); // NOU - pentru micșorarea vitezei
    this.shortcuts.set('alt+b', () => this.navigateBack()); // FIXAT - înapoi la pagina anterioară
    this.shortcuts.set('alt+l', () => this.listAllElements());
    
    // Navigare prin elemente similare
    this.shortcuts.set('ctrl+b', () => this.nextButton());
    this.shortcuts.set('ctrl+l', () => this.nextLink());
    this.shortcuts.set('ctrl+i', () => this.nextInput());
    this.shortcuts.set('ctrl+t', () => this.nextHeading());
    
    // Navigare în quiz
    this.shortcuts.set('alt+1', () => this.selectQuizOption(0));
    this.shortcuts.set('alt+2', () => this.selectQuizOption(1));
    this.shortcuts.set('alt+3', () => this.selectQuizOption(2));
    this.shortcuts.set('alt+4', () => this.selectQuizOption(3));
    
    // Comenzi pentru editor de cod
    this.shortcuts.set('alt+e', () => this.executeCode());
    this.shortcuts.set('alt+f', () => this.getFeedback());
    
    // Comenzi pentru modul editare
    this.shortcuts.set('alt+q', () => this.readCurrentLine());
    this.shortcuts.set('alt+w', () => this.readCurrentWord());
    this.shortcuts.set('alt+d', () => this.toggleLiveReading());
  }

  // METODĂ NOUĂ pentru F2 - login
  navigateToLogin() {
    this.navigationHistory.push(window.location.href);
    this.speak("Navighez la autentificare", 'high');
    window.location.href = '/login';
  }

  // METODĂ NOUĂ pentru F3 - register
  navigateToRegister() {
    this.navigationHistory.push(window.location.href);
    this.speak("Navighez la înregistrare", 'high');
    window.location.href = '/register';
  }

  // METODĂ NOUĂ: F4 pentru ajutor specific paginii
  readPageSpecificHelp() {
    const currentPage = this.getPageName(window.location.pathname);
    
    let helpText = `Ajutor pentru ${currentPage}:\n\n`;
    
    switch (currentPage) {
      case 'pagina principală':
        helpText += `
          Navigare:
          - Tab pentru a naviga prin elemente
          - Enter pentru a activa linkurile și butoanele
          - Alt + C pentru a merge direct la cursuri
          
          Caracteristici disponibile:
          - Cursuri Java interactive
          - Playground pentru experimentare cu cod
          - Sistem de progres și realizări
        `;
        break;
        
      case 'pagina de cursuri':
        helpText += `
          Navigare prin cursuri:
          - Săgeata sus/jos pentru a naviga prin cursuri
          - Enter pentru a selecta un curs
          - Escape pentru a opri citirea
          
          Informații utile:
          - Fiecare curs conține multiple lecții
          - Progresul se salvează automat
          - La sfârșit vei susține un test
        `;
        break;
        
      case 'playground-ul de cod':
        helpText += `
          Comenzi pentru playground:
          - Săgeata sus/jos pentru navigare prin exemple
          - Enter pentru a activa/dezactiva editorul de cod
          - Alt + E pentru execuția codului (când editorul este activ)
          - Alt + F pentru feedback AI
          - Escape pentru a ieși din editorul de cod
          
          Funcționalități:
          - Editare de cod în timp real
          - Execuție instant a codului Java
          - Feedback inteligent de la AI
          - Exemple predefinite pentru învățare
        `;
        break;
        
      case 'pagina de profil':
        helpText += `
          Navigare în profil:
          - Tab pentru navigare prin secțiuni
          - Enter pentru a accesa diferitele tab-uri
          - Butonul Continuă pentru a relua cursurile
          
          Secțiuni disponibile:
          - Cursurile Mele: vezi progresul cursurilor
          - Realizări: vezi badge-urile câștigate
          - Setări: personalizează contul
        `;
        break;
        
      case 'pagina de test':
        helpText += `
          Comenzi pentru test:
          - Tastele 1-4 pentru selectarea răspunsurilor
          - Enter pentru validarea răspunsului
          - Escape pentru a opri citirea
          
          La sfârșitul testului:
          - R pentru a relua testul
          - Alt + R pentru a merge la profil
          - Alt + C pentru a reveni la cursuri
          
          Sfaturi:
          - Ascultă întrebarea complet înainte de a răspunde
          - Poți schimba răspunsul înainte de validare
        `;
        break;
        
      case 'pagina de autentificare':
      case 'pagina de înregistrare':
        helpText += `
          Completarea formularului:
          - Tab pentru navigare între câmpuri
          - Enter pentru a intra în modul editare
          - Escape pentru a ieși din modul editare
          - Enter pe buton pentru trimiterea formularului
          
          Notă:
          - Pentru câmpurile de parolă, caracterele nu se citesc pentru securitate
          - Toate câmpurile marcate sunt obligatorii
        `;
        break;
        
      default:
        helpText += `
          Comenzi generale:
          - Tab și Shift + Tab pentru navigare
          - Enter pentru activarea elementelor
          - F1 pentru ajutorul complet
          - Alt + B pentru înapoi
          
          Navigare rapidă:
          - Alt + C pentru cursuri
          - Alt + P pentru playground
          - Alt + R pentru profil
          - Alt + H pentru acasă
        `;
        break;
    }    
    this.speak(helpText, 'high');
  }

  handleEditModeKeydown(e) {
    // Această funcție este apelată doar pentru non-Monaco editors
    if (e.key === 'Escape') {
      e.preventDefault();
      this.exitEditMode();
      return;
    }
    
    if (e.altKey && e.key === 'q') {
      e.preventDefault();
      this.readCurrentLine();
      return;
    }
    
    if (e.altKey && e.key === 'w') {
      e.preventDefault();
      this.readCurrentWord();
      return;
    }
    
    if (e.altKey && e.key === 'd') {
      e.preventDefault();
      this.toggleLiveReading();
      return;
    }
    
    // Pentru input-uri normale - citire la navigare stânga/dreapta
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      setTimeout(() => {
        this.readCharacterAtCursor();
      }, 50);
    }
  }

  handleLiveReading(e) {
    const target = e.target;
    
    // Pentru Monaco Editor, nu procesăm
    if (this.isMonacoRelated(target)) {
      return;
    }
    
    if (!['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      return;
    }
    
    // Anulăm timer-ul anterior
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    
    // FIXAT: Pentru câmpurile de parolă, nu citim caracterele
    const inputType = target.type;
    if (inputType === 'password') {
      // Pentru parolă, nu citim caracterele individual
      return;
    }
    
    // Citim caracterul tastat imediat - ÎMBUNĂTĂȚIT pentru punctuație
    if (this.charEchoEnabled && e.data) {
      this.speak(this.getCharDescription(e.data), 'high');
    }
    
    // Setăm un timer pentru a citi cuvântul complet
    if (this.readFullWords) {
      this.typingTimer = setTimeout(() => {
        const word = this.getCurrentWord(target);
        if (word && word.length > 1) {
          this.speak(`Cuvânt: ${word}`, 'normal');
        }
      }, 500);
    }
  }

  // ÎMBUNĂTĂȚIRE: Descrierea caracterelor cu semne de punctuație
  getCharDescription(char) {
    const charDescriptions = {
      ' ': 'spațiu',
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
      '`': 'accent grav',
      '\n': 'linie nouă',
      '\t': 'tab'
    };
    
    return charDescriptions[char] || char;
  }

  getCurrentWord(element) {
    const value = element.value || element.textContent;
    const cursorPos = element.selectionStart || value.length;
    
    let start = cursorPos;
    let end = cursorPos;
    
    while (start > 0 && !/\s/.test(value[start - 1])) {
      start--;
    }
    
    while (end < value.length && !/\s/.test(value[end])) {
      end++;
    }
    
    return value.substring(start, end).trim();
  }

  readCurrentLine() {
    if (!this.currentEditElement) {
      this.speak("Nu ești într-un câmp de editare", 'high');
      return;
    }
    
    // Pentru Monaco Editor - versiune simplificată
    if (this.isMonacoRelated(this.currentEditElement)) {
      this.speak("Citirea liniei în Monaco Editor nu este disponibilă momentan", 'high');
      return;
    }
    
    const element = this.currentEditElement;
    
    if (element.tagName === 'TEXTAREA') {
      const value = element.value || '';
      const cursorPos = element.selectionStart || 0;
      
      const lines = value.split('\n');
      let currentLineIndex = 0;
      let charCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1;
        if (charCount > cursorPos) {
          currentLineIndex = i;
          break;
        }
      }
      
      const currentLine = lines[currentLineIndex];
      if (currentLine.trim()) {
        this.speak(`Linia ${currentLineIndex + 1}: ${currentLine}`, 'high');
      } else {
        this.speak(`Linia ${currentLineIndex + 1}: linie goală`, 'high');
      }
    } else {
      const value = element.value;
      if (value) {
        this.speak(`Conținut: ${value}`, 'high');
      } else {
        this.speak("Câmp gol", 'high');
      }
    }
  }
  
  readCurrentWord() {
    if (!this.currentEditElement) {
      this.speak("Nu ești într-un câmp de editare", 'high');
      return;
    }
    
    // Pentru Monaco Editor - versiune simplificată
    if (this.isMonacoRelated(this.currentEditElement)) {
      this.speak("Citirea cuvântului în Monaco Editor nu este disponibilă momentan", 'high');
      return;
    }
    
    const word = this.getCurrentWord(this.currentEditElement);
    if (word) {
      this.speak(`Cuvânt: ${word}`, 'high');
    } else {
      this.speak("Nu există cuvânt la poziția curentă", 'high');
    }
  }

  readCharacterAtCursor() {
    if (!this.currentEditElement) return;
    
    const element = this.currentEditElement;
    const value = element.value;
    const cursorPos = element.selectionStart;
    
    if (cursorPos < value.length) {
      const char = value[cursorPos];
      this.speak(this.getCharDescription(char), 'high');
    } else {
      this.speak("Sfârșit de text", 'high');
    }
  }

  toggleLiveReading() {
    this.liveReadingEnabled = !this.liveReadingEnabled;
    this.speak(
      this.liveReadingEnabled 
        ? "Citire live activată" 
        : "Citire live dezactivată", 
      'high'
    );
  }

  activateElement() {
    if (!this.focusedElement) {
      // FIXAT: Nu mai anunțăm "niciun element selectat" - doar returnăm fără să spunem nimic
      return;
    }
    
    const tagName = this.focusedElement.tagName.toLowerCase();
    
    // Pentru Monaco Editor - activare specială
    if (this.isMonacoRelated(this.focusedElement)) {
      this.enterMonacoEditor(this.focusedElement);
      return;
    }
    
    // Pentru inputuri normale
    if (['input', 'textarea', 'select'].includes(tagName)) {
      this.enterEditMode(this.focusedElement);
      return;
    }
    
    // Pentru alte elemente
    this.speak("Activez elementul", 'normal');
    
    if (this.focusedElement.click) {
      this.focusedElement.click();
    } else if (tagName === 'a') {
      window.location.href = this.focusedElement.href;
    }
  }

  enterMonacoEditor(element) {
    // Setăm flagurile înainte de orice altceva
    this.monacoActive = true;
    this.isInMonacoEditor = true;
    this.isEditMode = true;
    this.currentEditElement = element;
    
    // Găsim containerul Monaco
    const monacoContainer = element.classList.contains('monaco-editor') 
      ? element 
      : element.closest('.monaco-editor') || element.closest('.editor-wrapper') || element;
    
    // Focusăm editorul Monaco
    setTimeout(() => {
      // Căutăm diferite elemente care pot primi focus în Monaco
      const focusTargets = [
        '.inputarea',
        '.monaco-editor textarea',
        '[role="textbox"]',
        '.view-lines',
        '.monaco-editor'
      ];
      
      let focused = false;
      for (const selector of focusTargets) {
        const target = monacoContainer.querySelector(selector);
        if (target) {
          target.focus();
          target.click();
          focused = true;
          console.log('✅ Focused Monaco element:', selector);
          break;
        }
      }
      
      if (!focused) {
        monacoContainer.click();
        console.log('⚠️ Clicked container as fallback');
      }
    }, 100);
    
    this.speak("Editor de cod activat. Scrie normal. Apasă Escape pentru a ieși.", 'high');
    
    document.body.classList.add('editing-monaco');
    
    document.dispatchEvent(new CustomEvent('monacoEditModeChanged', {
      detail: { isActive: true }
    }));
    
    console.log('🟢 Monaco Editor fully activated');
  }
  
  exitMonacoEditor() {
    console.log('🔴 Exiting Monaco Editor...');
    
    this.monacoActive = false;
    this.isInMonacoEditor = false;
    this.isEditMode = false;
    
    // Blur toate elementele Monaco posibile
    const monacoElements = document.querySelectorAll('.monaco-editor textarea, .inputarea, [role="textbox"]');
    monacoElements.forEach(el => el.blur());
    
    // Blur și elementul activ curent
    if (document.activeElement) {
      document.activeElement.blur();
    }
    
    document.body.classList.remove('editing-monaco');
    
    this.speak("Am ieșit din editorul de cod. Navigare reactivată.", 'high');
    
    // Re-focusăm containerul pentru navigare
    if (this.currentEditElement) {
      const container = this.currentEditElement.closest('.monaco-editor') || 
                       this.currentEditElement.closest('.editor-wrapper') ||
                       this.currentEditElement;
      
      setTimeout(() => {
        this.setFocus(container);
      }, 100);
      
      this.currentEditElement = null;
    }
    
    document.dispatchEvent(new CustomEvent('monacoEditModeChanged', {
      detail: { isActive: false }
    }));
    
    console.log('✅ Monaco Editor deactivated');
  }

  enterEditMode(element) {
    // Pentru input-uri normale (non-Monaco)
    this.isEditMode = true;
    this.currentEditElement = element;
    
    element.focus();
    element.classList.add('accessibility-edit-mode');
    
    // FIXAT: Pentru câmpurile de parolă, nu citim caracterele
    const inputType = element.type;
    let announcement = 'Mod editare activat. ';
    
    if (inputType === 'password') {
      announcement += 'Câmp parolă. Caracterele nu vor fi citite pentru securitate. ';
    } else {
      announcement += this.getEditModeInstructions(element);
    }
    
    this.speak(announcement, 'high');
    
    document.body.classList.add('editing');
    
    document.dispatchEvent(new CustomEvent('editModeChanged', {
      detail: { isEditMode: true, element: element }
    }));
  }
  
  exitEditMode() {
    if (!this.isEditMode) return;
    
    this.isEditMode = false;
    
    if (this.currentEditElement) {
      this.currentEditElement.blur();
      this.currentEditElement.classList.remove('accessibility-edit-mode');
      document.body.classList.remove('editing');
      
      this.speak("Mod editare dezactivat. Navigare reactivată", 'high');
      
      // Re-focusăm elementul pentru navigare
      this.setFocus(this.currentEditElement);
      
      this.currentEditElement = null;
    }
    
    document.dispatchEvent(new CustomEvent('editModeChanged', {
      detail: { isEditMode: false }
    }));
  }

  getEditModeInstructions(element) {
    const tagName = element.tagName.toLowerCase();
    let instructions = "";
    
    switch (tagName) {
      case 'input':
        const inputType = element.type;
        if (inputType === 'text' || inputType === 'email') {
          instructions = "Tastează textul dorit. ";
        } else if (inputType === 'password') {
          instructions = "Tastează parola. Caracterele nu vor fi citite pentru securitate. ";
        }
        break;
        
      case 'textarea':
        instructions = "Tastează textul. Folosește Enter pentru linie nouă. ";
        break;
        
      case 'select':
        instructions = "Folosește săgețile sus/jos pentru a selecta o opțiune. ";
        break;
        
      default:
        instructions = "Element în modul editare. ";
        break;
    }
    
    if (element.type !== 'password') {
      instructions += "Alt+Q pentru a citi linia curentă. ";
      instructions += "Alt+W pentru a citi cuvântul curent. ";
    }
    instructions += "Escape pentru a ieși din modul editare.";
    
    return instructions;
  }

  toggleAccessibilityMode() {
    this.isAccessibilityMode = !this.isAccessibilityMode;
    
    if (this.isAccessibilityMode) {
      // FIXAT: Anunț direct la bine ai venit fără să menționeze pagina
      this.speak("Bine ai venit în modul pentru nevăzători JavaVerse!", 'high');
      this.addAccessibilityStyles();
      this.updateFocusableElements();
      
      setTimeout(() => {
        this.readWelcomeMessage();
      }, 2000);
    } else {
      this.speak("Modul pentru nevăzători dezactivat.");
      this.removeAccessibilityStyles();
      this.stopReading();
      
      if (this.isEditMode) {
        this.exitEditMode();
      }
      
      if (this.isInMonacoEditor || this.monacoActive) {
        this.exitMonacoEditor();
      }
    }
    
    document.dispatchEvent(new CustomEvent('accessibilityModeChanged', {
      detail: { isActive: this.isAccessibilityMode }
    }));
  }

  readWelcomeMessage() {
    const welcomeText = `
      Bine ai venit în modul pentru nevăzători JavaVerse!
      
      Navigare principală:
      - Tab pentru următorul element
      - Shift + Tab pentru elementul anterior
      - Enter pentru a activa elementul selectat
      - Spațiu pentru pauză sau continuare citire
      - Escape pentru a opri citirea
      
      Navigare rapidă:
      - F1 pentru meniul de ajutor
      - F2 pentru autentificare
      - F3 pentru înregistrare
      
      Navigare în site cu Alt:
      - Alt + C pentru cursuri
      - Alt + P pentru playground
      - Alt + R pentru profil
      - Alt + H pentru pagina principală
      - Alt + B pentru înapoi la pagina anterioară
      
      Navigare prin elemente cu Ctrl:
      - Ctrl + B pentru următorul buton
      - Ctrl + L pentru următorul link
      - Ctrl + I pentru următorul câmp de input
      - Ctrl + T pentru următorul titlu
      
      În editorul de cod:
      - Enter pentru a intra în editor
      - Scrie normal ca în orice editor
      - Escape pentru a ieși din editor și a reveni la navigare
      
      Alte comenzi utile:
      - Alt + M pentru citirea paginii curente
      - Alt + N pentru informații de navigare
      - Alt + S pentru ajustarea vitezei de citire
      - Alt + L pentru lista tuturor elementelor
      
      În quiz folosește Alt + 1, 2, 3 sau 4 pentru variante.
      În editor folosește Alt + E pentru execuție și Alt + F pentru feedback.
    `;
    
    this.speak(welcomeText, 'high');
  }

  handleAccessibilityShortcuts(e) {
    if (this.isEditMode || this.isInMonacoEditor || this.monacoActive) return;
    
    const key = this.getShortcutKey(e);
    const handler = this.shortcuts.get(key);
    
    if (handler) {
      e.preventDefault();
      handler();
    }
  }

  getShortcutKey(e) {
    const parts = [];
    
    if (e.ctrlKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('Shift');
    
    let key = e.key;
    if (key === ' ') key = ' ';
    if (key.length === 1) key = key.toLowerCase();
    
    parts.push(key);
    
    return parts.join('+');
  }

  // ÎMBUNĂTĂȚIRE: updateFocusableElements pentru a exclude elemente redundante
  updateFocusableElements() {
    const selectors = [
      'a[href]:not([disabled]):not(.footer-link)',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '.course-card',
      '.question-container li',
      '.feature-card',
      '.example-card',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="navigation"]',
      '[role="main"]',
      '.monaco-editor',
      '.editor-wrapper',
      '#code-editor',
      '.tabButton',
      '.statCard',
      '.continueButton',
      '.achievementCard',
      '.checkAchievementsBtn'
    ];
    
    this.focusableElements = Array.from(document.querySelectorAll(selectors.join(', ')))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0 || el.offsetParent === null) {
          return false;
        }
        
        if (el.closest('.jv-footer')) {
          return false;
        }
        
        if (el.classList.contains('accessibility-navigation-info')) {
          return false;
        }
        
        // FIXAT: Excludem titlurile de pe pagina principală care conțin "mod accesibilitate"
        if (window.location.pathname === '/' || window.location.pathname === '') {
          if (el.tagName.match(/^H[1-6]$/)) {
            const text = el.textContent?.toLowerCase();
            if (text?.includes('mod accesibilitate') || text?.includes('javaverse')) {
              return false;
            }
          }
        }
        
        // FIXAT: Logică specială pentru pagina de profil
        if (window.location.pathname === '/profile') {
          return this.shouldIncludeInProfileNavigation(el);
        }
        
        return true;
      })
      .sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        
        if (Math.abs(rectA.top - rectB.top) < 10) {
          return rectA.left - rectB.left;
        }
        return rectA.top - rectB.top;
      });
  }

  // ADAUGĂ ACEASTĂ FUNCȚIE NOUĂ DUPĂ updateFocusableElements():
  shouldIncludeInProfileNavigation(element) {
    // Întotdeauna includem tab-urile și statisticile
    if (element.classList.contains('tabButton') || element.classList.contains('statCard')) {
      return true;
    }
    
    // Determinăm tab-ul activ
    const activeTab = document.querySelector('.activeTab')?.textContent?.trim();
    
    switch (activeTab) {
      case 'Cursurile Mele':
        return element.classList.contains('continueButton') || 
               element.closest('.courseCard') || 
               element.classList.contains('exploreCourses');
               
      case 'Realizări':
        return element.classList.contains('checkAchievementsBtn') || 
               element.classList.contains('achievementCard') ||
               element.closest('.achievementsContainer');
               
      case 'Setări':
        // FIXAT: Includem și butoanele de salvare din setări
        return element.closest('.settingsContainer') || 
               element.id === 'username' ||
               element.id === 'currentPassword' ||
               element.id === 'newPassword' ||
               element.id === 'confirmPassword' ||
               (element.tagName === 'BUTTON' && element.closest('.settingSection')) ||
               // FIXAT: Includem specific butoanele de salvare
               element.classList.contains('saveButton') ||
               element.textContent?.includes('Salvează') ||
               element.textContent?.includes('Schimbă');
               
      default:
        return true;
    }
  }

  navigateNext() {
    this.updateFocusableElements();
    
    if (this.focusableElements.length === 0) {
      this.speak("Nu sunt elemente disponibile pentru navigare", 'high');
      return;
    }
    
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.setFocus(this.focusableElements[this.currentFocusIndex]);
  }

  navigatePrevious() {
    this.updateFocusableElements();
    
    if (this.focusableElements.length === 0) {
      this.speak("Nu sunt elemente disponibile pentru navigare", 'high');
      return;
    }
    
    this.currentFocusIndex = this.currentFocusIndex === 0 
      ? this.focusableElements.length - 1 
      : this.currentFocusIndex - 1;
      
    this.setFocus(this.focusableElements[this.currentFocusIndex]);
  }

  setFocus(element) {
    if (!element) return;
    
    document.querySelectorAll('.accessibility-focus').forEach(el => {
      el.classList.remove('accessibility-focus');
    });
    
    this.focusedElement = element;
    element.classList.add('accessibility-focus');
    
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    });
    
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) && !this.isEditMode) {
      // Nu dăm focus automat
    }
    
    this.readElementInfo(element);
  }

  // ÎMBUNĂTĂȚIRE: readElementInfo cu anunțuri îmbunătățite pentru profil
  readElementInfo(element) {
    let description = '';
    const tagName = element.tagName.toLowerCase();
    const ariaLabel = element.getAttribute('aria-label');
    const text = element.textContent?.trim();
    
    // Verificăm mai întâi dacă e Monaco Editor
    if (this.isMonacoRelated(element)) {
      const codeContent = this.getMonacoContent(element);
      if (codeContent) {
        description = `Editor de cod. ${codeContent.split('\n').length} linii de cod. Apasă Enter pentru a edita.`;
      } else {
        description = 'Editor de cod gol. Apasă Enter pentru a începe să scrii cod.';
      }
      this.speak(description, 'high');
      return;
    }
    
    // FIXAT: Anunțăm când ajungem la secțiunea de schimbare parolă
    if (element.id === 'currentPassword' && window.location.pathname === '/profile') {
      description = 'Schimbare parolă. Câmp parolă actuală.';
      this.speak(description, 'high');
      return;
    }
    
    if (ariaLabel) {
      description = ariaLabel;
    } else {
      switch (tagName) {
        case 'button':
          // FIXAT: Anunțuri specifice pentru butoanele din profil
          if (element.classList.contains('continueButton')) {
            description = `Buton Continuă cursul`;
          } else if (element.classList.contains('checkAchievementsBtn')) {
            description = `Buton Verifică noi realizări`;
          } else if (element.closest('.settingSection')) {
            // Pentru butoanele din setări, descriem funcția lor
            if (text.includes('Salvează')) {
              description = `Buton Salvează modificările la numele de utilizator`;
            } else if (text.includes('Schimbă')) {
              description = `Buton Schimbă parola`;
            } else {
              description = `Buton: ${text || 'Fără text'}`;
            }
          } else {
            description = `Buton: ${text || 'Fără text'}`;
          }
          break;
          
        case 'a':
          description = `Link: ${text || 'Fără text'}`;
          break;
          
        case 'input':
          const inputType = element.type;
          const inputLabel = document.querySelector(`label[for="${element.id}"]`)?.textContent;
          const inputValue = element.value;
          
          if (inputType === 'text' || inputType === 'email' || inputType === 'password') {
            description = `Câmp ${inputType}: ${inputLabel || element.placeholder || 'Fără etichetă'}`;
            if (inputValue && inputType !== 'password') {
              description += `. Valoare curentă: ${inputValue}`;
            } else if (inputValue && inputType === 'password') {
              description += `. Parolă introdusă`;
            }
          } else if (inputType === 'radio' || inputType === 'checkbox') {
            description = `${inputType === 'radio' ? 'Opțiune' : 'Bifă'}: ${inputLabel || text}. ${element.checked ? 'Selectat' : 'Neselectat'}`;
          }
          break;
          
        case 'select':
          const selectLabel = document.querySelector(`label[for="${element.id}"]`)?.textContent;
          const selectedOption = element.options[element.selectedIndex]?.text;
          description = `Listă derulantă: ${selectLabel || 'Fără etichetă'}. Selectat: ${selectedOption || 'Nimic'}`;
          break;
          
        case 'textarea':
          const textareaLabel = document.querySelector(`label[for="${element.id}"]`)?.textContent;
          description = `Zonă de text: ${textareaLabel || element.placeholder || 'Fără etichetă'}`;
          if (element.value) {
            description += `. ${element.value.length} caractere introduse`;
          }
          break;
          
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          // ÎMBUNĂTĂȚIRE: Nu citim titlurile ca elemente separate dacă fac parte dintr-un card
          if (element.closest('.course-card') || element.closest('.statCard') || 
              element.closest('.achievementCard') || element.closest('.settingSection')) {
            return; // Nu citim titlurile din interiorul cardurilor
          }
          const level = tagName.charAt(1);
          description = `Titlu nivel ${level}: ${text}`;
          break;
          
        default:
          if (element.classList.contains('course-card')) {
            const title = element.querySelector('.course-title, h2, h3')?.textContent;
            const desc = element.querySelector('.course-description, p')?.textContent;
            description = `Curs: ${title}. ${desc || ''}`;
          } else if (element.classList.contains('statCard')) {
            const value = element.querySelector('.statValue')?.textContent;
            const label = element.querySelector('.statLabel')?.textContent;
            description = `${value} ${label}`;
          } else if (element.classList.contains('feature-card')) {
            const title = element.querySelector('h3')?.textContent;
            const desc = element.querySelector('p')?.textContent;
            description = `Caracteristică: ${title}. ${desc}`;
          } else if (element.classList.contains('example-card')) {
            const title = element.querySelector('.card-title')?.textContent || text;
            description = `Exemplu de cod: ${title}`;
          } else if (element.classList.contains('tabButton')) {
            const isActive = element.classList.contains('activeTab');
            description = `Tab ${text}${isActive ? ' activ' : ''}`;
          } else if (element.classList.contains('achievementCard')) {
            const name = element.querySelector('h3')?.textContent;
            const desc = element.querySelector('p')?.textContent;
            const isUnlocked = !element.classList.contains('lockedAchievement');
            description = `Realizare ${isUnlocked ? 'deblocată' : 'blocată'}: ${name}. ${desc}`;
          } else {
            description = text || `Element ${tagName}`;
          }
          break;
      }
    }
    
    if (['button', 'a'].includes(tagName) || element.getAttribute('role') === 'button') {
      description += ". Apasă Enter pentru a activa";
    } else if (['input', 'textarea', 'select'].includes(tagName)) {
      description += ". Apasă Enter pentru a edita";
    }
    
    this.speak(description, 'high');
  }

  navigateToSection(sectionName) {
    let selector;
    let announcement;
    
    switch (sectionName) {
      case 'header':
        selector = 'header, [role="banner"], .jv-header';
        announcement = "Navighez la header";
        break;
      case 'main':
        selector = 'main, [role="main"], .body-content';
        announcement = "Navighez la conținutul principal";
        break;
      default:
        this.speak("Secțiune necunoscută", 'high');
        return;
    }
    
    const section = document.querySelector(selector);
    if (section) {
      this.speak(announcement, 'high');
      
      const firstFocusable = section.querySelector(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (firstFocusable) {
        const index = this.focusableElements.indexOf(firstFocusable);
        if (index !== -1) {
          this.currentFocusIndex = index;
          this.setFocus(firstFocusable);
        }
      } else {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.speak("Secțiune fără elemente interactive", 'normal');
      }
    } else {
      this.speak("Secțiunea nu a fost găsită", 'high');
    }
  }

  nextButton() {
    this.navigateToNextOfType('button, [role="button"]', 'buton');
  }

  nextLink() {
    this.navigateToNextOfType('a[href]', 'link');
  }

  nextInput() {
    this.navigateToNextOfType('input, textarea, select', 'câmp de input');
  }

  nextHeading() {
    this.navigateToNextOfType('h1, h2, h3, h4, h5, h6', 'titlu');
  }

  navigateToNextOfType(selector, typeName) {
    const elements = Array.from(document.querySelectorAll(selector))
      .filter(el => el.offsetParent !== null);
    
    if (elements.length === 0) {
      this.speak(`Nu există ${typeName} pe această pagină`, 'high');
      return;
    }
    
    let nextIndex = -1;
    
    if (this.focusedElement) {
      const currentTypeIndex = elements.indexOf(this.focusedElement);
      if (currentTypeIndex !== -1) {
        nextIndex = (currentTypeIndex + 1) % elements.length;
      } else {
        const currentRect = this.focusedElement.getBoundingClientRect();
        for (let i = 0; i < elements.length; i++) {
          const rect = elements[i].getBoundingClientRect();
          if (rect.top > currentRect.top || 
              (Math.abs(rect.top - currentRect.top) < 10 && rect.left > currentRect.left)) {
            nextIndex = i;
            break;
          }
        }
      }
    }
    
    if (nextIndex === -1) {
      nextIndex = 0;
    }
    
    const targetElement = elements[nextIndex];
    const globalIndex = this.focusableElements.indexOf(targetElement);
    
    if (globalIndex !== -1) {
      this.currentFocusIndex = globalIndex;
      this.setFocus(targetElement);
    }
  }

  adjustSpeed() {
    const speeds = [0.7, 1.0, 1.3, 1.5];
    const currentIndex = speeds.indexOf(this.readingSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    
    this.readingSpeed = speeds[nextIndex];
    this.speak(`Viteză de citire: ${Math.round(this.readingSpeed * 100)}%`, 'high');
  }

  increaseSpeed() {
    const speeds = [0.7, 1.0, 1.3, 1.5];
    const currentIndex = speeds.indexOf(this.readingSpeed);
    if (currentIndex < speeds.length - 1) {
      this.readingSpeed = speeds[currentIndex + 1];
      this.speak(`Viteză de citire: ${Math.round(this.readingSpeed * 100)}%`, 'high');
    }
  }

  decreaseSpeed() {
    const speeds = [0.7, 1.0, 1.3, 1.5];
    const currentIndex = speeds.indexOf(this.readingSpeed);
    if (currentIndex > 0) {
      this.readingSpeed = speeds[currentIndex - 1];
      this.speak(`Viteză de citire: ${Math.round(this.readingSpeed * 100)}%`, 'high');
    }
  }

  speak(text, priority = 'normal') {
    if (!text || text.trim() === '') return;

    if (priority === 'high') {
      this.stopReading();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    utterance.rate = this.readingSpeed;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isReading = true;
      this.currentUtterance = utterance;
      
      document.dispatchEvent(new CustomEvent('speechStatusChanged', {
        detail: { isSpeaking: true }
      }));
    };

    utterance.onend = () => {
      this.isReading = false;
      this.currentUtterance = null;
      this.processQueue();
      
      document.dispatchEvent(new CustomEvent('speechStatusChanged', {
        detail: { isSpeaking: false }
      }));
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      this.isReading = false;
      this.currentUtterance = null;
    };

    if (this.isReading && priority !== 'high') {
      this.readingQueue.push(utterance);
    } else {
      this.speechSynthesis.speak(utterance);
    }
  }

  // METODĂ ÎMBUNĂTĂȚITĂ: navigare cu persistența modului de accesibilitate
  navigateWithAccessibilityPersistence(destination, url) {
    // Salvăm starea modului de accesibilitate
    sessionStorage.setItem('accessibilityModeActive', this.isAccessibilityMode.toString());
    
    this.navigationHistory.push(window.location.href);
    this.speak(`Navighez la ${destination}`, 'high');
    
    // Navigăm la URL
    window.location.href = url;
  }

  // FIXAT: navigateBack pentru a merge la pagina anterioară din browser
  navigateBack() {
    this.speak("Navighez înapoi", 'high');
    
    // Persistăm modul de accesibilitate
    sessionStorage.setItem('accessibilityModeActive', this.isAccessibilityMode.toString());
    
    // Folosim history.back() pentru a merge la pagina anterioară din browser
    window.history.back();
  }

  listAllElements() {
    this.updateFocusableElements();
    
    const totalElements = this.focusableElements.length;
    const currentPosition = this.currentFocusIndex + 1;
    
    let summary = `Pagina conține ${totalElements} elemente interactive. `;
    summary += `Ești la elementul ${currentPosition} din ${totalElements}. `;
    
    const counts = {
      buttons: document.querySelectorAll('button, [role="button"]').length,
      links: document.querySelectorAll('a[href]').length,
      inputs: document.querySelectorAll('input, textarea, select').length,
      headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length
    };
    
    summary += `Găsit: ${counts.buttons} butoane, ${counts.links} linkuri, `;
    summary += `${counts.inputs} câmpuri de input, ${counts.headings} titluri.`;
    
    this.speak(summary, 'high');
  }

  // METODE ÎMBUNĂTĂȚITE pentru navigare cu persistența accesibilității
  navigateToCourses() {
    this.navigateWithAccessibilityPersistence('cursuri', '/courses');
  }

  navigateToPlayground() {
    this.navigateWithAccessibilityPersistence('playground', '/playground');
  }

  navigateToProfile() {
    this.navigateWithAccessibilityPersistence('profil', '/profile');
  }

  goHome() {
    this.navigateWithAccessibilityPersistence('pagina principală', '/');
  }

  selectQuizOption(index) {
    const options = document.querySelectorAll('.question-container li');
    if (options[index]) {
      options[index].click();
      
      // FIXAT: Anunțăm și textul răspunsului selectat
      const optionText = options[index].querySelector('label')?.textContent || `Răspunsul ${index + 1}`;
      this.speak(`Selectat răspunsul ${index + 1}: ${optionText}`, 'high');
    } else {
      this.speak(`Nu există răspunsul ${index + 1}`, 'high');
    }
  }

  executeCode() {
    const runButton = document.querySelector('.editor-actions button[aria-label*="Execută"]');
    if (runButton) {
      runButton.click();
      this.speak("Execut codul", 'high');
    } else {
      this.speak("Butonul de execuție nu a fost găsit", 'high');
    }
  }

  getFeedback() {
    const feedbackButton = document.querySelector('.editor-actions button[aria-label*="feedback"]');
    if (feedbackButton) {
      feedbackButton.click();
      this.speak("Solicit feedback AI", 'high');
    } else {
      this.speak("Butonul de feedback nu a fost găsit", 'high');
    }
  }

  readNavigationInfo() {
    const currentUrl = window.location.pathname;
    const totalElements = this.focusableElements.length;
    const position = this.currentFocusIndex + 1;
    
    let info = `Ești pe ${this.getPageName(currentUrl)}. `;
    info += `Elementul curent: ${position} din ${totalElements}. `;
    info += `Folosește Tab pentru navigare sau apasă F1 pentru ajutor.`;
    
    this.speak(info, 'high');
  }

  getPageName(url) {
    if (url === '/' || url === '') return 'pagina principală';
    if (url.includes('/courses')) return 'pagina de cursuri';
    if (url.includes('/playground')) return 'playground-ul de cod';
    if (url.includes('/profile')) return 'pagina de profil';
    if (url.includes('/login')) return 'pagina de autentificare';
    if (url.includes('/register')) return 'pagina de înregistrare';
    if (url.includes('/quiz')) return 'pagina de test';
    return 'pagina curentă';
  }

  readHelp() {
    const currentPage = this.getPageName(window.location.pathname);
    
    const helpText = `
      Ajutor pentru ${currentPage}.
      
      Comenzi esențiale:
      - Tab și Shift Tab pentru navigare înainte și înapoi
      - Enter pentru a activa elementul selectat
      - Spațiu pentru pauză sau continuare citire
      - Escape pentru oprire citire
      
      Navigare rapidă cu taste funcționale:
      - F1 pentru acest ajutor
      - F2 pentru autentificare
      - F3 pentru înregistrare
      
      Navigare în site cu Alt:
      - Alt C pentru cursuri
      - Alt P pentru playground
      - Alt R pentru profil
      - Alt H pentru acasă
      - Alt B pentru înapoi la pagina anterioară
      
      Navigare prin tipuri cu Ctrl:
      - Ctrl B pentru butoane
      - Ctrl L pentru linkuri
      - Ctrl I pentru câmpuri input
      - Ctrl T pentru titluri
      
      În modul editare:
      - Alt Q pentru a citi linia curentă
      - Alt W pentru a citi cuvântul curent
      - Alt D pentru a comuta citirea live
      - Escape pentru a ieși din editare
      
      Comenzi speciale:
      - Alt M pentru citirea paginii
      - Alt N pentru informații navigare
      - Alt S pentru viteză citire
      - Alt L pentru lista elementelor
      
      ${this.getPageSpecificHelp(currentPage)}
    `;
    
    this.speak(helpText, 'high');
  }

  getPageSpecificHelp(pageName) {
    switch (pageName) {
      case 'pagina de cursuri':
        return 'În această pagină: Navighează prin cursuri cu Tab. Apasă Enter pentru a selecta un curs.';
        
      case 'playground-ul de cod':
        return 'În editor: Alt E pentru execuție, Alt F pentru feedback AI. În modul editare, săgețile sus/jos citesc linia curentă.';
        
      case 'pagina de test':
        return 'În test: Alt 1-4 pentru răspunsuri. Enter pentru verificare sau următoarea întrebare.';
        
      case 'pagina de profil':
        return 'În profil: Navighează prin secțiuni cu Tab. Enter pentru a modifica setările.';
        
      case 'pagina de autentificare':
      case 'pagina de înregistrare':
        return 'Completează câmpurile cu Tab și Enter. În modul editare, tastează normal și folosește Escape când termini.';
        
      default:
        return 'Folosește Tab pentru navigare și F1 pentru ajutor.';
    }
  }

  stopReading() {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
    
    this.isReading = false;
    this.currentUtterance = null;
    this.readingQueue = [];
    
    document.dispatchEvent(new CustomEvent('speechStatusChanged', {
      detail: { isSpeaking: false }
    }));
  }

  processQueue() {
    if (this.readingQueue.length > 0 && !this.isReading) {
      const nextUtterance = this.readingQueue.shift();
      this.speechSynthesis.speak(nextUtterance);
    }
  }

  toggleReading() {
    if (this.isReading && this.currentUtterance) {
      if (this.speechSynthesis.paused) {
        this.speechSynthesis.resume();
        this.speak("Reluare citire", 'normal');
      } else {
        this.speechSynthesis.pause();
        this.speak("Pauză citire", 'normal');
      }
    } else {
      this.readCurrentPage();
    }
  }

  readCurrentPage() {
    const pageContent = this.extractPageContent();
    if (pageContent) {
      this.speak(pageContent, 'high');
    } else {
      this.speak("Nu există conținut de citit pe această pagină", 'high');
    }
  }

  extractPageContent() {
    let content = '';
    
    const title = document.querySelector('h1');
    if (title) {
      content += `Titlu: ${title.textContent.trim()}. `;
    }
    
    const description = document.querySelector('.page-description, .course-detail-description, .code-playground-description');
    if (description) {
      content += `${description.textContent.trim()}. `;
    }
    
    const mainContent = document.querySelector('main, .body-content, .course-detail-content');
    if (mainContent) {
      const paragraphs = mainContent.querySelectorAll('p, h2, h3, h4, li');
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text && text.length > 0) {
          content += `${text}. `;
        }
      });
    }
    
    const lessons = document.querySelectorAll('.course-preview-item, .lesson-title');
    if (lessons.length > 0) {
      content += 'Lecții disponibile: ';
      lessons.forEach((lesson, index) => {
        content += `${index + 1}. ${lesson.textContent.trim()}. `;
      });
    }
    
    const currentQuestion = document.querySelector('.question-container h3');
    if (currentQuestion) {
      content += `Întrebare: ${currentQuestion.textContent.trim()}. `;
      
      const options = document.querySelectorAll('.question-container li label');
      if (options.length > 0) {
        content += 'Opțiuni: ';
        options.forEach((option, index) => {
          content += `${index + 1}. ${option.textContent.trim()}. `;
        });
      }
    }
    
    return content.trim();
  }

  announce(message, priority = 'normal') {
    this.speak(message, priority);
  }

  get isSpeaking() {
    return this.isReading || this.speechSynthesis.speaking;
  }

  get isActive() {
    return this.isAccessibilityMode;
  }

  readQuizQuestion(question, options) {
    let text = `Întrebare: ${question}. `;
    if (options && options.length > 0) {
      text += 'Variantele de răspuns sunt: ';
      options.forEach((option, index) => {
        text += `${index + 1}: ${option}. `;
      });
    }
    this.speak(text, 'high');
  }

  announceQuizResult(score, totalQuestions) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const text = `Test finalizat! Ai răspuns corect la ${score} din ${totalQuestions} întrebări. ` +
                `Punctajul obținut este ${percentage} la sută. ` +
                (percentage >= 80 ? 'Felicitări! Rezultat excelent!' : 
                  percentage >= 60 ? 'Rezultat bun! Continuă să înveți.' : 
                  'Nu te descuraja! Încearcă din nou pentru un rezultat mai bun.');
    this.speak(text, 'high');
  }

  readCodeLine(lineNumber, content) {
    if (content) {
      this.speak(`Linia ${lineNumber}: ${content}`, 'normal');
    } else {
      this.speak(`Linia ${lineNumber}: linie goală`, 'normal');
    }
  }

  announceCodeChange(changeType, position) {
    if (changeType === 'insert') {
      this.speak("Text adăugat", 'normal');
    } else if (changeType === 'delete') {
      this.speak("Text șters", 'normal');
    }
  }

  // Obține conținutul Monaco editor-ului
  getMonacoContent(element) {
    try {
      if (window.monaco && window.monaco.editor) {
        const editors = window.monaco.editor.getEditors();
        const monacoContainer = element.closest('.monaco-editor') || element;
        const editor = editors.find(e => monacoContainer.contains(e.getDomNode()));
        if (editor) {
          return editor.getValue();
        }
      }
    } catch (e) {
      console.error('Error getting Monaco content:', e);
    }
    return null;
  }

  addAccessibilityStyles() {
    const style = document.createElement('style');
    style.id = 'accessibility-styles';
    style.textContent = `
      /* Focus indicator pentru elementul curent */
      .accessibility-focus {
        outline: 3px solid #ffff00 !important;
        outline-offset: 2px !important;
        background-color: rgba(255, 255, 0, 0.1) !important;
      }

      /* Linkuri mai vizibile */
      body.accessibility-mode a {
        color: #00ffff !important;
        text-decoration: underline !important;
        font-weight: bold !important;
      }
      
      /* Inputuri mai clare */
      body.accessibility-mode input,
      body.accessibility-mode textarea,
      body.accessibility-mode select {
        background: #111111 !important;
        color: #ffffff !important;
        border: 2px solid #ffffff !important;
        padding: 10px !important;
        font-size: 18px !important;
      }
      
      body.accessibility-mode input:focus,
      body.accessibility-mode textarea:focus,
      body.accessibility-mode select:focus {
        border-color: #ffff00 !important;
        outline: 2px solid #ffff00 !important;
      }
      
      /* Stil special pentru modul editare */
      body.accessibility-mode input.accessibility-edit-mode,
      body.accessibility-mode textarea.accessibility-edit-mode,
      body.accessibility-mode select.accessibility-edit-mode {
        border-color: #00ff00 !important;
        outline: 2px solid #00ff00 !important;
      }
      
      /* Simplificăm cardurile */
      body.accessibility-mode .course-card,
      body.accessibility-mode .feature-card,
      body.accessibility-mode .example-card {
        background: #111111 !important;
        border: 2px solid #ffffff !important;
        margin: 10px 0 !important;
        padding: 20px !important;
      }
      
      /* Eliminăm gradiente și efecte */
      body.accessibility-mode [class*="gradient"] {
        background: #000000 !important;
      }
      
      /* Indicator pentru elementul curent citit */
      .accessibility-reading {
        background-color: #333300 !important;
        outline: 2px dashed #ffff00 !important;
      }
      
      /* Simplificăm navigarea */
      body.accessibility-mode nav {
        background: #000000 !important;
        border: 2px solid #ffffff !important;
        padding: 10px !important;
      }
      
      /* Indicator pentru modul editare activ */
      body.accessibility-mode.editing::before {
        content: "MODUL EDITARE ACTIV";
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00ff00;
        color: #000000;
        padding: 10px 20px;
        font-weight: bold;
        z-index: 10001;
        border-radius: 5px;
      }
      
      /* Indicator special pentru Monaco */
      body.accessibility-mode.editing-monaco::before {
        content: "EDITOR DE COD ACTIV - ESCAPE PENTRU IEȘIRE";
        background: #0066ff;
      }
      
      /* Stiluri speciale pentru Monaco Editor în modul accesibilitate */
      body.accessibility-mode .monaco-editor {
        background: #111111 !important;
        border: 2px solid #ffffff !important;
      }
      
      body.accessibility-mode .monaco-editor.accessibility-focus {
        border-color: #ffff00 !important;
        outline: 2px solid #ffff00 !important;
      }
      
      body.accessibility-mode .monaco-editor .view-line {
        color: #ffffff !important;
      }
      
      body.accessibility-mode .monaco-editor .cursor {
        background: #ffff00 !important;
        width: 3px !important;
      }
      
      /* Prevenim interferența cu Monaco */
      body.accessibility-mode.editing-monaco * {
        pointer-events: auto !important;
      }
      
      /* FIXAT: Ascundem chenarul alb de pe pagina cu cursuri */
      body.accessibility-mode .accessibility-navigation-info {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        width: 1px !important;
        height: 1px !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('accessibility-mode');
    document.body.setAttribute('data-accessibility-active', 'true');
  }

  removeAccessibilityStyles() {
    const style = document.getElementById('accessibility-styles');
    if (style) style.remove();
    document.body.classList.remove('accessibility-mode', 'editing', 'editing-monaco');
    document.body.removeAttribute('data-accessibility-active');
    
    document.querySelectorAll('.accessibility-focus, .accessibility-reading, .accessibility-edit-mode').forEach(el => {
      el.classList.remove('accessibility-focus', 'accessibility-reading', 'accessibility-edit-mode');
    });
  }

  // METODĂ NOUĂ: Inițializare din sessionStorage
  initializeFromStorage() {
    const savedState = sessionStorage.getItem('accessibilityModeActive');
    if (savedState === 'true') {
      // Reactivăm modul de accesibilitate fără să anunțăm
      this.isAccessibilityMode = true;
      this.addAccessibilityStyles();
      this.updateFocusableElements();
      
      // FIXAT: Focusăm primul element relevant în loc să anunțăm generic
      setTimeout(() => {
        // Pentru pagina principală, focusăm pe login în loc de primul element
        if (window.location.pathname === '/' || window.location.pathname === '') {
          const loginButton = document.querySelector('a[href="/login"]');
          if (loginButton) {
            const focusableElements = Array.from(document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'))
              .filter(el => el.offsetParent !== null);
            
            const loginIndex = focusableElements.indexOf(loginButton);
            if (loginIndex !== -1) {
              this.currentFocusIndex = loginIndex;
              this.setFocus(loginButton);
            }
          }
        } else {
          this.speak("Modul pentru nevăzători este activ pe această pagină.", 'high');
        }
      }, 1000);
      
      document.dispatchEvent(new CustomEvent('accessibilityModeChanged', {
        detail: { isActive: true }
      }));
    }
  }

  // FUNCȚII PUBLICE PENTRU QUIZ CU TEXTUL RĂSPUNSURILOR
  announceQuizOptionSelected(optionIndex, optionText) {
    this.speak(`Ai selectat răspunsul ${optionIndex + 1}: ${optionText}`, 'high');
  }

  announceQuizCorrectAnswer(correctIndex, correctText) {
    this.speak(`Răspunsul corect era răspunsul ${correctIndex + 1}: ${correctText}`, 'high');
  }

  announceQuizIncorrectAnswer(selectedIndex, selectedText, correctIndex, correctText) {
    this.speak(`Răspuns incorect. Ai selectat răspunsul ${selectedIndex + 1}: ${selectedText}. Răspunsul corect era răspunsul ${correctIndex + 1}: ${correctText}`, 'high');
  }

  // FUNCȚII PENTRU PLAYGROUND CU ANUNȚURI PENTRU EXECUȚIE ȘI FEEDBACK
  announceCodeExecution() {
    this.speak("Se execută codul...", 'high');
  }

  announceExecutionResult(result, isError = false) {
    if (isError) {
      this.speak(`Eroare la execuție: ${result}`, 'high');
    } else {
      this.speak(`Execuție completată cu succes! Rezultatul este: ${result}`, 'high');
    }
  }

  announceFeedbackRequest() {
    this.speak("Se solicită feedback de la inteligența artificială...", 'high');
  }

  announceFeedbackReceived(feedback) {
    this.speak(`Feedback AI primit: ${feedback}`, 'high');
  }
}

// Exportăm o instanță singleton cu inițializare automată
const accessibilityManager = new AccessibilityManager();

// Inițializăm din storage la încărcarea paginii
document.addEventListener('DOMContentLoaded', () => {
  accessibilityManager.initializeFromStorage();
});

export default accessibilityManager;
