/**
 * MSW server setup for testing HTTP requests
 */
const { setupServer } = require('msw/node');
const handlers = require('./handlers');

// Set up MSW server with default handlers
const server = setupServer(...handlers);

module.exports = { server }; 