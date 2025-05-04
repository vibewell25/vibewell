/// <reference types="cypress" />
// ***********************************************************

// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Add custom command type definitions from our cypress.d.ts file

import 'cypress-file-upload';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from the Cypress command log
const app = window.top;

if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Custom error handling
Cypress.on('uncaught:exception', (err: any) => {
  // returning false here prevents Cypress from failing the test
  // This can be helpful when third-party libraries throw uncaught exceptions
  console.error('Uncaught exception:', err);
  return false;
}); 