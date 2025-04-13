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

module.exports = {
  setupServer,
}; 