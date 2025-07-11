// src/components/AccessibleMainPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';
import '../styles/MainPage.css';

function AccessibleMainPage() {
  const navigate = useNavigate();
  const isAuthenticated = sessionStorage.getItem('authToken') ? true : false;
  
  const { 
    isAccessibilityMode, 
    useNavigationAccessibility,
    announceLoading 
  } = useAccessibility();
  
  const { announcePageLoad } = useNavigationAccessibility();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/courses');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAccessibilityMode) {
      announcePageLoad(
        'JavaVerse', 
        'Platforma pentru învățarea limbajului Java. Aici poți începe călătoria ta în programare.'
      );
    }
  }, [isAccessibilityMode, announcePageLoad]);

  // Listener pentru comenzile rapide de accesibilitate
  useEffect(() => {
    if (!isAccessibilityMode) return;

    const handleKeyPress = (e) => {
      if (!isAccessibilityMode) return;

      // Enter pentru începerea cursurilor
      if (e.key === 'Enter' && !isAuthenticated) {
        navigate('/register');
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAccessibilityMode, isAuthenticated, navigate]);

  useEffect(() => {
    const bannerElement = document.querySelector('.main-banner');
    if (!bannerElement) return;
    
    const existingElements = bannerElement.querySelectorAll('.planet, .asteroid, .twinkling-star, .code-snippet, .shooting-star');
    existingElements.forEach(el => el.remove());
    
    const cosmicDust = document.createElement('div');
    cosmicDust.classList.add('cosmic-dust');
    bannerElement.appendChild(cosmicDust);
    
    const planets = [
      { className: 'planet-1', zIndex: 5 },
      { className: 'planet-2', zIndex: 5 }
    ];
    
    planets.forEach(planetConfig => {
      const planet = document.createElement('div');
      planet.classList.add('planet', planetConfig.className);
      planet.style.zIndex = planetConfig.zIndex;
      bannerElement.appendChild(planet);
    });
    
    for (let i = 0; i < 12; i++) {
      const asteroid = document.createElement('div');
      asteroid.classList.add('asteroid');
      
      const size = Math.random() * 5 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 30;
      const duration = Math.random() * 10 + 20;
      
      asteroid.style.width = `${size}px`;
      asteroid.style.height = `${size}px`;
      asteroid.style.left = `${posX}%`;
      asteroid.style.top = `${posY}%`;
      asteroid.style.animationDelay = `${delay}s`;
      asteroid.style.animationDuration = `${duration}s`;
      
      bannerElement.appendChild(asteroid);
    }
    
    for (let i = 0; i < 30; i++) {
      const star = document.createElement('div');
      star.classList.add('twinkling-star');
      
      const size = Math.random() * 3 + 1;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 4;
      
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${posX}%`;
      star.style.top = `${posY}%`;
      star.style.animationDelay = `${delay}s`;
      
      bannerElement.appendChild(star);
    }
    
    for (let i = 0; i < 5; i++) {
      const shootingStar = document.createElement('div');
      shootingStar.classList.add('shooting-star');
      
      const posY = Math.random() * 70 + 10;
      const posX = Math.random() * 30;
      const width = Math.random() * 80 + 60;
      const delay = Math.random() * 15 + i * 5;
      const angle = Math.random() * 20 - 10;
      
      shootingStar.style.top = `${posY}%`;
      shootingStar.style.left = `${posX}%`;
      shootingStar.style.width = `${width}px`;
      shootingStar.style.animationDelay = `${delay}s`;
      shootingStar.style.transform = `rotate(${angle}deg)`;
      
      bannerElement.appendChild(shootingStar);
    }
    
    const javaCodeSnippets = [
      `public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, JavaVerse!");
  }
}`,
      `import java.util.ArrayList;

public class JavaFeatures {
  public void demo() {
    var list = new ArrayList<String>();
    list.add("Java");
    list.add("Programming");
    list.forEach(System.out::println);
  }
}`,
      `@FunctionalInterface
interface Greeting {
  void sayHello(String name);
}

class Lambda {
  public static void main(String[] args) {
    Greeting greeting = name -> 
      System.out.println("Hello " + name);
    greeting.sayHello("Student");
  }
}`,
      `try (var scanner = new Scanner(System.in)) {
  String input = scanner.nextLine();
  Optional.ofNullable(input)
    .filter(s -> !s.isEmpty())
    .ifPresentOrElse(
      s -> System.out.println("Input: " + s),
      () -> System.out.println("No input")
    );
}`
    ];
    
    javaCodeSnippets.forEach((snippet, index) => {
      const codeElement = document.createElement('pre');
      codeElement.classList.add('code-snippet');
      codeElement.textContent = snippet;
      
      let posX, posY, rotation, delay;
      
      switch(index) {
        case 0:
          posX = 75;
          posY = 70;
          rotation = -5;
          delay = 0;
          break;
        case 1:
          posX = 5;
          posY = 40;
          rotation = 5;
          delay = 7;
          break;
        case 2:
          posX = 65;
          posY = 20;
          rotation = -8;
          delay = 15;
          break;
        case 3:
          posX = 25;
          posY = 75;
          rotation = 3;
          delay = 22;
          break;
        default:
          posX = Math.random() * 70 + 10;
          posY = Math.random() * 70 + 10;
          rotation = Math.random() * 10 - 5;
          delay = Math.random() * 20;
      }
      
      codeElement.style.left = `${posX}%`;
      codeElement.style.top = `${posY}%`;
      codeElement.style.transform = `perspective(500px) rotateY(${rotation}deg)`;
      codeElement.style.animationDelay = `${delay}s`;
      
      bannerElement.appendChild(codeElement);
    });
    
    return () => {
      const elementsToRemove = bannerElement.querySelectorAll('.planet, .asteroid, .twinkling-star, .code-snippet, .shooting-star, .cosmic-dust');
      elementsToRemove.forEach(el => el.remove());
    };
  }, []);

  return (
    <section className="main-banner">
      {isAccessibilityMode && (
        <div className="accessibility-instructions" style={{ 
          position: 'absolute', 
          left: '-9999px',
          width: '1px',
          height: '1px' 
        }}>
          <p>
            Pagina principală JavaVerse. Platformă pentru învățarea limbajului Java cu cursuri interactive, 
            teste practice și editor de cod avansat. {!isAuthenticated && 'Apasă Enter pentru a începe.'}
          </p>
        </div>
      )}
      
      <div className="banner-content">
        <h1 className="animated-title">
          <span className="title-word">Învață</span>
          <span className="title-word">limbajul</span>
          <span className="title-word">Java</span>
          <span className="title-word">într-un mod interactiv!</span>
        </h1>
        
        {!isAuthenticated && (
          <div className="cta-container">
            <button 
              className="main-cta" 
              onClick={() => navigate('/register')}
              aria-label={isAccessibilityMode ? "Începe acum - înregistrează-te pentru a accesa cursurile" : undefined}
            >
              <span className="button-text">Începe acum</span>
              <span className="button-icon">→</span>
            </button>
          </div>
        )}
        
        <div className="feature-cards-container">
          <div 
            className="feature-card"
            role={isAccessibilityMode ? "region" : undefined}
            aria-label={isAccessibilityMode ? "Cursuri interactive" : undefined}
          >
            <div className="feature-icon-container courses-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="feature-content">
              <h3>Cursuri interactive</h3>
              <p>Lecții structurate și exemple practice</p>
            </div>
          </div>
          
          <div 
            className="feature-card"
            role={isAccessibilityMode ? "region" : undefined}
            aria-label={isAccessibilityMode ? "Teste practice" : undefined}
          >
            <div className="feature-icon-container tests-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="feature-content">
              <h3>Teste practice</h3>
              <p>Verifică-ți cunoștințele dobândite</p>
            </div>
          </div>
          
          <div 
            className="feature-card"
            role={isAccessibilityMode ? "region" : undefined}
            aria-label={isAccessibilityMode ? "Editor de cod" : undefined}
          >
            <div className="feature-icon-container editor-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="feature-content">
              <h3>Editor de cod</h3>
              <p>Scrie și rulează cod Java direct în browser</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AccessibleMainPage;