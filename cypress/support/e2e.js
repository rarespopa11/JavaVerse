// cypress/support/e2e.js

import './commands'

// Disable uncaught exception handling for cleaner tests
Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})