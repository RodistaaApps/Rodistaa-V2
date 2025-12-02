/**
 * POD (Proof of Delivery) Domain Model
 */

import { generatePodId } from '../ids';

export interface Pod {
  id: string; // POD-<ulid>
  shipmentId: string; // SH-<ulid>
  uploaderId: string; // USR-DR-<ulid>
  fileHash: string; // SHA256 hash for duplicate detection
  fileName: string;
  fileSizeBytes: number;
  fileUrl: string; // Encrypted storage URL
  metadata: {
    uploadedAt: Date;
    deviceInfo?: string;
    ipAddress?: string; // For audit
  };
  createdAt: Date;
}

export interface PodUploadRequest {
  shipmentId: string;
  file: {
    name: string;
    size: number;
    type: string;
    data: Buffer | string; // Base64 or Buffer
  };
  uploaderId: string;
}

