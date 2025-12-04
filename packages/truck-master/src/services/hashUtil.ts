/**
 * Hash Utilities
 * SHA256 hashing for chassis/engine numbers
 * Encryption stub for RC copy storage
 */

import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Generate SHA256 hash
 */
export function sha256Hash(input: string): string {
  if (!input || input.trim() === '') {
    throw new Error('Input cannot be empty');
  }
  return createHash('sha256').update(input.trim().toUpperCase()).digest('hex');
}

/**
 * Hash chassis number
 */
export function hashChassis(chassisNumber: string): string {
  return sha256Hash(chassisNumber);
}

/**
 * Hash engine number
 */
export function hashEngine(engineNumber: string): string {
  return sha256Hash(engineNumber);
}

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }
  
  // Key must be 32 bytes for AES-256
  const keyHash = createHash('sha256').update(key).digest();
  return keyHash;
}

/**
 * Encrypt RC copy using AES-256-GCM
 */
export function encryptRCCopy(rcCopyBuffer: Buffer): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(rcCopyBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const tag = cipher.getAuthTag();
  
  // Combine: iv + tag + encrypted data
  const combined = Buffer.concat([iv, tag, encrypted]);
  
  return combined.toString('base64');
}

/**
 * Decrypt RC copy using AES-256-GCM
 */
export function decryptRCCopy(encryptedData: string): Buffer {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, 'base64');
  
  // Extract: iv (16 bytes) + tag (16 bytes) + encrypted data
  const iv = combined.slice(0, IV_LENGTH);
  const tag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.slice(IV_LENGTH + TAG_LENGTH);
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted;
}

/**
 * Generate hash of RC copy file
 */
export function hashRCCopy(rcCopyBuffer: Buffer): string {
  return createHash('sha256').update(rcCopyBuffer).digest('hex');
}

