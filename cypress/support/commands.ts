/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Import cypress-visual-regression
import { addMatchImageSnapshotCommand } from 'cypress-visual-regression/dist/command';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in a user
       * @example cy.login('email@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<Element>;
      
      /**
       * Custom command to test AR viewer functionality
       * @example cy.testARViewer()
       */
      testARViewer(): Chainable<Element>;
      
      /**
       * Custom command to check if payment form is PCI compliant
       * @example cy.checkPCICompliance()
       */
      checkPCICompliance(): Chainable<Element>;
    }
  }
}

// Custom login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email"]').type(email);
  cy.get('[data-testid="password"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

// Custom AR viewer testing command
Cypress.Commands.add('testARViewer', () => {
  cy.get('[data-testid=three-ar-viewer]', { timeout: 10000 }).should('be.visible');
  cy.wait(2000); // Wait for AR viewer to initialize
  cy.get('[data-testid=performance-stats]').should('exist');
});

// Custom command to check PCI compliance of payment forms
Cypress.Commands.add('checkPCICompliance', () => {
  // Check that credit card fields are in an iframe (for PCI compliance)
  cy.get('iframe.stripe-card-element').should('be.visible');
  
  // Check form doesn't have autocomplete enabled
  cy.get('form[data-cy=payment-form]').should('have.attr', 'autocomplete', 'off');
  
  // Check that https is being used
  cy.location().should((loc) => {
    expect(loc.protocol).to.eq('https:');
  });
});

// Add the visual regression command
addMatchImageSnapshotCommand({
  failureThreshold: 0.03, // threshold for entire image
  failureThresholdType: 'percent', // percent of image or number of pixels
  customDiffConfig: { threshold: 0.1 }, // threshold for each pixel
  capture: 'viewport', // capture viewport or full page
});

// Add a custom tab command for accessibility testing
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  const focusableElements = 'a[href], button, input, [tabindex]:not([tabindex="-1"])';
  
  if (subject) {
    cy.wrap(subject).trigger('keydown', { keyCode: 9, which: 9 });
  } else {
    cy.focused().trigger('keydown', { keyCode: 9, which: 9 });
  }
  
  return cy.document().then(document => {
    const focusable = Array.from(document.querySelectorAll(focusableElements));
    const currentFocusIndex = focusable.indexOf(document.activeElement as Element);
    const nextIndex = currentFocusIndex + 1 < focusable.length ? currentFocusIndex + 1 : 0;
    
    if (focusable[nextIndex]) {
      (focusable[nextIndex] as HTMLElement).focus();
      return cy.wrap(focusable[nextIndex]);
    }
    return cy.wrap(document.body);
  });
});

export {}; 