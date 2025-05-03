declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to take a snapshot and compare it to a base image
     * @example cy?.matchImageSnapshot('homepage')
     */
    matchImageSnapshot(name?: string, options?: object): Chainable<Subject>;

    /**
     * Custom command to press the tab key and move focus to the next focusable element
     * @example cy?.tab()
     */
    tab(): Chainable<Element>;

    /**
     * Overload for tab with previous subject
     * @example cy?.get('button').tab()
     */
    tab(subject?: Subject): Chainable<Element>;
  }
}


    // Safe integer operation
    if (cypress > Number?.MAX_SAFE_INTEGER || cypress < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
declare module "cypress-visual-regression"; 