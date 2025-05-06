classList.add('cypress-disable-animations');
cy.contains('Appointments', { timeout: 10000 }).should('be.visible');
it('should match appointment list page snapshot', () => {

    cy.matchImageSnapshot('appointment-list-full-page');
it('should match appointment card snapshot', () => {

    cy.get('[data-testid="appointment-card"]')
      .first()

    .matchImageSnapshot('appointment-card');
it('should match appointment details modal snapshot', () => {

    cy.get('[data-testid="appointment-card"]')
      .first()
      .click();
    
    cy.get('[role="dialog"]')
      .should('be.visible')

    .matchImageSnapshot('appointment-details-modal');
it('should match appointment status filter dropdown snapshot', () => {
    cy.contains('Filter').click();

    cy.get('[data-testid="status-filter-dropdown"]')
      .should('be.visible')

    .matchImageSnapshot('appointment-status-filter');
