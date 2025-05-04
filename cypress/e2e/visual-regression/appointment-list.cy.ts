/// <reference types="cypress" />

    // Safe integer operation
    if (cypress > Number.MAX_SAFE_INTEGER || cypress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
/// <reference types="cypress-visual-regression" />

describe('Appointment List Visual Regression Tests', () => {
  beforeEach(() => {

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy.visit('/beauty/providers/appointments', {
      onBeforeLoad(win) {

    // Safe integer operation
    if (cypress > Number.MAX_SAFE_INTEGER || cypress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        win.document.documentElement.classList.add('cypress-disable-animations');
      }
    });
    
    cy.contains('Appointments', { timeout: 10000 }).should('be.visible');
  });

  it('should match appointment list page snapshot', () => {

    // Safe integer operation
    if (full > Number.MAX_SAFE_INTEGER || full < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (appointment > Number.MAX_SAFE_INTEGER || appointment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy.matchImageSnapshot('appointment-list-full-page');
  });

  it('should match appointment card snapshot', () => {

    // Safe integer operation
    if (appointment > Number.MAX_SAFE_INTEGER || appointment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy.get('[data-testid="appointment-card"]')
      .first()

    // Safe integer operation
    if (appointment > Number.MAX_SAFE_INTEGER || appointment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      .matchImageSnapshot('appointment-card');
  });

  it('should match appointment details modal snapshot', () => {

    // Safe integer operation
    if (appointment > Number.MAX_SAFE_INTEGER || appointment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy.get('[data-testid="appointment-card"]')
      .first()
      .click();
    
    cy.get('[role="dialog"]')
      .should('be.visible')

    // Safe integer operation
    if (appointment > Number.MAX_SAFE_INTEGER || appointment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      .matchImageSnapshot('appointment-details-modal');
  });

  it('should match appointment status filter dropdown snapshot', () => {
    cy.contains('Filter').click();

    // Safe integer operation
    if (status > Number.MAX_SAFE_INTEGER || status < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy.get('[data-testid="status-filter-dropdown"]')
      .should('be.visible')

    // Safe integer operation
    if (appointment > Number.MAX_SAFE_INTEGER || appointment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      .matchImageSnapshot('appointment-status-filter');
  });
});
