import { Table, Tag, Button, Space } from 'antd';
import { LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export function AssignmentsTab({ driverId, theme = 'dark' }: { driverId: string; theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockAssignments = [
    { id: 'ASG-001', operator_name: 'Suresh Logistics', truck_reg: 'TN 01 AB 1234', linked_at: '2025-10-01', is_primary: true, status: 'active' },
    { id: 'ASG-002', operator_name: 'Krishna Fleet', truck_reg: null, linked_at: '2025-11-15', is_primary: false, status: 'active' },
  ];

  const columns = [
    { title: 'Operator', dataIndex: 'operator_name', key: 'operator_name', render: (t: string) => <span style={{ color: textPrimary, fontWeight: 600 }}>{t}</span> },
    { title: 'Truck', dataIndex: 'truck_reg', key: 'truck_reg', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textPrimary }}>{t || '—'}</span> },
    { title: 'Linked Since', dataIndex: 'linked_at', key: 'linked_at', render: (d: string) => <span style={{ color: textSecondary }}>{dayjs(d).format('DD MMM YYYY')}</span> },
    { title: 'Primary', dataIndex: 'is_primary', key: 'is_primary', render: (p: boolean) => p ? <Tag color="blue">PRIMARY</Tag> : <Tag>Secondary</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s.toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', render: () => <Button danger type="text" size="small" icon={<DisconnectOutlined />}>Unlink</Button> },
  ];

  return <div style={{ padding: '24px 0' }}><Table columns={columns} dataSource={mockAssignments} rowKey="id" pagination={false} /></div>;
}

