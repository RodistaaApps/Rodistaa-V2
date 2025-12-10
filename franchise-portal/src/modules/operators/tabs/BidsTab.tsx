import { useState, useEffect } from 'react';
import { Table, Tag, Button, Select, DatePicker } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { Bid } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface BidsTabProps {
  operatorId: string;
  theme?: 'light' | 'dark';
}

export function BidsTab({ operatorId, theme = 'dark' }: BidsTabProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockBids: Bid[] = [
    { id: 'BID-001', booking_id: 'BKG-101', operator_id: operatorId, amount: 15000, posted_date: '2025-12-01', status: 'won', shipment_id: 'SHIP-001' },
    { id: 'BID-002', booking_id: 'BKG-102', operator_id: operatorId, amount: 20000, posted_date: '2025-12-02', status: 'active' },
  ];

  useEffect(() => {
    setBids(mockBids);
  }, [operatorId]);

  const columns = [
    { title: 'Bid ID', dataIndex: 'id', key: 'id', render: (t: string) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: textPrimary }}>{t}</span> },
    { title: 'Booking ID', dataIndex: 'booking_id', key: 'booking_id', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textSecondary }}>{t}</span> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: number) => <span style={{ color: textPrimary, fontWeight: 600 }}>₹{a.toLocaleString('en-IN')}</span> },
    { title: 'Posted', dataIndex: 'posted_date', key: 'posted_date', render: (d: string) => <span style={{ color: textSecondary }}>{dayjs(d).format('DD MMM YYYY')}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'won' ? 'green' : s === 'lost' ? 'red' : 'blue'}>{s.toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', render: () => <Button type="text" size="small" icon={<EyeOutlined />}>View</Button> },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <Select placeholder="Status" style={{ width: 140 }} options={[{ label: 'Active', value: 'active' }, { label: 'Won', value: 'won' }, { label: 'Lost', value: 'lost' }]} />
        <RangePicker />
      </div>
      <Table columns={columns} dataSource={bids} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </div>
  );
}

