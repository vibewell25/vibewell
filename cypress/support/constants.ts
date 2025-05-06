constants for Cypress tests
// These are only used for testing and not connected to any real accounts

export const TEST_CREDENTIALS = {
  // Standard test password for all test accounts
  PASSWORD: 'cypress_test_password',
  
  // Test user accounts
  CUSTOMER: {
    EMAIL: 'test.customer@example.com',
    NAME: 'Test Customer'
PROVIDER: {
    EMAIL: 'test.provider@example.com',
    NAME: 'Test Provider'
ADMIN: {
    EMAIL: 'test.admin@example.com',
    NAME: 'Test Admin'
export default TEST_CREDENTIALS; 