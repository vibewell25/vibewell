/**
 * Two-Factor Authentication (2FA) Implementation
 * 
 * This module provides 2FA functionality for the VibeWell platform using
 * TOTP (Time-based One-Time Password) standard (RFC 6238).
 */

import { prisma } from '@/lib/database/client';
import { authenticator } from 'otplib';
import { createHash, randomBytes } from 'crypto';
import { logger } from '@/lib/logger';
import { createClient } from '@supabase/supabase-js';

// Constants for TOTP configuration
const TOTP_WINDOW = 1; // Number of windows to check (⟹ 30 seconds)
const TOTP_DIGITS = 6; // Number of digits in the code
const TOTP_ALGORITHM = 'sha1'; // Algorithm to use
const APP_NAME = 'VibeWell'; // Name shown in authenticator apps

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configure OTP library
authenticator.options = {
  window: TOTP_WINDOW,
  digits: TOTP_DIGITS,
  algorithm: TOTP_ALGORITHM,
};

/**
 * Setup 2FA for a user by generating a secret and QR code
 * @param userId The user's ID
 * @param email The user's email (for display in authenticator app)
 */
export async function setup2FA(userId: string, email: string): Promise<{ 
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  success: boolean;
  error: string | null;
}> {
  try {
    // Check if 2FA is already enabled
    const { data: twoFactorData, error: checkError } = await supabase
      .from('two_factor')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!checkError && twoFactorData?.enabled) {
      return {
        secret: '',
        qrCodeUrl: '',
        backupCodes: [],
        success: false,
        error: '2FA is already enabled for this user'
      };
    }
    
    // Generate a new secret
    const secret = authenticator.generateSecret(32);
    
    // Generate a QR code URL for the authenticator app
    const serviceName = encodeURIComponent(APP_NAME);
    const accountName = encodeURIComponent(email);
    const qrCodeUrl = authenticator.keyuri(accountName, serviceName, secret);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    // Hash the backup codes before storing
    const hashedBackupCodes = backupCodes.map(code => hashCode(code));
    
    // Store the secret and backup codes in the database
    const { error } = await supabase
      .from('two_factor')
      .upsert({
        user_id: userId,
        secret,
        backup_codes: hashedBackupCodes,
        enabled: false, // Not enabled until verified
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      throw new Error(`Error storing 2FA data: ${error.message}`);
    }
    
    return {
      secret,
      qrCodeUrl,
      backupCodes,
      success: true,
      error: null
    };
  } catch (error) {
    logger.error('Error setting up 2FA', 'auth', { userId, error });
    return {
      secret: '',
      qrCodeUrl: '',
      backupCodes: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Verify and enable 2FA for a user
 * @param userId The user's ID
 * @param token The token provided by the user's authenticator app
 */
export async function verify2FA(userId: string, token: string): Promise<{ 
  success: boolean;
  error: string | null;
}> {
  try {
    // Get the user's 2FA data
    const { data: twoFactorData, error: getError } = await supabase
      .from('two_factor')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (getError || !twoFactorData) {
      return {
        success: false,
        error: '2FA setup not found for this user'
      };
    }
    
    // If already enabled, just verify the token
    if (twoFactorData.enabled) {
      return verifyToken(twoFactorData.secret, token);
    }
    
    // Verify the token against the secret
    const isValid = authenticator.verify({
      token,
      secret: twoFactorData.secret
    });
    
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid verification code'
      };
    }
    
    // Enable 2FA
    const { error: updateError } = await supabase
      .from('two_factor')
      .update({
        enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      throw new Error(`Error enabling 2FA: ${updateError.message}`);
    }
    
    // Log the event
    logger.info('2FA enabled for user', 'auth', { userId });
    
    return {
      success: true,
      error: null
    };
  } catch (error) {
    logger.error('Error verifying 2FA', 'auth', { userId, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Verify a token against the user's 2FA configuration
 * @param userId The user's ID
 * @param token The token provided by the user
 */
export async function verifyUserToken(userId: string, token: string): Promise<{ 
  success: boolean;
  error: string | null;
}> {
  try {
    // Get the user's 2FA data
    const { data: twoFactorData, error: getError } = await supabase
      .from('two_factor')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (getError || !twoFactorData) {
      return {
        success: false,
        error: '2FA not set up for this user'
      };
    }
    
    if (!twoFactorData.enabled) {
      return {
        success: false,
        error: '2FA is not enabled for this user'
      };
    }
    
    // Try to verify as a TOTP token
    const totpResult = verifyToken(twoFactorData.secret, token);
    if (totpResult.success) {
      return totpResult;
    }
    
    // If not a valid TOTP token, check if it's a backup code
    return await verifyBackupCode(userId, token);
  } catch (error) {
    logger.error('Error verifying user token', 'auth', { userId, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Disable 2FA for a user
 * @param userId The user's ID
 */
export async function disable2FA(userId: string): Promise<{ 
  success: boolean;
  error: string | null;
}> {
  try {
    // Delete the 2FA configuration
    const { error } = await supabase
      .from('two_factor')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(`Error disabling 2FA: ${error.message}`);
    }
    
    // Log the event
    logger.info('2FA disabled for user', 'auth', { userId });
    
    return {
      success: true,
      error: null
    };
  } catch (error) {
    logger.error('Error disabling 2FA', 'auth', { userId, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate new backup codes for a user
 * @param userId The user's ID
 */
export async function generateNewBackupCodes(userId: string): Promise<{ 
  backupCodes: string[];
  success: boolean;
  error: string | null;
}> {
  try {
    // Check if 2FA is enabled
    const { data: twoFactorData, error: checkError } = await supabase
      .from('two_factor')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (checkError || !twoFactorData) {
      return {
        backupCodes: [],
        success: false,
        error: '2FA not set up for this user'
      };
    }
    
    // Generate new backup codes
    const backupCodes = generateBackupCodes();
    
    // Hash the backup codes before storing
    const hashedBackupCodes = backupCodes.map(code => hashCode(code));
    
    // Update the backup codes
    const { error } = await supabase
      .from('two_factor')
      .update({
        backup_codes: hashedBackupCodes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(`Error updating backup codes: ${error.message}`);
    }
    
    // Log the event
    logger.info('New backup codes generated for user', 'auth', { userId });
    
    return {
      backupCodes,
      success: true,
      error: null
    };
  } catch (error) {
    logger.error('Error generating new backup codes', 'auth', { userId, error });
    return {
      backupCodes: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if 2FA is enabled for a user
 * @param userId The user's ID
 */
export async function is2FAEnabled(userId: string): Promise<{ 
  enabled: boolean;
  error: string | null;
}> {
  try {
    // Get the user's 2FA data
    const { data: twoFactorData, error: getError } = await supabase
      .from('two_factor')
      .select('enabled')
      .eq('user_id', userId)
      .single();
    
    if (getError) {
      if (getError.code === 'PGRST116') {
        // No record found, 2FA is not enabled
        return {
          enabled: false,
          error: null
        };
      }
      
      throw getError;
    }
    
    return {
      enabled: twoFactorData?.enabled || false,
      error: null
    };
  } catch (error) {
    logger.error('Error checking 2FA status', 'auth', { userId, error });
    return {
      enabled: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper Functions

/**
 * Generate random backup codes
 * @returns Array of backup codes
 */
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate a random 10-character code (5 bytes * 2 hex chars)
    const code = randomBytes(5).toString('hex').toUpperCase();
    
    // Insert a hyphen for readability
    const formattedCode = `${code.slice(0, 5)}-${code.slice(5)}`;
    
    codes.push(formattedCode);
  }
  
  return codes;
}

/**
 * Hash a backup code
 * @param code The backup code to hash
 * @returns The hashed code
 */
function hashCode(code: string): string {
  return createHash('sha256')
    .update(code.replace('-', '').toUpperCase())
    .digest('hex');
}

/**
 * Verify a token against a secret
 * @param secret The user's TOTP secret
 * @param token The token to verify
 */
function verifyToken(secret: string, token: string): { 
  success: boolean;
  error: string | null;
} {
  try {
    const isValid = authenticator.verify({
      token,
      secret
    });
    
    return {
      success: isValid,
      error: isValid ? null : 'Invalid verification code'
    };
  } catch (error) {
    logger.error('Error verifying token', 'auth', { error });
    return {
      success: false,
      error: 'Invalid verification code format'
    };
  }
}

/**
 * Verify a backup code
 * @param userId The user's ID
 * @param code The backup code to verify
 */
async function verifyBackupCode(userId: string, code: string): Promise<{ 
  success: boolean;
  error: string | null;
}> {
  try {
    // Format and hash the code for comparison
    const formattedCode = code.replace('-', '').toUpperCase();
    const hashedCode = hashCode(formattedCode);
    
    // Get the user's 2FA data
    const { data: twoFactorData, error: getError } = await supabase
      .from('two_factor')
      .select('backup_codes')
      .eq('user_id', userId)
      .single();
    
    if (getError || !twoFactorData) {
      return {
        success: false,
        error: '2FA not set up for this user'
      };
    }
    
    // Check if the hashed code is in the list of backup codes
    const backupCodes = twoFactorData.backup_codes || [];
    const codeIndex = backupCodes.indexOf(hashedCode);
    
    if (codeIndex === -1) {
      return {
        success: false,
        error: 'Invalid backup code'
      };
    }
    
    // Remove the used backup code
    backupCodes.splice(codeIndex, 1);
    
    // Update the backup codes in the database
    const { error: updateError } = await supabase
      .from('two_factor')
      .update({
        backup_codes: backupCodes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      throw new Error(`Error updating backup codes: ${updateError.message}`);
    }
    
    // Log the event
    logger.info('Backup code used for 2FA', 'auth', { userId });
    
    return {
      success: true,
      error: null
    };
  } catch (error) {
    logger.error('Error verifying backup code', 'auth', { userId, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 