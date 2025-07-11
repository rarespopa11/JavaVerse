// cypress/e2e/simple-test.cy.js

describe('Test Simplu JavaVerse', () => {
  
  it('Pagina principală se încarcă', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
    cy.logMessage('Pagina principală OK')
  })

  it('Pagina de login se încarcă', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.logMessage('Pagina de login OK')
  })

  it('Poate face login', () => {
    cy.simpleLogin()
    cy.url().should('not.include', '/login')
    cy.logMessage('Login OK')
  })

  it('Poate accesa pagina de cursuri', () => {
    cy.simpleLogin()
    cy.visit('/courses')
    cy.url().should('include', '/courses')
    cy.get('body').should('contain.text', 'Curs')
    cy.logMessage('Cursuri OK')
  })

  it('Poate accesa playground', () => {
    cy.simpleLogin()
    cy.visit('/playground')
    cy.url().should('include', '/playground')
    cy.get('body').should('be.visible')
    cy.logMessage('Playground OK')
  })

})