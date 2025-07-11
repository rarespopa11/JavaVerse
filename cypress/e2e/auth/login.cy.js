describe('Login JavaVerse', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('ar trebui să afișeze formularul de login', () => {
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button').contains(/login|autentific/i).should('be.visible')
  })

  it('ar trebui să facă login cu credentiale valide', () => {
    // Înlocuiește cu credentialele tale de test
    cy.get('input[type="email"]').type('test3@mail.com')
    cy.get('input[type="password"]').type('testul3')
    cy.get('button').contains(/login|autentific/i).click()
    
    // Verifică că a fost redirectat
    cy.url().should('not.include', '/login')
    cy.url().should('include', '/courses')
  })

  it('ar trebui să afișeze eroare pentru credentiale greșite', () => {
    cy.get('input[type="email"]').type('wrong@email.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button').contains(/login|autentific/i).click()
    
    // Verifică că apare mesajul de eroare
    cy.contains(/invalid|invalid|greșit|eroare/i).should('be.visible')
  })
})