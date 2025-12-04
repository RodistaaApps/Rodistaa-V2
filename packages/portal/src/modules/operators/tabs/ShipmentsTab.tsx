import { useState, useEffect } from 'react';
import { Table, Tag, Button, Progress } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { Shipment } from '../types';
import dayjs from 'dayjs';

interface ShipmentsTabProps {
  operatorId: string;
  theme?: 'light' | 'dark';
}

export function ShipmentsTab({ operatorId, theme = 'dark' }: ShipmentsTabProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockShipments: Shipment[] = [
    { id: 'SHIP-001', booking_id: 'BKG-101', operator_id: operatorId, truck_id: 'TRK-001', truck_reg: 'KA 01 AB 1234', driver_id: 'DR-001', driver_name: 'Ramesh', start_date: '2025-12-01', delivered_date: '2025-12-02', delivery_status: 'delivered', pod_status: 'verified', payment_status: 'paid' },
  ];

  useEffect(() => { setShipments(mockShipments); }, [operatorId]);

  const columns = [
    { title: 'Shipment ID', dataIndex: 'id', key: 'id', render: (t: string) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: textPrimary }}>{t}</span> },
    { title: 'Booking', dataIndex: 'booking_id', key: 'booking_id', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textSecondary }}>{t}</span> },
    { title: 'Truck', dataIndex: 'truck_reg', key: 'truck_reg', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Driver', dataIndex: 'driver_name', key: 'driver_name', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Start', dataIndex: 'start_date', key: 'start_date', render: (d: string) => <span style={{ color: textSecondary }}>{dayjs(d).format('DD MMM')}</span> },
    { title: 'Delivered', dataIndex: 'delivered_date', key: 'delivered_date', render: (d: string) => <span style={{ color: textSecondary }}>{d ? dayjs(d).format('DD MMM') : 'In Transit'}</span> },
    { title: 'POD', dataIndex: 'pod_status', key: 'pod_status', render: (s: string) => <Tag color={s === 'verified' ? 'green' : s === 'uploaded' ? 'blue' : 'orange'}>{s.toUpperCase()}</Tag> },
    { title: 'Payment', dataIndex: 'payment_status', key: 'payment_status', render: (s: string) => <Tag color={s === 'paid' ? 'green' : 'orange'}>{s.toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', render: () => <Button type="text" size="small" icon={<EyeOutlined />}>Details</Button> },
  ];

  return <div style={{ padding: '24px 0' }}><Table columns={columns} dataSource={shipments} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} /></div>;
}

