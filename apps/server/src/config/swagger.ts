export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vibewell API',
      version: '1.0.0',
      description: 'API documentation for the Vibewell backend',
    },
  },

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  apis: ['./src/routes/*.ts'],
};
