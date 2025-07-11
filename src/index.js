import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Adaugă extensia .js
import './index.css';

// Creăm un root pentru aplicație
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rulăm aplicația pe root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);