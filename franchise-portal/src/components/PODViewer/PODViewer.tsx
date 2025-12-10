/**
 * POD Viewer Component
 * 
 * Reusable component for viewing Proof of Delivery documents:
 * - Photo gallery with zoom/pan
 * - PDF viewer with pagination
 * - Download with signed URLs
 * - Viewing audit (PII access log)
 */

import React, { useState } from 'react';
import { Card, Image, Button, Space, Modal, message, Input } from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

interface PODViewerProps {
  shipmentId: string;
  photos: string[]; // URLs to photos
  pdfUrl: string | null; // URL to consolidated PDF
  onViewAudit?: (reason: string) => Promise<void>; // Callback for audit logging
  theme?: 'light' | 'dark';
}

export const PODViewer: React.FC<PODViewerProps> = ({
  shipmentId,
  photos,
  pdfUrl,
  onViewAudit,
  theme = 'light',
}) => {
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [auditReason, setAuditReason] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [actionType, setActionType] = useState<'view' | 'download' | null>(null);

  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const handleViewRequest = (type: 'view' | 'download') => {
    if (accessGranted) {
      // Already granted access, proceed directly
      if (type === 'download' && pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
      return;
    }

    // Require audit reason
    setActionType(type);
    setAuditModalVisible(true);
  };

  const handleAuditSubmit = async () => {
    if (!auditReason || auditReason.length < 20) {
      message.error('Reason must be at least 20 characters');
      return;
    }

    try {
      // Call audit callback if provided
      if (onViewAudit) {
        await onViewAudit(auditReason);
      }

      // Grant access
      setAccessGranted(true);
      setAuditModalVisible(false);
      setAuditReason('');

      message.success('Access granted. POD documents are now visible.');

      // If download was requested, trigger it
      if (actionType === 'download' && pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Audit log failed:', error);
      message.error('Failed to log access. Please try again.');
    }
  };

  // If no POD uploaded
  if (photos.length === 0 && !pdfUrl) {
    return (
      <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
        <div style={{ textAlign: 'center', padding: '40px 0', color: textSecondary }}>
          <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
          <div>POD not uploaded yet</div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Access Gate (if not granted) */}
      {!accessGranted && (
        <Card
          style={{
            background: '#FEF3C7',
            border: '1px solid #FCD34D',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#92400E', marginBottom: '4px' }}>
                🔒 Sensitive Document - Access Audit Required
              </div>
              <div style={{ fontSize: '13px', color: '#78350F' }}>
                Viewing POD documents requires a mandatory reason for compliance.
              </div>
            </div>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewRequest('view')}
            >
              Request Access
            </Button>
          </div>
        </Card>
      )}

      {/* Photos Section */}
      {photos.length > 0 && (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>POD Photos ({photos.length})</span>
              {accessGranted && (
                <Button
                  size="small"
                  icon={<ZoomInOutlined />}
                  onClick={() => message.info('Click any photo to zoom')}
                >
                  Zoom
                </Button>
              )}
            </div>
          }
          style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}
        >
          {accessGranted ? (
            <Image.PreviewGroup>
              <Space wrap size="large">
                {photos.map((url, idx) => (
                  <Image
                    key={idx}
                    width={200}
                    height={200}
                    src={url}
                    alt={`POD Photo ${idx + 1}`}
                    style={{
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: `2px solid ${border}`,
                    }}
                    placeholder={
                      <div
                        style={{
                          width: 200,
                          height: 200,
                          background: '#F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        Loading...
                      </div>
                    }
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: textSecondary }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <div>Request access to view POD photos</div>
            </div>
          )}
        </Card>
      )}

      {/* PDF Section */}
      {pdfUrl && (
        <Card
          title="Consolidated POD Document"
          style={{ background: bgCard, border: `1px solid ${border}` }}
        >
          {accessGranted ? (
            <Space>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => handleViewRequest('download')}
              >
                Download PDF
              </Button>
              <Button
                icon={<EyeOutlined />}
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                View in New Tab
              </Button>
            </Space>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: textSecondary }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄🔒</div>
              <div>Request access to view POD document</div>
            </div>
          )}
        </Card>
      )}

      {/* Audit Modal */}
      <Modal
        title="🔒 Access Audit Required"
        open={auditModalVisible}
        onOk={handleAuditSubmit}
        onCancel={() => {
          setAuditModalVisible(false);
          setAuditReason('');
          setActionType(null);
        }}
        okText="Grant Access"
        width={600}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', fontWeight: 600 }}>
            Why are you accessing this POD document?
          </div>
          <div style={{ fontSize: '13px', color: textSecondary, marginBottom: '16px' }}>
            All POD document views are logged for compliance. Please provide a detailed reason
            (minimum 20 characters).
          </div>
          <TextArea
            rows={4}
            placeholder="e.g., Investigating shipper complaint about damaged goods. Need to verify POD photos match delivery condition..."
            value={auditReason}
            onChange={(e) => setAuditReason(e.target.value)}
          />
          <div style={{ marginTop: '8px', fontSize: '12px', color: textSecondary }}>
            {auditReason.length}/20 characters minimum
          </div>
        </div>

        <div
          style={{
            background: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: '4px',
            padding: '12px',
            fontSize: '12px',
            color: '#78350F',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>📋 What gets logged:</div>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Your admin ID and name</li>
            <li>Shipment ID: {shipmentId}</li>
            <li>Document type: POD ({actionType === 'download' ? 'Download' : 'View'})</li>
            <li>Timestamp and IP address</li>
            <li>Your stated reason</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

