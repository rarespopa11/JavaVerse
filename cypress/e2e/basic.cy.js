describe('JavaVerse Basic Tests', () => {
  
  it('should load home page', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
  })

  it('should load login page', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button').contains('Autentificare').should('be.visible')
  })

  it('should login successfully', () => {
    cy.doLogin()
    cy.url().should('not.include', '/login')
  })

  it('should access courses page', () => {
    cy.doLogin()
    cy.visit('/courses')
    cy.url().should('include', '/courses')
  })

})