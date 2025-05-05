classList.add('cypress-disable-animations');
// Wait for initial content to load
    cy.contains('Beauty Services', { timeout: 10000 }).should('be.visible');
it('should match beauty product catalog page snapshot', () => {
    // Take screenshot of the entire product catalog page

    cy.matchImageSnapshot('beauty-catalog-full-page');
it('should match beauty category selection snapshot', () => {
    // Take screenshot of just the category filters

    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6.mb-12')

    .matchImageSnapshot('beauty-category-selection');
it('should match beauty product card rendering snapshot', () => {
    // Take screenshot of the first product card

    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')
      .find('.card')
      .first()

    .matchImageSnapshot('beauty-product-card');
it('should match beauty product card hover state snapshot', () => {
    // Hover over the first product card and take a screenshot

    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')
      .find('.card')
      .first()
      .trigger('mouseover')

    .matchImageSnapshot('beauty-product-card-hover');
describe('Virtual Try-On Visual Regression Tests', () => {
  beforeEach(() => {

    // Visit the virtual try-on page

    cy.visit('/virtual-try-on', {
      onBeforeLoad(win) {

    win.document.documentElement.classList.add('cypress-disable-animations');
// Wait for content to load

    cy.contains('Virtual Try-On', { timeout: 10000 }).should('be.visible');
it('should match virtual try-on interface snapshot', () => {

    // Take screenshot of the entire virtual try-on interface

    cy.matchImageSnapshot('virtual-try-on-interface');
it('should match product selection grid snapshot', () => {
    // Take screenshot of just the product selection grid

    cy.get('[aria-labelledby="product-selection"]')

    .matchImageSnapshot('virtual-try-on-product-grid');
it('should match color selector snapshot', () => {
    // Select a product first

    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .first()
      .click();
      
    // Wait for color selector to appear and take screenshot

    cy.get('.color-selector')
      .should('be.visible')

    .matchImageSnapshot('virtual-try-on-color-selector');
it('should match product details snapshot', () => {
    // Select a product first

    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .first()
      .click();
      
    // Wait for product details to appear and take screenshot

    cy.get('.product-details')
      .should('be.visible')

    .matchImageSnapshot('virtual-try-on-product-details');
describe('Beauty Color Contrast Visual Tests', () => {
  it('should pass color contrast in different themes', () => {
    // Test light theme
    cy.visit('/beauty', {
      onBeforeLoad(win) {

    win.document.documentElement.classList.add('cypress-disable-animations');
        win.localStorage.setItem('theme', 'light');
// Wait for page to load and take screenshot
    cy.contains('Beauty Services', { timeout: 10000 }).should('be.visible');

    cy.matchImageSnapshot('beauty-light-theme');
    
    // Test dark theme
    cy.visit('/beauty', {
      onBeforeLoad(win) {

    win.document.documentElement.classList.add('cypress-disable-animations');
        win.localStorage.setItem('theme', 'dark');
// Wait for page to load and take screenshot
    cy.contains('Beauty Services', { timeout: 10000 }).should('be.visible');

    cy.matchImageSnapshot('beauty-dark-theme');
    
    // Test high contrast theme for accessibility
    cy.visit('/beauty', {
      onBeforeLoad(win) {

    win.document.documentElement.classList.add('cypress-disable-animations');
        win.localStorage.setItem('theme', 'light');

    win.document.documentElement.classList.add('high-contrast');
// Wait for page to load and take screenshot
    cy.contains('Beauty Services', { timeout: 10000 }).should('be.visible');

    cy.matchImageSnapshot('beauty-high-contrast-theme');
