// Mock for coinbaseWallet connector
const coinbaseWallet = jest.fn().mockImplementation(() => ({}));

module.exports = {
  coinbaseWallet
}; 