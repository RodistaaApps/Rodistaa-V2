/**
 * Hash and Encryption Utilities
 * SHA256 hashing for chassis/engine, AES-256-GCM encryption for RC copies
 */

import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'change-me-in-production-32-byte-key-required!!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Compute SHA256 hash
 */
export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Derive encryption key from ENCRYPTION_KEY
 */
function getKeyFromPassword(): Buffer {
  return crypto.scryptSync(ENCRYPTION_KEY, 'rodistaa-salt', 32);
}

/**
 * Encrypt data (AES-256-GCM)
 * Format: salt + iv + authTag + encryptedData
 */
export function encrypt(data: Buffer): Buffer {
  const key = getKeyFromPassword();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(data),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine: salt + iv + authTag + encrypted
  return Buffer.concat([salt, iv, authTag, encrypted]);
}

/**
 * Decrypt data (AES-256-GCM)
 */
export function decrypt(encryptedData: Buffer): Buffer {
  const key = getKeyFromPassword();
  
  const salt = encryptedData.slice(0, SALT_LENGTH);
  const iv = encryptedData.slice(SALT_LENGTH, TAG_POSITION);
  const authTag = encryptedData.slice(TAG_POSITION, ENCRYPTED_POSITION);
  const encrypted = encryptedData.slice(ENCRYPTED_POSITION);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
}

/**
 * Hash chassis or engine number
 */
export function hashChassisOrEngine(value: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error('Chassis/engine number cannot be empty');
  }
  return sha256Hex(value.trim().toUpperCase());
}

