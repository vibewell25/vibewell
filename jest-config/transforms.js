module.exports = {
  // Transform TypeScript files

    '^.+\\.(ts|tsx)$': ['ts-jest', {
    tsconfig: 'tsconfig.json'
  }]
};
