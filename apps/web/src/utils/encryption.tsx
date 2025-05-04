/**
 * Encryption utilities for AR content in the Vibewell app
 * Uses Web Crypto API for secure encryption/decryption
 */

/**
 * Encrypts data using AES-GCM algorithm
 *
 * @param data - Data to encrypt as Uint8Array
 * @param key - Encryption key (will be derived from app secret if not provided)
 * @returns Encrypted data with IV prepended
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); encryptData(data: Uint8Array, key?: CryptoKey): Promise<Uint8Array> {
  // If no key is provided, derive from app secret
  if (!key) {
    key = await deriveKey();
  }

  // Generate a random initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data,
  );

  // Combine IV and encrypted data
  const result = new Uint8Array(iv.length + encryptedData.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encryptedData), iv.length);

  return result;
}

/**
 * Decrypts data using AES-GCM algorithm
 *
 * @param encryptedData - Encrypted data with IV prepended
 * @param key - Decryption key (will be derived from app secret if not provided)
 * @returns Decrypted data
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); decryptData(encryptedData: Uint8Array, key?: CryptoKey): Promise<Uint8Array> {
  // If no key is provided, derive from app secret
  if (!key) {
    key = await deriveKey();
  }

  // Extract the IV (first 12 bytes)
  const iv = encryptedData.slice(0, 12);

  // Extract the encrypted data (rest of the bytes)
  const data = encryptedData.slice(12);

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data,
  );

  return new Uint8Array(decryptedData);
}

/**
 * Derive an encryption key from the app secret
 *
 * @returns Derived crypto key
 * @throws Error if encryption key is not configured
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); deriveKey(): Promise<CryptoKey> {
  // Get the encryption key from environment variables
  const appSecret = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

  // Throw error if encryption key is not provided
  if (!appSecret) {
    throw new Error(
      'Encryption key not configured. Set NEXT_PUBLIC_ENCRYPTION_KEY environment variable.',
    );
  }

  // Convert the secret to bytes
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(appSecret);

  // Import the secret as a key
  const importedKey = await crypto.subtle.importKey('raw', secretBytes, { name: 'PBKDF2' }, false, [
    'deriveKey',
  ]);

  // Generate a salt from environment or use a computed value
  const saltBase = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || appSecret.substring(0, 8);
  const salt = encoder.encode(saltBase);

  // Derive the actual encryption key
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Hash data for integrity verification
 *
 * @param data - Data to hash
 * @returns SHA-256 hash of the data
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); hashData(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify data integrity by comparing hash
 *
 * @param data - Data to verify
 * @param expectedHash - Expected hash
 * @returns Whether the data matches the expected hash
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); verifyDataIntegrity(
  data: Uint8Array,
  expectedHash: string,
): Promise<boolean> {
  const actualHash = await hashData(data);
  return actualHash === expectedHash;
}
