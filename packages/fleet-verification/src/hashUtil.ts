/**
 * Hash Utilities
 * SHA256 hashing for chassis/engine numbers
 * Encryption stub for RC copy storage
 */

import { createHash } from 'crypto';

/**
 * Generate SHA256 hash of a string
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
 * Encrypt RC copy (stub - implement with actual encryption in production)
 * In production, use AES-256-GCM or similar
 */
export function encryptRCCopy(rcCopyBuffer: Buffer, key: string): string {
  // Stub implementation
  // In production: use crypto.createCipheriv with AES-256-GCM
  // For now, return base64 encoded (NOT secure - replace in production)
  return rcCopyBuffer.toString('base64');
}

/**
 * Decrypt RC copy (stub - implement with actual decryption in production)
 */
export function decryptRCCopy(encryptedData: string, key: string): Buffer {
  // Stub implementation
  // In production: use crypto.createDecipheriv with AES-256-GCM
  // For now, decode from base64 (NOT secure - replace in production)
  return Buffer.from(encryptedData, 'base64');
}

/**
 * Generate hash of RC copy file
 */
export function hashRCCopy(rcCopyBuffer: Buffer): string {
  return createHash('sha256').update(rcCopyBuffer).digest('hex');
}

