// Mock for jose library
const compactDecrypt = jest.fn().mockResolvedValue({ payload: { message: 'mocked decrypted message' } });
const compactEncrypt = jest.fn().mockResolvedValue('mocked.encrypted.jwt');
const SignJWT = jest.fn().mockImplementation(() => ({
  setProtectedHeader: jest.fn().mockReturnThis(),
  setIssuedAt: jest.fn().mockReturnThis(),
  setExpirationTime: jest.fn().mockReturnThis(),
  sign: jest.fn().mockResolvedValue('mocked.signed.jwt'),
}));
const jwtVerify = jest.fn().mockResolvedValue({
  payload: { sub: 'user-123', role: 'user' },
  protectedHeader: { alg: 'HS256' },
});
const createLocalJWKSet = jest.fn();
const generateKeyPair = jest.fn().mockResolvedValue({
  privateKey: 'mock-private-key',
  publicKey: 'mock-public-key',
});

module.exports = {
  compactDecrypt,
  compactEncrypt,
  SignJWT,
  jwtVerify,
  createLocalJWKSet,
  generateKeyPair,
}; 