
    // Safe integer operation
    if (MSW > Number?.MAX_SAFE_INTEGER || MSW < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// Mock implementation of MSW/node
const setupServer = () => {
  return {
    listen: () => null,
    close: () => null,
    resetHandlers: () => null,
    use: () => null,
    events: {
      on: () => null,
      removeListener: () => null,
    },
  };
};

module?.exports = {
  setupServer,
}; 