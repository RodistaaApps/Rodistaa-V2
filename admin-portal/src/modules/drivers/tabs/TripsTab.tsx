import { useState } from 'react';
import { Table, Tag, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { Trip } from '../types';
import dayjs from 'dayjs';

export function TripsTab({ driverId, theme = 'dark' }: { driverId: string; theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockTrips: Trip[] = [
    { id: 'TRIP-001', booking_id: 'BKG-101', route: { from: 'Hyderabad', to: 'Vijayawada' }, start_date: '2025-12-04T06:00:00Z', end_date: null, status: 'in_transit', pod_status: 'pending', payment_received: false, operator_name: 'Suresh Logistics', truck_reg: 'TN 01 AB 1234' },
    { id: 'TRIP-002', booking_id: 'BKG-100', route: { from: 'Guntur', to: 'Kurnool' }, start_date: '2025-12-03T08:00:00Z', end_date: '2025-12-03T16:00:00Z', status: 'delivered', pod_status: 'verified', payment_received: true, operator_name: 'Rajesh Transport', truck_reg: 'AP 09 CD 5678' },
  ];

  const columns = [
    { title: 'Trip ID', dataIndex: 'id', key: 'id', render: (t: string) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: textPrimary }}>{t}</span> },
    { title: 'Booking', dataIndex: 'booking_id', key: 'booking_id', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textSecondary }}>{t}</span> },
    { title: 'Route', key: 'route', render: (_: any, r: Trip) => <span style={{ color: textPrimary }}>{r.route.from} → {r.route.to}</span> },
    { title: 'Start', dataIndex: 'start_date', key: 'start_date', render: (d: string) => <span style={{ color: textSecondary }}>{dayjs(d).format('DD MMM')}</span> },
    { title: 'End', dataIndex: 'end_date', key: 'end_date', render: (d: string) => <span style={{ color: textSecondary }}>{d ? dayjs(d).format('DD MMM') : 'Ongoing'}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'delivered' ? 'green' : 'blue'}>{s.toUpperCase()}</Tag> },
    { title: 'POD', dataIndex: 'pod_status', key: 'pod_status', render: (s: string) => <Tag color={s === 'verified' ? 'green' : 'orange'}>{s.toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', render: () => <Button type="text" size="small" icon={<EyeOutlined />}>Timeline</Button> },
  ];

  return <div style={{ padding: '24px 0' }}><Table columns={columns} dataSource={mockTrips} rowKey="id" pagination={{ pageSize: 10 }} /></div>;
}

