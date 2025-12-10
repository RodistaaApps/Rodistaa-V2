import { Card, Button, Row, Col, Tag } from 'antd';
import { FileTextOutlined, EyeOutlined, SafetyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export function DocumentsTab({ driverId, theme = 'dark' }: { driverId: string; theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const mockDocs = [
    { id: 'DOC-001', type: 'DL Front', uploaded: '2025-11-10', is_sensitive: true },
    { id: 'DOC-002', type: 'DL Back', uploaded: '2025-11-10', is_sensitive: true },
    { id: 'DOC-003', type: 'Aadhaar', uploaded: '2025-11-12', is_sensitive: true },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Row gutter={[16, 16]}>
        {mockDocs.map(doc => (
          <Col xs={24} sm={12} lg={8} key={doc.id}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              {doc.is_sensitive && <Tag color="red" icon={<SafetyOutlined />} style={{ position: 'absolute', top: 12, right: 12 }}>SENSITIVE</Tag>}
              <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '12px' }}>🪪</div>
              <div style={{ fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>{doc.type}</div>
              <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '12px' }}>Uploaded: {doc.uploaded}</div>
              <Button type="primary" size="small" icon={<EyeOutlined />} block style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>View (Audit Logged)</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

