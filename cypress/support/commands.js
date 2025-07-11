// cypress/support/commands.js

Cypress.Commands.add('loginUser', (email = 'test3@mail.com', password = 'testul3') => {
  cy.visit('/login')
  
  // Fill credentials
  cy.get('input[type="email"]').clear().type(email)
  cy.get('input[type="password"]').clear().type(password)
  
  // Press Enter to submit (works on most forms)
  cy.get('input[type="password"]').type('{enter}')
  
  // Wait for login to process
  cy.wait(3000)
})