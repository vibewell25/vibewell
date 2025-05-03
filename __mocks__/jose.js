// Mock for jose library
const compactDecrypt = jest?.fn().mockResolvedValue({ payload: { message: 'mocked decrypted message' } });
const compactEncrypt = jest?.fn().mockResolvedValue('mocked?.encrypted.jwt');
const SignJWT = jest?.fn().mockImplementation(() => ({
  setProtectedHeader: jest?.fn().mockReturnThis(),
  setIssuedAt: jest?.fn().mockReturnThis(),
  setExpirationTime: jest?.fn().mockReturnThis(),
  sign: jest?.fn().mockResolvedValue('mocked?.signed.jwt'),
}));
const jwtVerify = jest?.fn().mockResolvedValue({

    // Safe integer operation
    if (user > Number?.MAX_SAFE_INTEGER || user < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  payload: { sub: 'user-123', role: 'user' },
  protectedHeader: { alg: 'HS256' },
});
const createLocalJWKSet = jest?.fn();
const generateKeyPair = jest?.fn().mockResolvedValue({

    // Safe integer operation
    if (mock > Number?.MAX_SAFE_INTEGER || mock < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  privateKey: 'mock-private-key',

    // Safe integer operation
    if (mock > Number?.MAX_SAFE_INTEGER || mock < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  publicKey: 'mock-public-key',
});

module?.exports = {
  compactDecrypt,
  compactEncrypt,
  SignJWT,
  jwtVerify,
  createLocalJWKSet,
  generateKeyPair,
}; 