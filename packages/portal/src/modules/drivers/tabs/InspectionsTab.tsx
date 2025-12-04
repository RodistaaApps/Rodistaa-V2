import { Table, Tag } from 'antd';
import dayjs from 'dayjs';

export function InspectionsTab({ driverId, theme = 'dark' }: { driverId: string; theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockInspections = [
    { id: 'INS-001', truck_reg: 'TN 01 AB 1234', date: '2025-11-15', result: 'pass', notes: 'All checks passed' },
  ];

  const columns = [
    { title: 'Inspection ID', dataIndex: 'id', key: 'id', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textPrimary }}>{t}</span> },
    { title: 'Truck', dataIndex: 'truck_reg', key: 'truck_reg', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textPrimary }}>{t}</span> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => <span style={{ color: textSecondary }}>{dayjs(d).format('DD MMM YYYY')}</span> },
    { title: 'Result', dataIndex: 'result', key: 'result', render: (r: string) => <Tag color={r === 'pass' ? 'green' : 'red'}>{r?.toUpperCase()}</Tag> },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (n: string) => <span style={{ color: textPrimary }}>{n}</span> },
  ];

  return <div style={{ padding: '24px 0' }}><Table columns={columns} dataSource={mockInspections} rowKey="id" pagination={false} /></div>;
}

