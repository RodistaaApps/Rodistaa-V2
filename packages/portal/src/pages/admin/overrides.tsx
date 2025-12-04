/**
 * Overrides - Theme-aware version
 */

import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface OverridesPageProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

function OverridesPage({ theme = 'dark', toggleTheme }: OverridesPageProps) {
  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';

  const mockOverrides = [
    { id: 'OVR-001', type: 'TRUCK_VERIFICATION', requestedBy: 'Franchise-Kurnool', reason: 'Vahan API mismatch', status: 'PENDING' },
    { id: 'OVR-002', type: 'KYC_VERIFICATION', requestedBy: 'Franchise-Vijayawada', reason: 'Document issue', status: 'PENDING' },
  ];

  const columns = [
    { title: 'Request ID', dataIndex: 'id', key: 'id', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: 'Requested By', dataIndex: 'requestedBy', key: 'requestedBy', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color="orange">{s}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        record.status === 'PENDING' ? (
          <Space>
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>Approve</Button>
            <Button danger size="small" icon={<CloseCircleOutlined />}>Reject</Button>
          </Space>
        ) : null
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, marginBottom: '24px' }}>Override Requests</h1>
          <Card><Table columns={columns} dataSource={mockOverrides} rowKey="id" pagination={{ pageSize: 20 }} /></Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default OverridesPage;
