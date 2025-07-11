// server/routes/codeExecutionRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios'); // Folosim axios pentru cereri HTTP
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();

/**
 * Rută pentru testarea configurării
 */
router.get('/api/execute-code/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de execuție cod este configurat corect',
    jdoodleClientConfigured: !!process.env.JDOODLE_CLIENT_ID && !!process.env.JDOODLE_CLIENT_SECRET,
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

/**
 * Rută pentru executarea codului Java
 * Utilizează JDoodle API pentru compilare și execuție
 */
router.post('/api/execute-code', authMiddleware, async (req, res) => {
  const { code } = req.body;
  
  // Verificăm că am primit cod valid
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Codul lipsește sau este într-un format invalid'
    });
  }

  try {
    console.log('Executând codul Java prin JDoodle API...');
    
    // Pentru securitate, limitam dimensiunea codului
    if (code.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Codul depășește dimensiunea maximă permisă (10000 caractere)'
      });
    }

    // Log pentru debugging
    console.log('JDoodle Client ID: ' + process.env.JDOODLE_CLIENT_ID.substring(0, 5) + '...');
    console.log('Code Length: ' + code.length + ' characters');

    // Apelăm JDoodle API pentru compilare și execuție
    const response = await axios({
      method: 'post',
      url: 'https://api.jdoodle.com/v1/execute',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: code,
        language: 'java',
        versionIndex: '4' // Java SE 17 (versiune modernă)
      }
    });

    const jdoodleData = response.data;
    console.log('JDoodle API Response:', jdoodleData);
    
    // Verificăm dacă apelul către JDoodle a avut succes
    if (jdoodleData.error) {
      console.error('JDoodle API error:', jdoodleData.error);
      return res.status(500).json({
        success: false,
        error: 'Eroare la compilarea/executarea codului: ' + jdoodleData.error
      });
    }
    
    // Trimitem rezultatul către client
    res.json({
      success: true,
      output: jdoodleData.output,
      cpuTime: jdoodleData.cpuTime,
      memory: jdoodleData.memory,
      statusCode: jdoodleData.statusCode
    });
    
    // Înregistrăm execuția în baza de date pentru statistici
    try {
      await logCodeExecution(req.user.id, code, jdoodleData.statusCode === 200, jdoodleData.output);
    } catch (logError) {
      console.error('Error logging code execution:', logError);
      // Nu returnăm eroare către client dacă logarea eșuează
    }
    
  } catch (error) {
    console.error('Error executing code:', error.message);
    
    // Verificăm dacă eroarea este de la JDoodle API
    if (error.response && error.response.data) {
      console.error('JDoodle API error details:', error.response.data);
      return res.status(500).json({
        success: false,
        error: `Eroare de la serviciul de compilare: ${error.response.data.error || error.response.statusText}`
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Eroare la comunicarea cu serviciul de compilare/execuție: ' + error.message
    });
  }
});

/**
 * Rută pentru analiza codului cu AI
 * Utilizează OpenAI API pentru a oferi feedback
 */
router.post('/api/analyze-code', authMiddleware, async (req, res) => {
  const { code, lessonId } = req.body;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ 
      success: false, 
      message: 'Codul lipsește sau este într-un format invalid'
    });
  }

  try {
    console.log('Analizând codul cu OpenAI...');
    
    // Obținem informații despre lecție pentru context (dacă este furnizat lessonId)
    let lessonContext = '';
    
    if (lessonId) {
      try {
        const Course = require('mongoose').model('Course');
        const courses = await Course.find();
        
        // Căutăm lecția în toate cursurile
        for (const course of courses) {
          const lesson = course.content.find(l => l._id.toString() === lessonId);
          if (lesson) {
            lessonContext = `Lecția este despre: "${lesson.title}". `;
            break;
          }
        }
      } catch (lessonError) {
        console.error('Error fetching lesson data:', lessonError);
        // Continuăm chiar dacă nu putem obține informații despre lecție
      }
    }

    // Apelăm OpenAI API pentru analiză
    const openaiResponse = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      data: {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Ești un profesor de Java experimentat care analizează codul studenților și oferă feedback util și constructiv. ${lessonContext}Evidențiază punctele forte, identifică problemele și oferă sugestii concrete de îmbunătățire. Feedback-ul tău trebuie să fie structurat și formatat cu Markdown pentru o mai bună lizibilitate. Menține un ton încurajator și pozitiv.`
          },
          {
            role: "user",
            content: `Analizează următorul cod Java și oferă-mi feedback. Identifică erori, sugerează îmbunătățiri și menționează bunele practici:\n\n\`\`\`java\n${code}\n\`\`\``
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }
    });

    const aiData = openaiResponse.data;
    console.log('OpenAI Response Received');
    
    if (!aiData.choices || !aiData.choices.length) {
      console.error('OpenAI API error - no choices returned:', aiData);
      return res.status(500).json({ 
        success: false, 
        message: 'Eroare la generarea feedback-ului AI' 
      });
    }
    
    const feedback = aiData.choices[0]?.message?.content || "Nu am putut genera feedback pentru acest cod.";
    
    res.json({ success: true, feedback });
    
  } catch (error) {
    console.error('Error analyzing code:', error.message);
    
    // Verificăm dacă eroarea este de la OpenAI API
    if (error.response && error.response.data) {
      console.error('OpenAI API error details:', error.response.data);
      return res.status(500).json({ 
        success: false, 
        message: `Eroare de la serviciul AI: ${error.response.data.error?.message || error.response.statusText}` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la analizarea codului: ' + error.message 
    });
  }
});

/**
 * Funcție utilitară pentru înregistrarea execuțiilor de cod
 * Poate fi folosită pentru statistici și analiză
 */
async function logCodeExecution(userId, code, success, output) {
  try {
    // Presupunem că avem un model CodeExecution în aplicație
    const CodeExecution = require('mongoose').model('CodeExecution');
    
    await CodeExecution.create({
      userId,
      code,
      success,
      output,
      timestamp: new Date()
    });
    
    console.log(`Code execution logged for user ${userId}`);
  } catch (error) {
    console.error('Error saving code execution log:', error);
    // Nu aruncăm din nou eroarea, doar o înregistrăm
  }
}

module.exports = router;