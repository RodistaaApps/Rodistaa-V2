/**
 * File Upload Service
 * Handles POD and inspection photo uploads with S3 presigned URLs
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

interface UploadConfig {
  bucket: string;
  region: string;
  expirationSeconds: number;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresAt: Date;
}

export class FileUploadService {
  private s3Client: S3Client;
  private config: UploadConfig;

  constructor(config: UploadConfig) {
    this.config = config;
    this.s3Client = new S3Client({ region: config.region });
  }

  /**
   * Generate presigned URL for POD upload
   */
  async generatePodUploadUrl(
    shipmentId: string,
    fileName: string,
    contentType: string
  ): Promise<PresignedUrlResponse> {
    const fileExtension = fileName.split('.').pop();
    const fileKey = `pods/${shipmentId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
      ContentType: contentType,
      Metadata: {
        shipmentId,
        uploadedAt: new Date().toISOString(),
        originalFileName: fileName,
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.config.expirationSeconds,
    });

    return {
      uploadUrl,
      fileKey,
      expiresAt: new Date(Date.now() + this.config.expirationSeconds * 1000),
    };
  }

  /**
   * Generate presigned URL for inspection photo upload
   */
  async generateInspectionPhotoUrl(
    truckId: string,
    fileName: string,
    contentType: string
  ): Promise<PresignedUrlResponse> {
    const fileExtension = fileName.split('.').pop();
    const fileKey = `inspections/${truckId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
      ContentType: contentType,
      Metadata: {
        truckId,
        uploadedAt: new Date().toISOString(),
        originalFileName: fileName,
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.config.expirationSeconds,
    });

    return {
      uploadUrl,
      fileKey,
      expiresAt: new Date(Date.now() + this.config.expirationSeconds * 1000),
    };
  }

  /**
   * Generate presigned URL for KYC document upload
   */
  async generateKycUploadUrl(
    userId: string,
    documentType: string,
    fileName: string,
    contentType: string
  ): Promise<PresignedUrlResponse> {
    const fileExtension = fileName.split('.').pop();
    const fileKey = `kyc/${userId}/${documentType}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
      ContentType: contentType,
      ServerSideEncryption: 'AES256', // Encrypt at rest
      Metadata: {
        userId,
        documentType,
        uploadedAt: new Date().toISOString(),
        originalFileName: fileName,
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.config.expirationSeconds,
    });

    return {
      uploadUrl,
      fileKey,
      expiresAt: new Date(Date.now() + this.config.expirationSeconds * 1000),
    };
  }

  /**
   * Generate presigned URL for downloading/viewing file
   */
  async generateDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: this.config.expirationSeconds,
    });
  }

  /**
   * Validate file before upload
   */
  validateFile(fileName: string, fileSize: number, contentType: string): { valid: boolean; error?: string } {
    // Max file size: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];

    if (!allowedTypes.includes(contentType)) {
      return { valid: false, error: 'File type not allowed. Use JPG, PNG, or PDF' };
    }

    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      return { valid: false, error: 'Invalid file extension' };
    }

    return { valid: true };
  }

  /**
   * Calculate file hash for duplicate detection
   */
  calculateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}

// Mock implementation for development
export class MockFileUploadService {
  async generatePodUploadUrl(shipmentId: string, fileName: string): Promise<PresignedUrlResponse> {
    return {
      uploadUrl: `http://localhost:3000/mock-upload/pod/${shipmentId}/${fileName}`,
      fileKey: `pods/${shipmentId}/${fileName}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  async generateInspectionPhotoUrl(truckId: string, fileName: string): Promise<PresignedUrlResponse> {
    return {
      uploadUrl: `http://localhost:3000/mock-upload/inspection/${truckId}/${fileName}`,
      fileKey: `inspections/${truckId}/${fileName}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  async generateKycUploadUrl(userId: string, documentType: string, fileName: string): Promise<PresignedUrlResponse> {
    return {
      uploadUrl: `http://localhost:3000/mock-upload/kyc/${userId}/${documentType}/${fileName}`,
      fileKey: `kyc/${userId}/${documentType}/${fileName}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  async generateDownloadUrl(fileKey: string): Promise<string> {
    return `http://localhost:3000/mock-download/${fileKey}`;
  }

  validateFile(_fileName: string, _fileSize: number, _contentType: string) {
    return { valid: true };
  }

  calculateFileHash(_buffer: Buffer): string {
    return 'mock-hash-' + Date.now();
  }
}

// Factory
export function createFileUploadService(): FileUploadService | MockFileUploadService {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMock = process.env.USE_MOCK_UPLOAD === 'true';

  if (isProduction && !useMock) {
    return new FileUploadService({
      bucket: process.env.S3_BUCKET || 'rodistaa-uploads',
      region: process.env.AWS_REGION || 'ap-south-1',
      expirationSeconds: 15 * 60, // 15 minutes
    });
  }

  return new MockFileUploadService();
}

