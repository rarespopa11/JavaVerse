// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware pentru verificarea și validarea token-ului JWT
 * Acest middleware este folosit pentru a proteja rutele care necesită autentificare
 */
function authMiddleware(req, res, next) {
  // Verificăm dacă header-ul Authorization există
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Acces neautorizat. Token-ul lipsește.' 
    });
  }

  // Extragem token-ul din header
  const token = authHeader.split(' ')[1];
  
  try {
    // Verificăm și decodificăm token-ul
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adăugăm informațiile utilizatorului la obiectul request
    req.user = decoded;
    
    // Trecem la următorul middleware sau la handler-ul de rută
    next();
  } catch (error) {
    // Gestionăm diferite tipuri de erori
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token-ul a expirat. Te rugăm să te autentifici din nou.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalid. Te rugăm să te autentifici din nou.' 
      });
    }
    
    // Pentru orice alt tip de eroare
    return res.status(401).json({ 
      success: false, 
      message: 'Eroare de autentificare. Te rugăm să te autentifici din nou.' 
    });
  }
}

module.exports = authMiddleware;