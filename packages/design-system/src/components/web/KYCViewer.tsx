/**
 * KYCViewer - Rodistaa Web KYC Document Viewer Component
 * Displays encrypted KYC documents with decrypt capability
 */

import React, { CSSProperties, useState } from 'react';
import { RCardWeb } from './RCardWeb';
import { RButtonWeb } from './RButtonWeb';
import { RModalWeb } from './RModalWeb';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface KYCDocument {
  id: string;
  type: 'aadhaar' | 'pan' | 'license' | 'rc' | 'other';
  encrypted: boolean;
  previewUrl?: string;
  decryptedData?: {
    name?: string;
    number?: string;
    dob?: string;
    address?: string;
    [key: string]: any;
  };
}

export interface KYCViewerProps {
  documents: KYCDocument[];
  canDecrypt?: boolean;
  onDecrypt?: (documentId: string) => Promise<void>;
  onViewDocument?: (documentId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const KYCViewer: React.FC<KYCViewerProps> = ({
  documents,
  canDecrypt = false,
  onDecrypt,
  onViewDocument,
  className = '',
  style,
}) => {
  const [decryptingId, setDecryptingId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null);

  const handleDecrypt = async (doc: KYCDocument) => {
    if (!onDecrypt) return;
    setDecryptingId(doc.id);
    try {
      await onDecrypt(doc.id);
    } finally {
      setDecryptingId(null);
    }
  };

  const getDocumentTypeLabel = (type: KYCDocument['type']): string => {
    const labels: Record<KYCDocument['type'], string> = {
      aadhaar: 'Aadhaar Card',
      pan: 'PAN Card',
      license: 'Driving License',
      rc: 'RC Document',
      other: 'Other Document',
    };
    return labels[type] || type;
  };

  const renderDocument = (doc: KYCDocument) => {
    const isDecrypting = decryptingId === doc.id;
    const isDecrypted = !!doc.decryptedData;

    return (
      <RCardWeb key={doc.id} style={{ marginBottom: `${RodistaaSpacing.md}px` }}>
        <div style={{ display: 'flex', gap: `${RodistaaSpacing.md}px` }}>
          {/* Document Preview */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
              backgroundColor: RodistaaColors.background.paper,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: doc.previewUrl || onViewDocument ? 'pointer' : 'default',
              border: `2px solid ${RodistaaColors.border.light}`,
            }}
            onClick={() => onViewDocument?.(doc.id)}
          >
            {doc.previewUrl ? (
              <img
                src={doc.previewUrl}
                alt={getDocumentTypeLabel(doc.type)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
                }}
              />
            ) : (
              <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.disabled, textAlign: 'center' }}>
                {doc.encrypted ? '🔒 Encrypted' : 'No Preview'}
              </div>
            )}
          </div>

          {/* Document Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.sm}px` }}>
            <div style={{ ...WebTextStyles.h4, color: RodistaaColors.text.primary }}>
              {getDocumentTypeLabel(doc.type)}
            </div>
            {doc.encrypted && (
              <div style={{ ...WebTextStyles.caption, color: RodistaaColors.warning.main }}>
                🔒 Encrypted - Decrypt to view details
              </div>
            )}
            {isDecrypted && doc.decryptedData && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${RodistaaSpacing.xs}px`,
                  padding: `${RodistaaSpacing.md}px`,
                  backgroundColor: RodistaaColors.success.light,
                  borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
                }}
              >
                {doc.decryptedData.name && (
                  <div>
                    <span style={{ ...WebTextStyles.caption, fontWeight: '600' }}>Name: </span>
                    <span style={{ ...WebTextStyles.bodySmall }}>{doc.decryptedData.name}</span>
                  </div>
                )}
                {doc.decryptedData.number && (
                  <div>
                    <span style={{ ...WebTextStyles.caption, fontWeight: '600' }}>Number: </span>
                    <span style={{ ...WebTextStyles.bodySmall }}>{doc.decryptedData.number}</span>
                  </div>
                )}
                {doc.decryptedData.dob && (
                  <div>
                    <span style={{ ...WebTextStyles.caption, fontWeight: '600' }}>DOB: </span>
                    <span style={{ ...WebTextStyles.bodySmall }}>{doc.decryptedData.dob}</span>
                  </div>
                )}
                {doc.decryptedData.address && (
                  <div>
                    <span style={{ ...WebTextStyles.caption, fontWeight: '600' }}>Address: </span>
                    <span style={{ ...WebTextStyles.bodySmall }}>{doc.decryptedData.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.sm}px` }}>
            {doc.encrypted && canDecrypt && !isDecrypted && (
              <RButtonWeb
                variant="primary"
                size="small"
                onClick={() => handleDecrypt(doc)}
                disabled={isDecrypting}
              >
                {isDecrypting ? 'Decrypting...' : 'Decrypt'}
              </RButtonWeb>
            )}
            {onViewDocument && (
              <RButtonWeb variant="secondary" size="small" onClick={() => onViewDocument(doc.id)}>
                View
              </RButtonWeb>
            )}
          </div>
        </div>
      </RCardWeb>
    );
  };

  return (
    <div className={className} style={style}>
      <RCardWeb>
        <div style={{ marginBottom: `${RodistaaSpacing.lg}px` }}>
          <h3 style={{ ...WebTextStyles.h3, marginBottom: `${RodistaaSpacing.sm}px` }}>
            KYC Documents
          </h3>
          <p style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.secondary }}>
            {canDecrypt
              ? 'KYC documents are encrypted. Click Decrypt to view details (requires KYC-admin role).'
              : 'KYC documents are encrypted for security. Contact admin for access.'}
          </p>
        </div>
        <div>{documents.map((doc) => renderDocument(doc))}</div>
      </RCardWeb>
    </div>
  );
};

export default KYCViewer;

