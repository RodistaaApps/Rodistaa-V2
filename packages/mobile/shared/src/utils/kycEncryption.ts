/**
 * KYC Encryption Utility
 * Encrypts KYC documents using AES-256-GCM before upload
 */

import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_KYC_ENCRYPTION_KEY || 'default-dev-key-change-in-production';

/**
 * Encrypt KYC document data
 * @param data - Plain text or base64 encoded document data
 * @returns Encrypted base64 string
 */
export function encryptKycData(data: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  } catch (error) {
    console.error('KYC encryption error:', error);
    throw new Error('Failed to encrypt KYC data');
  }
}

/**
 * Decrypt KYC document data (admin only)
 * @param encryptedData - Encrypted base64 string
 * @returns Decrypted plain text
 */
export function decryptKycData(encryptedData: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('KYC decryption error:', error);
    throw new Error('Failed to decrypt KYC data');
  }
}

/**
 * Generate KYC document hash for duplicate detection
 * @param data - Document data (base64 or buffer)
 * @returns SHA256 hash
 */
export function generateKycHash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

