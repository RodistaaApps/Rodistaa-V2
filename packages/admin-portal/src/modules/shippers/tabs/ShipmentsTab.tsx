/**
 * Shipments Tab - Shipper Detail
 * Shows paginated list of shipper's shipments with tracking
 */

import { useState, useEffect } from 'react';
import { Table, Tag, Button, Progress, Select } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { Shipment } from '../types';
import dayjs from 'dayjs';

interface ShipmentsTabProps {
  shipperId: string;
  theme?: 'light' | 'dark';
}

export function ShipmentsTab({ shipperId, theme = 'dark' }: ShipmentsTabProps) {
  const [loading, setLoading] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockShipments: Shipment[] = [
    {
      id: 'SHIP-001',
      booking_id: 'BKG-001',
      truck: 'KA 01 AB 1234',
      operator: 'Rajesh Transport',
      start_date: '2025-12-02T08:00:00Z',
      delivered_date: '2025-12-03T16:30:00Z',
      pod_status: 'verified',
      payment_status: 'paid',
    },
    {
      id: 'SHIP-002',
      booking_id: 'BKG-002',
      truck: 'AP 09 CD 5678',
      operator: 'Suresh Logistics',
      start_date: '2025-12-03T10:00:00Z',
      pod_status: 'uploaded',
      payment_status: 'pending',
    },
  ];

  useEffect(() => {
    fetchShipments();
  }, [shipperId, statusFilter]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setShipments(mockShipments);
      setTotal(mockShipments.length);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Shipment ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: textPrimary }}>{id}</span>
      ),
    },
    {
      title: 'Booking ID',
      dataIndex: 'booking_id',
      key: 'booking_id',
      width: 120,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', color: textSecondary }}>{id}</span>
      ),
    },
    {
      title: 'Truck',
      dataIndex: 'truck',
      key: 'truck',
      width: 130,
      render: (truck: string) => <span style={{ color: textPrimary }}>{truck}</span>,
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      key: 'operator',
      width: 160,
      render: (operator: string) => <span style={{ color: textPrimary }}>{operator}</span>,
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 120,
      render: (date: string) => (
        <span style={{ color: textSecondary }}>{dayjs(date).format('DD MMM YYYY')}</span>
      ),
    },
    {
      title: 'Delivered',
      dataIndex: 'delivered_date',
      key: 'delivered_date',
      width: 120,
      render: (date: string | undefined) => (
        <span style={{ color: date ? textSecondary : '#F59E0B' }}>
          {date ? dayjs(date).format('DD MMM YYYY') : 'In Transit'}
        </span>
      ),
    },
    {
      title: 'POD',
      dataIndex: 'pod_status',
      key: 'pod_status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'verified' ? 'green' : status === 'uploaded' ? 'blue' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'paid' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Shipment) => (
        <Button type="text" size="small" icon={<EyeOutlined />}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <Select
          placeholder="POD Status"
          style={{ width: 140 }}
          allowClear
          options={[
            { label: 'Pending', value: 'pending' },
            { label: 'Uploaded', value: 'uploaded' },
            { label: 'Verified', value: 'verified' },
          ]}
        />
        <Select
          placeholder="Payment Status"
          style={{ width: 140 }}
          allowClear
          options={[
            { label: 'Pending', value: 'pending' },
            { label: 'Paid', value: 'paid' },
            { label: 'Failed', value: 'failed' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={shipments}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, total, showTotal: (total) => `Total ${total} shipments` }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
}

