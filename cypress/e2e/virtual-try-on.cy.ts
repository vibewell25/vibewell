const startTime = Date.now();

    cy.get('[data-testid="loader"]').should('not.exist', { timeout: 10000 }).then(() => {
      const firstLoadTime = Date.now() - startTime;
      
      // Reload page
      cy.reload();
      
      // Select the same model again
      cy.contains('button', 'Lipstick').click();
      
      // Wait for second load and compare times
      const secondStartTime = Date.now();

    cy.get('[data-testid="loader"]').should('not.exist', { timeout: 10000 }).then(() => {
        const secondLoadTime = Date.now() - secondStartTime;
        
        // Assert that second load is faster due to caching
        expect(secondLoadTime).to.be.lessThan(firstLoadTime);
