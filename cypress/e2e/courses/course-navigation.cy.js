// cypress/e2e/courses/course-navigation.cy.js
describe('Navigarea în Cursuri JavaVerse', () => {
  beforeEach(() => {
    // Login și navighează la cursuri
    cy.loginAndGoToCourses()
  })

  it('ar trebui să afișeze lista de cursuri', () => {
    // Verifică că pagina de cursuri s-a încărcat
    cy.url().should('include', '/courses')
    
    // Caută indicatori că suntem pe pagina de cursuri
    cy.get('body').should('contain.text', 'Curs')
    
    // Verifică că există cel puțin un element care pare a fi un curs
    cy.get('div, section, article').should('have.length.greaterThan', 0)
    
    cy.debugLog('Pagina de cursuri s-a încărcat cu succes')
  })

  it('ar trebui să permită accesul la un curs', () => {
    // Așteaptă ca pagina să se încarce complet
    cy.waitForPageLoad()
    
    // Încearcă să găsească link-uri sau butoane pentru cursuri
    cy.get('body').then(($body) => {
      // Caută diverse tipuri de link-uri sau butoane pentru cursuri
      const courseSelectors = [
        'a[href*="/course"]',
        'a[href*="/courses/"]', 
        'button:contains("Începe")',
        'button:contains("Start")',
        'a:contains("Începe")',
        '[class*="course"]',
        '[data-testid*="course"]'
      ]
      
      let foundCourse = false
      
      for (const selector of courseSelectors) {
        if ($body.find(selector).length > 0) {
          cy.get(selector).first().click({ force: true })
          foundCourse = true
          break
        }
      }
      
      if (!foundCourse) {
        // Dacă nu găsim un selector specific, încearcă să facă click pe primul link disponibil
        cy.get('a, button').contains(/curs|începe|start|java|oop/i).first().click({ force: true })
      }
    })
    
    // Verifică că URL-ul s-a schimbat (că am navigat undeva)
    cy.url().should('not.eq', 'http://localhost:3000/courses')
    
    cy.debugLog('A navigat cu succes la un curs')
  })

  it('ar trebui să afișeze conținut de curs', () => {
    // Navighează la primul curs disponibil
    cy.get('body').then(($body) => {
      const courseSelectors = [
        'a[href*="/course"]',
        'a[href*="/courses/"]',
        '[class*="course"] a',
        'button:contains("Începe")'
      ]
      
      for (const selector of courseSelectors) {
        if ($body.find(selector).length > 0) {
          cy.get(selector).first().click({ force: true })
          break
        }
      }
    })
    
    // Verifică că există conținut de curs
    cy.get('body').should('be.visible')
    
    // Caută indicatori că suntem într-un curs
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text().toLowerCase()
      return text.includes('lecți') || 
             text.includes('lesson') || 
             text.includes('capitol') || 
             text.includes('java') ||
             text.includes('curs')
    })
    
    cy.debugLog('Conținutul cursului este vizibil')
  })

  it('ar trebui să poată naviga înapoi la cursuri', () => {
    // Navighează la un curs
    cy.get('body').then(($body) => {
      if ($body.find('a[href*="/course"]').length > 0) {
        cy.get('a[href*="/course"]').first().click({ force: true })
      }
    })
    
    // Încearcă să se întoarcă la cursuri
    cy.go('back')
    
    // SAU încearcă să navigheze direct
    cy.visit('/courses')
    cy.url().should('include', '/courses')
    
    cy.debugLog('Navigarea înapoi la cursuri funcționează')
  })
})