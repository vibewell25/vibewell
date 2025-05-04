/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    dataCy(value: string): Chainable<Element>

    /**
     * Custom command to attach a file to an input
     * @example cy.get('input').attachFile(filePath: string): Chainable<Element>
     */
    attachFile(filePath: string): Chainable<Element>

    /**
     * Custom command to login with email and password
     * @example cy.login('test@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<Element>

    /**
     * Custom command to test AR viewer functionality
     * @example cy.testARViewer()
     */
    testARViewer(): Chainable<Element>

    /**
     * Custom command to check PCI compliance of payment forms
     * @example cy.checkPCICompliance()
     */
    checkPCICompliance(): Chainable<Element>
  }
} 