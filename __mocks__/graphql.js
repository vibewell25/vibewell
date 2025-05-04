// Mock GraphQL module
class GraphQLError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'GraphQLError';
    this.message = message;
    this.locations = options.locations || [];
    this.path = options.path || [];
    this.extensions = options.extensions || {};
    this.nodes = options.nodes || [];
    this.source = options.source || undefined;
    this.positions = options.positions || [];
    this.originalError = options.originalError;
  }
  
  toJSON() {
    return {
      message: this.message,
      locations: this.locations,
      path: this.path,
      extensions: this.extensions,
    };
  }
}

module.exports = {
  GraphQLError,
}; 