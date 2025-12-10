/**
 * Storage Service
 * MinIO/S3 adapter for file storage (inspection photos, POD PDFs)
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import logger from 'pino';

const log = logger({ name: 'storage-service' });

interface StorageConfig {
  endpoint: string;
  port: number;
  accessKey: string;
  secretKey: string;
  bucket: string;
  useSSL: boolean;
}

class StorageService {
  private s3Client: S3Client;
  private bucket: string;
  private config: StorageConfig;

  constructor() {
    this.config = {
      endpoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      accessKey: process.env.MINIO_ACCESS_KEY || 'rodistaa',
      secretKey: process.env.MINIO_SECRET_KEY || 'rodistaa123',
      bucket: process.env.MINIO_BUCKET || 'rodistaa-uploads',
      useSSL: process.env.MINIO_USE_SSL === 'true',
    };

    this.bucket = this.config.bucket;

    this.s3Client = new S3Client({
      endpoint: `http${this.config.useSSL ? 's' : ''}://${this.config.endpoint}:${this.config.port}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    });

    log.info({ endpoint: this.config.endpoint, bucket: this.bucket }, 'Storage service initialized');
  }

  /**
   * Upload file to storage
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folder: 'inspections' | 'pod' | 'kyc' | 'documents',
    contentType: string = 'application/octet-stream'
  ): Promise<{ url: string; key: string }> {
    const key = `${folder}/${this.generateUniqueKey(fileName)}`;
    
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      const url = await this.getFileUrl(key);

      log.info({ key, folder }, 'File uploaded successfully');

      return { url, key };
    } catch (error: any) {
      log.error({ error: error.message, key }, 'Failed to upload file');
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Get file URL (presigned URL for private files)
   */
  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error: any) {
      log.error({ error: error.message, key }, 'Failed to generate file URL');
      throw new Error(`Failed to generate file URL: ${error.message}`);
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      log.info({ key }, 'File deleted successfully');
    } catch (error: any) {
      log.error({ error: error.message, key }, 'Failed to delete file');
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Generate unique key for file
   */
  private generateUniqueKey(fileName: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = fileName.split('.').pop() || '';
    const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    return `${baseName}_${timestamp}_${random}.${extension}`;
  }
}

// Singleton instance
export const storageService = new StorageService();

