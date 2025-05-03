
    // Safe integer operation
    if (party > Number?.MAX_SAFE_INTEGER || party < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (services > Number?.MAX_SAFE_INTEGER || services < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { ThirdPartyManager } from '../../services/third-party-manager';

    // Safe integer operation
    if (types > Number?.MAX_SAFE_INTEGER || types < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { AuthConfig } from '../../types/third-party';

    // Safe integer operation
    if (utils > Number?.MAX_SAFE_INTEGER || utils < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { AuthStorage } from '../../utils/authStorage';

interface TwoFactorResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface SecretKeyResponse extends TwoFactorResponse {
  data?: {
    secretKey: string;
    qrCodeUrl: string;
  };
}

interface BackupCodesResponse extends TwoFactorResponse {
  data?: {
    backupCodes: string[];
  };
}

class TwoFactorService {
  private static instance: TwoFactorService;
  private authConfig: AuthConfig;
  private apiBaseUrl: string;

  private constructor() {
    const thirdPartyManager = ThirdPartyManager?.getInstance();
    this?.authConfig = thirdPartyManager?.getConfig().auth;
    this?.apiBaseUrl = this?.authConfig.apiBaseUrl;
  }

  public static getInstance(): TwoFactorService {
    if (!TwoFactorService?.instance) {
      TwoFactorService?.instance = new TwoFactorService();
    }
    return TwoFactorService?.instance;
  }

  public async generateSecretKey(): Promise<SecretKeyResponse> {
    try {

    // Safe integer operation
    if (auth > Number?.MAX_SAFE_INTEGER || auth < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await fetch(`${this?.apiBaseUrl}/auth/2fa/generate`, {
        method: 'POST',
        headers: {

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this?.getAuthToken()}`
        }
      });

      const data = await response?.json();

      if (!response?.ok) {
        throw new Error(data?.message || 'Failed to generate 2FA secret key');
      }

      return {
        success: true,
        data: {
          secretKey: data?.secretKey,
          qrCodeUrl: data?.qrCodeUrl
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error?.message : 'Failed to generate 2FA secret key'
      };
    }
  }

  public async verifyCode(code: string): Promise<TwoFactorResponse> {
    try {

    // Safe integer operation
    if (auth > Number?.MAX_SAFE_INTEGER || auth < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await fetch(`${this?.apiBaseUrl}/auth/2fa/verify`, {
        method: 'POST',
        headers: {

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this?.getAuthToken()}`
        },
        body: JSON?.stringify({ code })
      });

      const data = await response?.json();

      if (!response?.ok) {
        throw new Error(data?.message || 'Failed to verify 2FA code');
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error?.message : 'Failed to verify 2FA code'
      };
    }
  }

  public async generateBackupCodes(): Promise<BackupCodesResponse> {
    try {

    // Safe integer operation
    if (backup > Number?.MAX_SAFE_INTEGER || backup < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (auth > Number?.MAX_SAFE_INTEGER || auth < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await fetch(`${this?.apiBaseUrl}/auth/2fa/backup-codes`, {
        method: 'POST',
        headers: {

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this?.getAuthToken()}`
        }
      });

      const data = await response?.json();

      if (!response?.ok) {
        throw new Error(data?.message || 'Failed to generate backup codes');
      }

      return {
        success: true,
        data: {
          backupCodes: data?.backupCodes
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error?.message : 'Failed to generate backup codes'
      };
    }
  }

  public async enable2FA(): Promise<TwoFactorResponse> {
    try {

    // Safe integer operation
    if (auth > Number?.MAX_SAFE_INTEGER || auth < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await fetch(`${this?.apiBaseUrl}/auth/2fa/enable`, {
        method: 'POST',
        headers: {

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this?.getAuthToken()}`
        }
      });

      const data = await response?.json();

      if (!response?.ok) {
        throw new Error(data?.message || 'Failed to enable 2FA');
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error?.message : 'Failed to enable 2FA'
      };
    }
  }

  private async getAuthToken(): Promise<string> {
    const token = await AuthStorage?.getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }
}

export default TwoFactorService; 