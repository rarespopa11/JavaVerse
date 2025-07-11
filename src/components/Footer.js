import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="jv-footer">
      <div className="jv-footer-container">
        <div className="jv-footer-grid">
          {/* Logo și descriere */}
          <div className="jv-footer-brand">
            <Link to="/" className="logo-link">
              <h2 className="text-gradient">JavaVerse</h2>
            </Link>
            <p>O platformă educațională modernă pentru învățarea limbajului Java, de la concepte de bază până la aplicații avansate.</p>
            {/* <div className="jv-footer-social">
              <a href="#" className="jv-social-link">
                <span>📱</span>
              </a>
              <a href="#" className="jv-social-link">
                <span>📷</span>
              </a>
              <a href="#" className="jv-social-link">
                <span>🐦</span>
              </a>
              <a href="#" className="jv-social-link">
                <span>🔗</span>
              </a>
            </div> */}
          </div>
          
          {/* Linkuri rapide
          <div className="jv-footer-links">
            <h3>Linkuri rapide</h3>
            <ul>
              <li><Link to="/">Acasă</Link></li>
              <li><Link to="/courses">Cursuri</Link></li>
              <li><Link to="/login">Autentificare</Link></li>
              <li><Link to="/register">Înregistrare</Link></li>
            </ul>
          </div> */}
          
          {/* Cursuri
          <div className="jv-footer-links">
            <h3>Cursuri</h3>
            <ul>
              <li><Link to="/courses">Introducere în Java</Link></li>
              <li><Link to="/courses">Programare Orientată pe Obiecte</Link></li>
              <li><Link to="/courses">Java pentru Aplicații Web</Link></li>
              <li><Link to="/courses">Java Avansată</Link></li>
            </ul>
          </div> */}
        </div>
        
        {/* Separator */}
        <div className="jv-footer-divider"></div>
        
        {/* Copyright */}
        <div className="jv-footer-bottom">
          <p>&copy; {currentYear} JavaVerse. Toate drepturile rezervate.</p>
          <div className="jv-footer-legal">
            <Link to="/terms">Termeni de utilizare</Link>
            <Link to="/privacy">Politica de confidențialitate</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;