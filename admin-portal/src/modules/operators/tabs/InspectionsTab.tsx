import { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, Space, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { Inspection } from '../types';
import dayjs from 'dayjs';

interface InspectionsTabProps {
  operatorId: string;
  theme?: 'light' | 'dark';
}

export function InspectionsTab({ operatorId, theme = 'dark' }: InspectionsTabProps) {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockInspections: Inspection[] = [
    { id: 'INS-001', truck_id: 'TRK-001', truck_reg: 'KA 01 AB 1234', scheduled_date: '2025-12-10', status: 'pending', result: undefined },
    { id: 'INS-002', truck_id: 'TRK-002', truck_reg: 'AP 09 CD 5678', scheduled_date: '2025-11-20', completed_date: '2025-11-21', status: 'completed', result: 'pass', verified_by: 'Admin', verified_at: '2025-11-22' },
  ];

  useEffect(() => { setInspections(mockInspections); }, [operatorId]);

  const handleVerify = (id: string) => {
    message.success('Inspection verified. Audit log created.');
  };

  const columns = [
    { title: 'Inspection ID', dataIndex: 'id', key: 'id', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textPrimary }}>{t}</span> },
    { title: 'Truck', dataIndex: 'truck_reg', key: 'truck_reg', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Scheduled', dataIndex: 'scheduled_date', key: 'scheduled_date', render: (d: string) => <span style={{ color: textSecondary }}>{dayjs(d).format('DD MMM YYYY')}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'completed' ? 'green' : s === 'pending' ? 'orange' : 'blue'}>{s.toUpperCase()}</Tag> },
    { title: 'Result', dataIndex: 'result', key: 'result', render: (r: string) => r ? <Tag color={r === 'pass' ? 'green' : 'red'}>{r.toUpperCase()}</Tag> : '—' },
    { title: 'Actions', key: 'actions', render: (_: any, r: Inspection) => r.status === 'completed' && !r.verified_at ? <Button type="primary" size="small" onClick={() => handleVerify(r.id)} style={{ background: '#10B981', borderColor: '#10B981' }}>Verify</Button> : null },
  ];

  return <div style={{ padding: '24px 0' }}><Table columns={columns} dataSource={inspections} rowKey="id" pagination={{ pageSize: 10 }} /></div>;
}

