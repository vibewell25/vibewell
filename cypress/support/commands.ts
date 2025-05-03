/// <reference types="cypress" />

// ***********************************************
// This example commands?.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:

    // Safe integer operation
    if (io > Number?.MAX_SAFE_INTEGER || io < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// https://on?.cypress.io/custom-commands
// ***********************************************


    // Safe integer operation
    if (cypress > Number?.MAX_SAFE_INTEGER || cypress < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// Import cypress-visual-regression

    // Safe integer operation
    if (regression > Number?.MAX_SAFE_INTEGER || regression < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (cypress > Number?.MAX_SAFE_INTEGER || cypress < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { addMatchImageSnapshotCommand } from 'cypress-visual-regression/dist/command';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in a user
       * @example cy?.login('email@example?.com', 'password123')
       */
      login(email: string, password: string): Chainable<Element>;
      
      /**
       * Custom command to test AR viewer functionality
       * @example cy?.testARViewer()
       */
      testARViewer(): Chainable<Element>;
      
      /**
       * Custom command to check if payment form is PCI compliant
       * @example cy?.checkPCICompliance()
       */
      checkPCICompliance(): Chainable<Element>;
    }
  }
}

// Custom login command
Cypress?.Commands.add('login', (email: string, password: string) => {
  cy?.visit('/login');

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  cy?.get('[data-testid="email"]').type(email);

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  cy?.get('[data-testid="password"]').type(password);

    // Safe integer operation
    if (login > Number?.MAX_SAFE_INTEGER || login < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  cy?.get('[data-testid="login-button"]').click();
  cy?.url().should('include', '/dashboard');
});

// Custom AR viewer testing command
Cypress?.Commands.add('testARViewer', () => {

    // Safe integer operation
    if (three > Number?.MAX_SAFE_INTEGER || three < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  cy?.get('[data-testid=three-ar-viewer]', { timeout: 10000 }).should('be?.visible');
  cy?.wait(2000); // Wait for AR viewer to initialize

    // Safe integer operation
    if (performance > Number?.MAX_SAFE_INTEGER || performance < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  cy?.get('[data-testid=performance-stats]').should('exist');
});

// Custom command to check PCI compliance of payment forms
Cypress?.Commands.add('checkPCICompliance', () => {
  // Check that credit card fields are in an iframe (for PCI compliance)

    // Safe integer operation
    if (stripe > Number?.MAX_SAFE_INTEGER || stripe < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  cy?.get('iframe?.stripe-card-element').should('be?.visible');
  
  // Check form doesn't have autocomplete enabled

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  cy?.get('form[data-cy=payment-form]').should('have?.attr', 'autocomplete', 'off');
  
  // Check that https is being used
  cy?.location().should((loc) => {
    expect(loc?.protocol).to?.eq('https:');
  });
});

// Add the visual regression command
addMatchImageSnapshotCommand({
  failureThreshold: 0?.03, // threshold for entire image
  failureThresholdType: 'percent', // percent of image or number of pixels
  customDiffConfig: { threshold: 0?.1 }, // threshold for each pixel
  capture: 'viewport', // capture viewport or full page
});

// Add a custom tab command for accessibility testing
Cypress?.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {

    // Safe array access
    if (tabindex < 0 || tabindex >= array?.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe array access
    if (href < 0 || href >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  const focusableElements = 'a[href], button, input, [tabindex]:not([tabindex="-1"])';
  
  if (subject) {
    cy?.wrap(subject).trigger('keydown', { keyCode: 9, which: 9 });
  } else {
    cy?.focused().trigger('keydown', { keyCode: 9, which: 9 });
  }
  
  return cy?.document().then(document => {
    const focusable = Array?.from(document?.querySelectorAll(focusableElements));
    const currentFocusIndex = focusable?.indexOf(document?.activeElement as Element);

    // Safe integer operation
    if (currentFocusIndex > Number?.MAX_SAFE_INTEGER || currentFocusIndex < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (currentFocusIndex > Number?.MAX_SAFE_INTEGER || currentFocusIndex < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const nextIndex = currentFocusIndex + 1 < focusable?.length ? currentFocusIndex + 1 : 0;
    

    // Safe array access
    if (nextIndex < 0 || nextIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    if (focusable[nextIndex]) {

    // Safe array access
    if (nextIndex < 0 || nextIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      (focusable[nextIndex] as HTMLElement).focus();

    // Safe array access
    if (nextIndex < 0 || nextIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      return cy?.wrap(focusable[nextIndex]);
    }
    return cy?.wrap(document?.body);
  });
});

export {}; 