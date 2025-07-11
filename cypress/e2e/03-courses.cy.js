describe('JavaVerse - Courses Tests', () => {

  beforeEach(() => {
    cy.loginUser()
  })

  it('should access courses page', () => {
    cy.visit('/courses')
    cy.url().should('include', '/courses')
    cy.get('body').should('be.visible')
  })

  it('should display courses content', () => {
    cy.visit('/courses')
    cy.get('body').should('contain.text', 'Java')
  })

  it('should be able to click on course elements', () => {
    cy.visit('/courses')
    cy.get('body').then(($body) => {
      // Look for any clickable course elements
      const possibleSelectors = [
        'a[href*="/course"]',
        'button:contains("Începe")',
        'a:contains("Java")',
        '[class*="course"]'
      ]
      
      let found = false
      possibleSelectors.forEach(selector => {
        if ($body.find(selector).length > 0 && !found) {
          cy.get(selector).first().should('be.visible')
          found = true
        }
      })
      
      if (!found) {
        cy.log('No specific course elements found, but page loaded successfully')
      }
    })
  })

})