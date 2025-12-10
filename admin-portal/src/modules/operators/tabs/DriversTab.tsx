import { useState, useEffect } from 'react';
import { Table, Tag, Button } from 'antd';
import { EyeOutlined, DisconnectOutlined } from '@ant-design/icons';
import type { Driver } from '../types';
import dayjs from 'dayjs';

interface DriversTabProps {
  operatorId: string;
  theme?: 'light' | 'dark';
}

export function DriversTab({ operatorId, theme = 'dark' }: DriversTabProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockDrivers: Driver[] = [
    { id: 'DR-001', operator_id: operatorId, name: 'Ramesh Kumar', mobile: '+919876543210', dl_number: 'DL1234567890', dl_expiry: '2026-05-15', total_trips: 145, last_active: '2025-12-03', status: 'active' },
  ];

  useEffect(() => { setDrivers(mockDrivers); }, [operatorId]);

  const columns = [
    { title: 'Driver ID', dataIndex: 'id', key: 'id', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textPrimary }}>{t}</span> },
    { title: 'Name', dataIndex: 'name', key: 'name', render: (t: string) => <span style={{ fontWeight: 600, color: textPrimary }}>{t}</span> },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile', render: (t: string) => <span style={{ color: textSecondary }}>{t.replace(/(\d{3})\d{4}(\d{4})/, '$1••••$2')}</span> },
    { title: 'DL Expiry', dataIndex: 'dl_expiry', key: 'dl_expiry', render: (d: string) => <span style={{ color: textSecondary }}>{dayjs(d).format('DD MMM YYYY')}</span> },
    { title: 'Trips', dataIndex: 'total_trips', key: 'total_trips', render: (t: number) => <span style={{ color: textPrimary, fontWeight: 600 }}>{t}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s.toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', render: () => <Button type="text" size="small" icon={<EyeOutlined />}>View</Button> },
  ];

  return <div style={{ padding: '24px 0' }}><Table columns={columns} dataSource={drivers} rowKey="id" pagination={{ pageSize: 10 }} /></div>;
}

