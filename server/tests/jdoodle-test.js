// Script de test pentru integrarea JDoodle
// Creează un fișier jdoodle-test.js cu acest conținut

require('dotenv').config();
const axios = require('axios');

async function testJDoodleIntegration() {
  console.log('Testare integrare JDoodle API...');
  
  // Codul Java de test
  const javaCode = `
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, JavaVerse!");
    System.out.println("Testare integrare JDoodle reușită!");
  }
}
  `;
  
  try {
    console.log('Client ID: ' + process.env.JDOODLE_CLIENT_ID);
    console.log('Client Secret: ' + process.env.JDOODLE_CLIENT_SECRET.substring(0, 5) + '...');
    
    const response = await axios({
      method: 'post',
      url: 'https://api.jdoodle.com/v1/execute',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: javaCode,
        language: 'java',
        versionIndex: '4' // Java SE 17
      }
    });
    
    console.log('JDoodle API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.output) {
      console.log('\nTest reușit! Outputul codului:');
      console.log(response.data.output);
    } else {
      console.log('\nTest eșuat! Nu s-a primit output.');
    }
    
  } catch (error) {
    console.error('Eroare la testarea JDoodle API:');
    
    if (error.response) {
      // Eroare de la server
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // Nu s-a primit niciun răspuns
      console.error('Nu s-a primit niciun răspuns de la server');
    } else {
      // Eroare la configurarea cererii
      console.error('Error message:', error.message);
    }
  }
}

// Rulăm testul
testJDoodleIntegration();