import { Card, Tag, Button, Space, Progress } from 'antd';
import { WarningOutlined, CheckCircleOutlined, ArrowUpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export function IncidentsTab({ driverId, theme = 'dark' }: { driverId: string; theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const mockIncidents = [
    { id: 'INC-001', type: 'harsh_braking', severity: 'medium', description: 'Harsh braking detected near Hyderabad toll', created_at: '2025-12-02T14:30:00Z', status: 'open' },
    { id: 'INC-002', type: 'late_arrival', severity: 'low', description: 'Arrived 15 minutes late at pickup', created_at: '2025-11-28T10:00:00Z', status: 'acknowledged' },
  ];

  const getSeverityColor = (s: string) => ({ low: '#10B981', medium: '#F59E0B', high: '#EF4444' }[s] || '#6B7280');

  return (
    <div style={{ padding: '24px 0' }}>
      <Card style={{ marginBottom: '24px', background: bgCard, border: `1px solid ${border}` }}>
        <div style={{ fontWeight: 600, color: textPrimary, marginBottom: '16px' }}>Behaviour Breakdown</div>
        <div style={{ marginBottom: '12px' }}><span style={{ color: textSecondary }}>Late Arrivals:</span> <Progress percent={5} strokeColor="#F59E0B" style={{ width: '60%', display: 'inline-block', marginLeft: '12px' }} /></div>
        <div style={{ marginBottom: '12px' }}><span style={{ color: textSecondary }}>Harsh Braking:</span> <Progress percent={8} strokeColor="#EF4444" style={{ width: '60%', display: 'inline-block', marginLeft: '12px' }} /></div>
        <div><span style={{ color: textSecondary }}>Complaints:</span> <Progress percent={2} strokeColor="#10B981" style={{ width: '60%', display: 'inline-block', marginLeft: '12px' }} /></div>
      </Card>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {mockIncidents.map(inc => (
          <Card key={inc.id} style={{ background: bgCard, border: `2px solid ${getSeverityColor(inc.severity)}` }}>
            <div style={{ marginBottom: '12px' }}>
              <Tag color={getSeverityColor(inc.severity)}>{inc.severity.toUpperCase()}</Tag>
              <Tag>{inc.type.replace('_', ' ').toUpperCase()}</Tag>
              <span style={{ fontSize: '12px', color: textSecondary, marginLeft: '8px' }}>{dayjs(inc.created_at).format('DD MMM YYYY, HH:mm')}</span>
            </div>
            <div style={{ color: textPrimary, marginBottom: '12px' }}>{inc.description}</div>
            <Space>
              <Button size="small" icon={<CheckCircleOutlined />}>Acknowledge</Button>
              <Button danger size="small" icon={<ArrowUpOutlined />}>Escalate</Button>
            </Space>
          </Card>
        ))}
      </Space>
    </div>
  );
}

