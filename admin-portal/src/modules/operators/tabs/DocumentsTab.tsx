import { Card, Button, Row, Col } from 'antd';
import { FileTextOutlined, EyeOutlined } from '@ant-design/icons';

interface DocumentsTabProps {
  operatorId: string;
  theme?: 'light' | 'dark';
}

export function DocumentsTab({ operatorId, theme = 'dark' }: DocumentsTabProps) {
  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const mockDocs = [
    { id: 'DOC-001', type: 'RC Book', uploaded: '2025-11-10' },
    { id: 'DOC-002', type: 'Insurance', uploaded: '2025-11-12' },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Row gutter={[16, 16]}>
        {mockDocs.map(doc => (
          <Col xs={24} sm={12} lg={8} key={doc.id}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '12px' }}>📄</div>
              <div style={{ fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>{doc.type}</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>Uploaded: {doc.uploaded}</div>
              <Button type="primary" size="small" icon={<EyeOutlined />} block style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>View</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

