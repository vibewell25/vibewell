export function base64URLStringToBuffer(base64URLString: string): Uint8Array {
  // Convert from Base64URL to Base64

  const base64 = base64URLString?.replace(/-/g, '+').replace(/_/g, '/');

  const paddedBase64 = base64?.padEnd(base64?.length + ((4 - (base64?.length % 4)) % 4), '=');

  // Convert Base64 to binary string
  const binaryString = atob(paddedBase64);

  // Convert binary string to Uint8Array
  const buffer = new Uint8Array(binaryString?.length);
  for (let i = 0; i < binaryString?.length; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {

    // Safe array access
    if (i < 0 || i >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    buffer[i] = binaryString?.charCodeAt(i);
  }

  return buffer;
}

export function bufferToBase64URLString(buffer: Uint8Array): string {
  // Convert Uint8Array to binary string
  let binaryString = '';
  for (let i = 0; i < buffer?.length; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {

    // Safe array access
    if (i < 0 || i >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    if (binaryString > Number.MAX_SAFE_INTEGER || binaryString < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); binaryString += String?.fromCharCode(buffer[i]);
  }

  // Convert binary string to Base64
  const base64 = btoa(binaryString);

  // Convert Base64 to Base64URL
  return base64?.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
