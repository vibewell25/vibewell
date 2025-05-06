/**
 * WebAuthn authentication module
 * This provides WebAuthn (FIDO2) biometric/hardware authentication functionality
 */

/**
 * Represents WebAuthn credential data
 */
export interface WebAuthnCredential {
  id: string;
  publicKey: string;
  counter: number;
}

/**
 * WebAuthn registration options
 */
export interface RegistrationOptions {
  username: string;
  displayName: string;
  attestation?: 'direct' | 'indirect' | 'none';
}

/**
 * WebAuthn authentication options
 */
export interface AuthenticationOptions {
  username: string;
  userVerification?: 'required' | 'preferred' | 'discouraged';
}

/**
 * WebAuthn registration options return type
 */
export interface WebAuthnRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  timeout: number;
  attestation: 'direct' | 'indirect' | 'none';
}

/**
 * WebAuthn authentication options return type
 */
export interface WebAuthnAuthenticationOptions {
  challenge: string;
  rpId: string;
  allowCredentials: Array<{
    type: string;
    id: string;
  }>;
  timeout: number;
  userVerification: 'required' | 'preferred' | 'discouraged';
}

/**
 * WebAuthn response interface
 */
export interface WebAuthnResponse {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject?: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string;
  };
  type: string;
  clientExtensionResults: Record<string, unknown>;
}

/**
 * Generates registration options for WebAuthn
 */
export function generateRegistrationOptions(options: RegistrationOptions): WebAuthnRegistrationOptions {
  // In a real implementation, this would generate proper WebAuthn registration options
  return {
    challenge: Buffer.from('random-challenge').toString('base64'),
    rp: { name: 'Vibewell', id: 'vibewell.example.com' },
    user: {
      id: Buffer.from(options.username).toString('base64'),
      name: options.username,
      displayName: options.displayName
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 }, // ES256
      { type: 'public-key', alg: -257 } // RS256
    ],
    timeout: 60000,
    attestation: options.attestation || 'none'
  };
}

/**
 * Verifies a WebAuthn registration response
 */
export function verifyRegistration(response: WebAuthnResponse): WebAuthnCredential {
  // In a real implementation, this would verify the attestation
  // For testing, we'll just return a mock credential
  console.log(`Verifying registration for credential ID: ${response.id}`);
  
  return {
    id: 'credential-id-123',
    publicKey: 'mock-public-key',
    counter: 0
  };
}

/**
 * Generates authentication options for WebAuthn
 */
export function generateAuthenticationOptions(options: AuthenticationOptions): WebAuthnAuthenticationOptions {
  // In a real implementation, this would generate proper WebAuthn authentication options
  return {
    challenge: Buffer.from('random-challenge').toString('base64'),
    rpId: 'vibewell.example.com',
    allowCredentials: [{ type: 'public-key', id: 'credential-id-123' }],
    timeout: 60000,
    userVerification: options.userVerification || 'preferred'
  };
}

/**
 * Verifies a WebAuthn authentication response
 */
export function verifyAuthentication(response: WebAuthnResponse): boolean {
  // In a real implementation, this would verify the assertion
  // For testing, we'll just verify that response contains expected fields
  console.log(`Verifying authentication for credential ID: ${response.id}`);
  return !!response.id && !!response.type;
} 