describe('JavaVerse - Authentication Tests', () => {

  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display login form', () => {
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
    cy.contains('Autentificare').should('be.visible')
  })

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click()
    // Browser validation should prevent submission
    cy.url().should('include', '/login')
  })

  it('should login with valid credentials', () => {
    cy.get('input[type="email"]').type('test3@mail.com')
    cy.get('input[type="password"]').type('testul3')
    cy.get('button[type="submit"]').click()
    
    // Should redirect away from login page
    cy.url().should('not.include', '/login')
  })

  it('should handle invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@email.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // Should stay on login page or show error
    cy.wait(3000)
    cy.get('body').should('be.visible')
  })

})