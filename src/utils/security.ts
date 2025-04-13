/**
 * Security utilities for AR content in the Vibewell app
 * Provides data sanitization, validation, and security checks
 */

/**
 * Sanitizes AR model data to prevent security vulnerabilities
 * 
 * @param modelData - The raw model data
 * @returns Sanitized model data
 */
export function sanitizeARData(modelData: Uint8Array): Uint8Array {
  if (!modelData || modelData.length === 0) {
    throw new Error('Invalid model data');
  }

  // Check for minimum valid size for a glTF file
  if (modelData.length < 20) {
    throw new Error('Model data too small to be valid');
  }

  // Verify it's a valid glTF file by checking the magic bytes
  // glTF binary magic: "glTF"
  const magicGLB = new Uint8Array([0x67, 0x6C, 0x54, 0x46]);
  const headerMagic = modelData.slice(0, 4);

  let isValid = true;
  for (let i = 0; i < 4; i++) {
    if (headerMagic[i] !== magicGLB[i]) {
      isValid = false;
      break;
    }
  }

  if (!isValid) {
    // Not a binary glTF, check if it might be a JSON glTF
    const decoder = new TextDecoder('utf-8');
    const firstChars = decoder.decode(modelData.slice(0, 20));
    if (!firstChars.includes('{') || !firstChars.includes('"')) {
      throw new Error('Invalid model format');
    }
  }

  // For binary glTF files, verify the version
  if (isValid) {
    // Version is stored as a uint32 at bytes 4-8
    const version = new DataView(modelData.buffer).getUint32(4, true);
    if (version !== 2) {
      throw new Error('Unsupported glTF version');
    }
  }

  // Check for suspicious content in the model data
  // This is a basic check for common script injection patterns
  const suspiciousPatterns = [
    // JavaScript execution patterns
    new Uint8Array([0x3C, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74]), // "<script"
    new Uint8Array([0x6A, 0x61, 0x76, 0x61, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x3A]), // "javascript:"
    new Uint8Array([0x6F, 0x6E, 0x6C, 0x6F, 0x61, 0x64]), // "onload"
    
    // Potential URL redirects
    new Uint8Array([0x68, 0x74, 0x74, 0x70, 0x73, 0x3A, 0x2F, 0x2F]), // "https://"
    new Uint8Array([0x68, 0x74, 0x74, 0x70, 0x3A, 0x2F, 0x2F]), // "http://"
    
    // Custom script execution
    new Uint8Array([0x65, 0x76, 0x61, 0x6C, 0x28]) // "eval("
  ];

  // Check for suspicious patterns
  for (const pattern of suspiciousPatterns) {
    if (findPattern(modelData, pattern)) {
      throw new Error('Potentially harmful content found in model');
    }
  }
  
  // If all checks pass, return sanitized data
  // Additional sanitization steps could be added here based on specific needs
  return modelData;
}

/**
 * Validates AR model data against security policies
 * 
 * @param modelData - The model data
 * @param maxSize - Maximum allowed size in bytes
 * @param allowedFormats - List of allowed format identifiers
 * @returns Whether the model data passes security validation
 */
export function validateARModel(
  modelData: Uint8Array, 
  maxSize: number = 10 * 1024 * 1024, // 10MB default
  allowedFormats: string[] = ['glb', 'gltf']
): boolean {
  // Check size
  if (modelData.length > maxSize) {
    console.warn(`Model exceeds size limit: ${modelData.length} > ${maxSize}`);
    return false;
  }
  
  // Check format
  if (isGLB(modelData) && !allowedFormats.includes('glb')) {
    console.warn('GLB format not allowed');
    return false;
  }
  
  if (isGLTF(modelData) && !allowedFormats.includes('gltf')) {
    console.warn('GLTF format not allowed');
    return false;
  }
  
  // Additional validations can be added here
  
  return true;
}

/**
 * Check if data is a GLB (binary glTF) file
 */
function isGLB(data: Uint8Array): boolean {
  if (data.length < 12) return false;
  
  // GLB magic bytes: "glTF"
  const magic = [0x67, 0x6C, 0x54, 0x46];
  for (let i = 0; i < 4; i++) {
    if (data[i] !== magic[i]) return false;
  }
  
  return true;
}

/**
 * Check if data is a GLTF (JSON) file
 */
function isGLTF(data: Uint8Array): boolean {
  if (data.length < 20) return false;
  
  try {
    const decoder = new TextDecoder('utf-8');
    const jsonStart = decoder.decode(data.slice(0, 20));
    return jsonStart.trim().startsWith('{') && jsonStart.includes('asset');
  } catch (e) {
    return false;
  }
}

/**
 * Find a pattern in a Uint8Array
 * 
 * @param data - Data to search in
 * @param pattern - Pattern to find
 * @returns Whether the pattern was found
 */
function findPattern(data: Uint8Array, pattern: Uint8Array): boolean {
  if (pattern.length > data.length) return false;
  
  outer: for (let i = 0; i <= data.length - pattern.length; i++) {
    for (let j = 0; j < pattern.length; j++) {
      if (data[i + j] !== pattern[j]) {
        continue outer;
      }
    }
    return true;
  }
  
  return false;
}

/**
 * Check if an AR experience URL is from a trusted domain
 * 
 * @param url - URL to check
 * @param trustedDomains - List of trusted domains
 * @returns Whether the URL is from a trusted domain
 */
export function isTrustedARSource(url: string, trustedDomains: string[] = []): boolean {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Allow localhost and app domains 
    if (domain === 'localhost' || domain === 'vibewell.com') {
      return true;
    }
    
    // Check against trusted domains
    return trustedDomains.some(trusted => {
      // Exact match
      if (trusted === domain) return true;
      
      // Subdomain match (e.g. assets.vibewell.com matches *.vibewell.com)
      if (trusted.startsWith('*.') && domain.endsWith(trusted.slice(1))) {
        return true;
      }
      
      return false;
    });
  } catch (e) {
    // If URL parsing fails, consider it untrusted
    return false;
  }
} 