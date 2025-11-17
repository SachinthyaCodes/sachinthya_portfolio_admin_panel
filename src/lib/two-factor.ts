import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export class TwoFactorAuth {
  /**
   * Generate a new secret for TOTP
   */
  static generateSecret(email: string) {
    return speakeasy.generateSecret({
      issuer: process.env.TOTP_ISSUER || 'Sachinthya Portfolio Admin',
      name: `Admin (${email})`,
      length: 32
    });
  }

  /**
   * Generate QR code data URL for setup
   */
  static async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify TOTP token
   */
  static verifyToken(token: string, secret: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps (60 seconds tolerance)
      });
    } catch {
      return false;
    }
  }

  /**
   * Generate backup codes for recovery
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(inputCode: string, backupCodes: string[]): boolean {
    return backupCodes.includes(inputCode.toUpperCase());
  }

  /**
   * Remove used backup code from the list
   */
  static removeUsedBackupCode(usedCode: string, backupCodes: string[]): string[] {
    return backupCodes.filter(code => code !== usedCode.toUpperCase());
  }

  /**
   * Check if 2FA token is required (6 digits)
   */
  static isValidTokenFormat(token: string): boolean {
    return /^\d{6}$/.test(token);
  }

  /**
   * Check if backup code format is valid (8 alphanumeric characters)
   */
  static isValidBackupCodeFormat(code: string): boolean {
    return /^[A-Z0-9]{8}$/.test(code.toUpperCase());
  }
}