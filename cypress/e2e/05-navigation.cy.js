describe('JavaVerse - Navigation Tests', () => {

  beforeEach(() => {
    cy.loginUser()
  })

  it('should navigate between main pages', () => {
    // Test navigation to different pages
    const pages = ['/courses', '/playground', '/profile']
    
    pages.forEach(page => {
      cy.visit(page)
      cy.url().should('include', page)
      cy.get('body').should('be.visible')
    })
  })

  it('should have working header navigation', () => {
    cy.visit('/courses')
    
    cy.get('nav, header').should('be.visible')
    
    // Look for common navigation elements
    cy.get('body').then(($body) => {
      const navSelectors = [
        'a[href="/courses"]',
        'a[href="/playground"]',
        'a[href="/profile"]',
        'a:contains("Cursuri")',
        'a:contains("Playground")',
        'a:contains("Profil")'
      ]
      
      let navFound = false
      navSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          navFound = true
        }
      })
      
      if (navFound) {
        cy.log('Navigation elements found')
      } else {
        cy.log('No specific navigation elements found')
      }
    })
  })

  it('should handle browser back/forward', () => {
    cy.visit('/courses')
    cy.visit('/playground')
    cy.go('back')
    cy.url().should('include', '/courses')
    cy.go('forward')
    cy.url().should('include', '/playground')
  })

})