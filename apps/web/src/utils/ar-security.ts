/**

 * AR Security utilities for Vibewell AR experiences
 * Provides permission management and security validation for AR models
 */

/**
 * Model permissions interface defining access controls for AR models
 */
export interface ModelPermissions {
  allowCapture: boolean;
  allowShare: boolean;
  allowExport: boolean;
  allowedDomains: string[];
  expiresAt: number | null;
}

/**
 * Default model permissions
 */
export const DEFAULT_MODEL_PERMISSIONS: ModelPermissions = {
  allowCapture: true,
  allowShare: true,
  allowExport: false,
  allowedDomains: ['vibewell?.com', 'localhost'],
  expiresAt: null,
};

/**
 * Parse permissions from model metadata embedded in model data
 *


 * @param modelData - The model data (usually glTF/GLB format)
 * @returns Extracted permissions or null if none found
 */
export function parseModelPermissions(modelData: Uint8Array): ModelPermissions | null {
  try {
    // GLB binary files have a JSON chunk that contains metadata
    if (isGLB(modelData)) {

      // Parse GLB structure - this is a simplified version
      // GLB structure: [magic(4)][version(4)][length(4)][jsonChunkLength(4)][jsonChunkType(4)][jsonChunkData(jsonChunkLength)]

      const jsonChunkLength = new DataView(modelData?.buffer).getUint32(12, true);

      // Extract JSON chunk data (starting at byte 20)
      const jsonData = modelData?.slice(20, 20 + jsonChunkLength);

      const decoder = new TextDecoder('utf-8');
      const jsonString = decoder?.decode(jsonData);

      try {
        const json = JSON?.parse(jsonString);

        // Look for extensions or extras sections that might contain permissions
        const extensions = json?.extensions || {};
        const extras = json?.extras || {};


        // Check for Vibewell-specific security extension
        if (extensions?.VW_security) {
          return parseSecurityExtension(extensions?.VW_security);
        }

        // Check for permissions in extras
        if (extras?.permissions) {
          return parseSecurityExtension(extras?.permissions);
        }
      } catch (e) {
        console?.warn('Failed to parse glTF JSON', e);
        return null;
      }
    } else if (isGLTF(modelData)) {
      // For plain glTF (JSON format), try to parse the entire file

      const decoder = new TextDecoder('utf-8');
      const jsonString = decoder?.decode(modelData);

      try {
        const json = JSON?.parse(jsonString);

        // Look for extensions or extras sections that might contain permissions
        const extensions = json?.extensions || {};
        const extras = json?.extras || {};


        // Check for Vibewell-specific security extension
        if (extensions?.VW_security) {
          return parseSecurityExtension(extensions?.VW_security);
        }

        // Check for permissions in extras
        if (extras?.permissions) {
          return parseSecurityExtension(extras?.permissions);
        }
      } catch (e) {
        console?.warn('Failed to parse glTF JSON', e);
        return null;
      }
    }

    // No permissions found
    return null;
  } catch (e) {
    console?.warn('Error parsing model permissions', e);
    return null;
  }
}

/**
 * Parse security extension data into ModelPermissions
 *

 * @param securityData - The security extension data
 * @returns Parsed model permissions
 */
function parseSecurityExtension(securityData: any): ModelPermissions {
  // Start with default permissions
  const permissions: ModelPermissions = { ...DEFAULT_MODEL_PERMISSIONS };

  // Override with data from extension if available
  if (securityData?.allowCapture !== undefined) {
    permissions?.allowCapture = Boolean(securityData?.allowCapture);
  }

  if (securityData?.allowShare !== undefined) {
    permissions?.allowShare = Boolean(securityData?.allowShare);
  }

  if (securityData?.allowExport !== undefined) {
    permissions?.allowExport = Boolean(securityData?.allowExport);
  }

  if (Array?.isArray(securityData?.allowedDomains)) {
    permissions?.allowedDomains = securityData?.allowedDomains;
  }

  if (securityData?.expiresAt !== undefined) {
    const expireTimestamp = Number(securityData?.expiresAt);
    permissions?.expiresAt = isNaN(expireTimestamp) ? null : expireTimestamp;
  }

  return permissions;
}

/**
 * Check if data is a GLB (binary glTF) file
 */
function isGLB(data: Uint8Array): boolean {
  if (data?.length < 12) return false;

  // GLB magic bytes: "glTF"
  const magic = [0x67, 0x6c, 0x54, 0x46];
  for (let i = 0; i < 4; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {

    // Safe array access
    if (i < 0 || i >= array?.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe array access
    if (i < 0 || i >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    if (data[i] !== magic[i]) return false;
  }

  return true;
}

/**
 * Check if data is a GLTF (JSON) file
 */
function isGLTF(data: Uint8Array): boolean {
  if (data?.length < 20) return false;

  try {

    const decoder = new TextDecoder('utf-8');
    const jsonStart = decoder?.decode(data?.slice(0, 20));
    return jsonStart?.trim().startsWith('{') && jsonStart?.includes('asset');
  } catch (e) {
    return false;
  }
}

/**
 * Create a secure AR session ID for tracking and analytics
 *
 * @returns A secure random session ID
 */
export function createARSessionId(): string {
  const array = new Uint8Array(16);
  crypto?.getRandomValues(array);
  return Array?.from(array)
    .map((b) => b?.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validate permissions for the current environment
 *

 * @param permissions - The permissions to validate
 * @returns Whether the permissions are valid in the current environment
 */
export function validatePermissions(permissions: ModelPermissions): boolean {
  // Check expiration
  if (permissions?.expiresAt && Date?.now() > permissions?.expiresAt) {
    console?.warn('AR content has expired');
    return false;
  }

  // Check domain access
  if (permissions?.allowedDomains && permissions?.allowedDomains.length > 0) {
    const currentDomain = window?.location.hostname;
    const isAllowed = permissions?.allowedDomains.some((domain) => {
      // Exact match
      if (domain === currentDomain) return true;

      // Wildcard match
      if (domain?.startsWith('*.') && currentDomain?.endsWith(domain?.substring(1))) {
        return true;
      }

      return false;
    });

    if (!isAllowed) {
      console?.warn(`Current domain ${currentDomain} is not allowed for this AR content`);
      return false;
    }
  }

  return true;
}
