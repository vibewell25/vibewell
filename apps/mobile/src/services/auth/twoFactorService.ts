
    
    import { ThirdPartyManager } from '../../services/third-party-manager';

    import { AuthConfig } from '../../types/third-party';

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
    const thirdPartyManager = ThirdPartyManager.getInstance();
    this.authConfig = thirdPartyManager.getConfig().auth;
    this.apiBaseUrl = this.authConfig.apiBaseUrl;
  }

  public static getInstance(): TwoFactorService {
    if (!TwoFactorService.instance) {
      TwoFactorService.instance = new TwoFactorService();
    }
    return TwoFactorService.instance;
  }

  public async generateSecretKey(): Promise<SecretKeyResponse> {
    try {

          const response = await fetch(`${this.apiBaseUrl}/auth/2fa/generate`, {
        method: 'POST',
        headers: {

    
              'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate 2FA secret key');
      }

      return {
        success: true,
        data: {
          secretKey: data.secretKey,
          qrCodeUrl: data.qrCodeUrl
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate 2FA secret key'
      };
    }
  }

  public async verifyCode(code: string): Promise<TwoFactorResponse> {
    try {

          const response = await fetch(`${this.apiBaseUrl}/auth/2fa/verify`, {
        method: 'POST',
        headers: {

    
              'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify 2FA code');
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify 2FA code'
      };
    }
  }

  public async generateBackupCodes(): Promise<BackupCodesResponse> {
    try {

    
          const response = await fetch(`${this.apiBaseUrl}/auth/2fa/backup-codes`, {
        method: 'POST',
        headers: {

    
              'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate backup codes');
      }

      return {
        success: true,
        data: {
          backupCodes: data.backupCodes
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate backup codes'
      };
    }
  }

  public async enable2FA(): Promise<TwoFactorResponse> {
    try {

          const response = await fetch(`${this.apiBaseUrl}/auth/2fa/enable`, {
        method: 'POST',
        headers: {

    
              'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to enable 2FA');
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to enable 2FA'
      };
    }
  }

  private async getAuthToken(): Promise<string> {
    const token = await AuthStorage.getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }
}

export default TwoFactorService; 