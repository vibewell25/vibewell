declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to take a snapshot and compare it to a base image
     * @example cy.matchImageSnapshot('homepage')
     */
    matchImageSnapshot(name?: string, options?: object): Chainable<Subject>;

    /**
     * Custom command to press the tab key and move focus to the next focusable element
     * @example cy.tab()
     */
    tab(): Chainable<Element>;

    /**
     * Overload for tab with previous subject
     * @example cy.get('button').tab()
     */
    tab(subject?: Subject): Chainable<Element>;
declare module "cypress-visual-regression"; 