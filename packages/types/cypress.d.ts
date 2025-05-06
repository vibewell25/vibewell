declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to test AR Viewer functionality
     * @example cy.testARViewer()
     */
    testARViewer(): Chainable<Element>;

    /**
     * Custom command to check PCI compliance of payment forms
     * @example cy.checkPCICompliance()
     */
    checkPCICompliance(): Chainable<Element>;
  }
}
