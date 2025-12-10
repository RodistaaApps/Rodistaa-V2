import { Card, Tag, Button, Space } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { OperatorDetail } from '../types';

interface ACSTabProps {
  operator: OperatorDetail;
  theme?: 'light' | 'dark';
}

export function ACSTab({ operator, theme = 'dark' }: ACSTabProps) {
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const bgCard = isDark ? '#151922' : '#FFFFFF';

  if (!operator.acs_flags || operator.acs_flags.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <CheckCircleOutlined style={{ fontSize: '48px', color: '#10B981', marginBottom: '16px' }} />
        <div style={{ fontSize: '16px', color: textPrimary }}>No Active ACS Flags</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      {operator.acs_flags.map(flag => (
        <Card key={flag.id} style={{ marginBottom: '16px', background: bgCard, borderLeft: `4px solid #EF4444` }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div><Tag color="red">{flag.severity.toUpperCase()}</Tag> {flag.summary}</div>
            <div style={{ fontSize: '12px', color: textSecondary }}>Created: {flag.created_at}</div>
            <Space><Button size="small">Acknowledge</Button><Button danger size="small">Escalate</Button></Space>
          </Space>
        </Card>
      ))}
    </div>
  );
}

