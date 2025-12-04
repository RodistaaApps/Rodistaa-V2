/**
 * Documents Tab - Shipper Detail
 * Shows KYC and business documents with permission-based access
 * SECURITY: Viewing sensitive documents requires admin permission and creates audit log
 */

import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, message, Space, Tag, Tooltip, Row, Col } from 'antd';
import { FileTextOutlined, EyeOutlined, DownloadOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import type { Document } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface DocumentsTabProps {
  shipperId: string;
  theme?: 'light' | 'dark';
}

export function DocumentsTab({ shipperId, theme = 'dark' }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestViewModal, setRequestViewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewReason, setViewReason] = useState('');
  const [pdfViewerModal, setPdfViewerModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');

  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const bgElevated = isDark ? '#1E2430' : '#F3F4F6';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  // Mock current user permissions (replace with actual auth)
  const hasKYCViewPermission = false; // Set to true for super_admin/compliance_officer

  const mockDocuments: Document[] = [
    {
      id: 'DOC-001',
      type: 'aadhar',
      url: 's3://bucket/doc1.pdf',
      uploaded_at: '2025-11-15T10:00:00Z',
      is_sensitive: true,
      masked: !hasKYCViewPermission,
    },
    {
      id: 'DOC-002',
      type: 'gst',
      url: 's3://bucket/doc2.pdf',
      uploaded_at: '2025-11-16T14:30:00Z',
      is_sensitive: true,
      masked: !hasKYCViewPermission,
    },
    {
      id: 'DOC-003',
      type: 'business_proof',
      url: 's3://bucket/doc3.pdf',
      uploaded_at: '2025-11-20T09:15:00Z',
      is_sensitive: false,
      masked: false,
    },
  ];

  useEffect(() => {
    fetchDocuments();
  }, [shipperId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setDocuments(mockDocuments);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (doc: Document) => {
    if (doc.is_sensitive && !hasKYCViewPermission) {
      // Show request permission modal
      setSelectedDocument(doc);
      setRequestViewModal(true);
      return;
    }

    // If has permission, request document URL and open
    try {
      // TODO: API call to get signed URL
      // const response = await fetch(`/api/admin/users/${shipperId}/documents/${doc.id}/view?reason=${viewReason}`);
      // const { access_granted, url } = await response.json();
      
      // Mock response
      const mockUrl = 'https://example.com/sample.pdf';
      setDocumentUrl(mockUrl);
      setPdfViewerModal(true);
      
      message.success('Document access granted');
    } catch (error) {
      message.error('Failed to access document');
    }
  };

  const handleRequestView = async () => {
    if (!viewReason.trim()) {
      message.error('Please provide a reason for viewing this document');
      return;
    }

    try {
      // TODO: API call to create audit log and request permission
      // await fetch(`/api/admin/users/${shipperId}/audit/actions`, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     action: 'request_kyc_view',
      //     document_id: selectedDocument?.id,
      //     reason: viewReason,
      //   }),
      // });

      message.info('View request submitted. Pending approval from compliance officer.');
      setRequestViewModal(false);
      setViewReason('');
      setSelectedDocument(null);
    } catch (error) {
      message.error('Failed to submit view request');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      aadhar: 'Aadhaar Card',
      gst: 'GST Certificate',
      business_proof: 'Business Proof',
      other: 'Other Document',
    };
    return labels[type] || type;
  };

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, any> = {
      aadhar: '🆔',
      gst: '📄',
      business_proof: '🏢',
      other: '📎',
    };
    return icons[type] || '📎';
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Permission Notice */}
      {!hasKYCViewPermission && (
        <Card
          style={{
            marginBottom: '24px',
            background: '#F59E0B20',
            border: '1px solid #F59E0B',
          }}
        >
          <Space>
            <LockOutlined style={{ fontSize: '20px', color: '#F59E0B' }} />
            <div>
              <div style={{ fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>
                Restricted Access
              </div>
              <div style={{ fontSize: '13px', color: textSecondary }}>
                Viewing sensitive documents requires compliance officer permissions. 
                You can request access by providing a valid reason.
              </div>
            </div>
          </Space>
        </Card>
      )}

      {/* Documents Grid */}
      <Row gutter={[16, 16]}>
        {documents.map((doc) => (
          <Col xs={24} sm={12} lg={8} key={doc.id}>
            <Card
              style={{
                background: bgCard,
                border: `1px solid ${border}`,
                position: 'relative',
              }}
            >
              {/* Sensitive Badge */}
              {doc.is_sensitive && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                }}>
                  <Tooltip title="Sensitive document - requires permission">
                    <Tag color="red" icon={<SafetyOutlined />}>
                      SENSITIVE
                    </Tag>
                  </Tooltip>
                </div>
              )}

              {/* Document Icon/Thumbnail */}
              <div style={{
                fontSize: '48px',
                textAlign: 'center',
                padding: '24px 0',
                background: bgElevated,
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                {getDocumentIcon(doc.type)}
              </div>

              {/* Document Info */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>
                  {getDocumentTypeLabel(doc.type)}
                </div>
                <div style={{ fontSize: '11px', color: textSecondary, fontFamily: 'monospace' }}>
                  {doc.id}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '12px' }}>
                <div>Uploaded: {dayjs(doc.uploaded_at).format('DD MMM YYYY')}</div>
                <div>Source: Mobile App</div>
              </div>

              {/* Actions */}
              <Space size="small" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  size="small"
                  icon={doc.masked ? <LockOutlined /> : <EyeOutlined />}
                  onClick={() => handleViewDocument(doc)}
                  style={{
                    flex: 1,
                    background: doc.masked ? '#F59E0B' : '#C90D0D',
                    borderColor: doc.masked ? '#F59E0B' : '#C90D0D',
                  }}
                >
                  {doc.masked ? 'Request View' : 'View'}
                </Button>
                {!doc.masked && (
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                  >
                    Download
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Request View Modal */}
      <Modal
        title="Request Document Access"
        open={requestViewModal}
        onCancel={() => {
          setRequestViewModal(false);
          setViewReason('');
          setSelectedDocument(null);
        }}
        onOk={handleRequestView}
        okText="Submit Request"
        okButtonProps={{ style: { background: '#C90D0D', borderColor: '#C90D0D' } }}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: textPrimary }}>
            Document: {selectedDocument && getDocumentTypeLabel(selectedDocument.type)}
          </div>
          <div style={{ fontSize: '13px', color: textSecondary }}>
            This is a sensitive document. Please provide a valid business reason for viewing it.
            Your request will be logged in the audit trail.
          </div>
        </div>

        <TextArea
          rows={4}
          placeholder="Enter reason for accessing this document (required)..."
          value={viewReason}
          onChange={(e) => setViewReason(e.target.value)}
          maxLength={500}
          showCount
        />

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#3B82F620',
          border: '1px solid #3B82F6',
          borderRadius: '6px',
          fontSize: '12px',
          color: textPrimary,
        }}>
          ℹ️ <strong>Audit Trail:</strong> Your admin ID, timestamp, IP address, and reason will be permanently logged.
        </div>
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal
        title="Document Viewer"
        open={pdfViewerModal}
        onCancel={() => setPdfViewerModal(false)}
        footer={null}
        width={900}
      >
        <div style={{
          height: '600px',
          background: bgElevated,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', color: textSecondary }}>
            <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>PDF Viewer would be embedded here</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              Actual implementation would use iframe or PDF.js
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

