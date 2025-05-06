/**
 * Mock WebAuthnService for testing
 */
export class WebAuthnService {
  /**
   * Start registration process for a user
   */
  async startRegistration(user: any) {
    return {
      challenge: 'mock-challenge',
      rp: { id: 'localhost', name: 'Test App' },
      user: {
        id: user.id,
        name: user.email,
        displayName: user.email
      },
      pubKeyCredParams: [],
      timeout: 60000,
      attestation: 'direct'
    };
  }

  /**
   * Verify registration response
   */
  async verifyRegistration(response: any) {
    return {
      verified: true,
      credentialId: 'mock-credential-id',
      publicKey: 'mock-public-key'
    };
  }

  /**
   * Start authentication
   */
  async startAuthentication(user: any) {
    return {
      challenge: 'mock-challenge',
      allowCredentials: user.credentials?.map((cred: any) => ({
        id: cred.credentialId,
        type: 'public-key'
      })) || [],
      timeout: 60000
    };
  }

  /**
   * Verify authentication
   */
  async verifyAuthentication(response: any) {
    return {
      verified: true,
      credentialId: 'mock-credential-id'
    };
  }
} 