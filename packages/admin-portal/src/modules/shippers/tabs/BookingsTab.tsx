/**
 * Bookings Tab - Shipper Detail
 * Shows paginated list of shipper's bookings with filters
 */

import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, DatePicker, Select, Input } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { Booking } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface BookingsTabProps {
  shipperId: string;
  theme?: 'light' | 'dark';
}

export function BookingsTab({ shipperId, theme = 'dark' }: BookingsTabProps) {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    minPrice: undefined as number | undefined,
    dateRange: undefined as [string, string] | undefined,
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  // Mock data
  const mockBookings: Booking[] = [
    {
      id: 'BKG-001',
      route: { from: 'Vijayawada', to: 'Hyderabad' },
      posted_date: '2025-12-01T10:00:00Z',
      expected_price: 15000,
      lowest_bid: 14500,
      status: 'awarded',
    },
    {
      id: 'BKG-002',
      route: { from: 'Kurnool', to: 'Bangalore' },
      posted_date: '2025-12-02T14:30:00Z',
      expected_price: 25000,
      lowest_bid: 23000,
      status: 'converted',
    },
    {
      id: 'BKG-003',
      route: { from: 'Guntur', to: 'Chennai' },
      posted_date: '2025-12-03T09:15:00Z',
      expected_price: 20000,
      lowest_bid: undefined,
      status: 'posted',
    },
  ];

  useEffect(() => {
    fetchBookings();
  }, [shipperId, filters, pagination]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/users/${shipperId}/bookings?...`);
      await new Promise(resolve => setTimeout(resolve, 300));
      setBookings(mockBookings);
      setTotal(mockBookings.length);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      posted: 'blue',
      awarded: 'orange',
      converted: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: textPrimary }}>
          {id}
        </span>
      ),
    },
    {
      title: 'Route',
      key: 'route',
      width: 200,
      render: (_: any, record: Booking) => (
        <span style={{ color: textPrimary }}>
          {record.route.from} → {record.route.to}
        </span>
      ),
    },
    {
      title: 'Posted Date',
      dataIndex: 'posted_date',
      key: 'posted_date',
      width: 140,
      render: (date: string) => (
        <span style={{ color: textSecondary }}>
          {dayjs(date).format('DD MMM YYYY')}
        </span>
      ),
    },
    {
      title: 'Expected Price',
      dataIndex: 'expected_price',
      key: 'expected_price',
      width: 130,
      align: 'right' as const,
      render: (price: number) => (
        <span style={{ color: textPrimary, fontWeight: 600 }}>
          ₹{price.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      title: 'Lowest Bid',
      dataIndex: 'lowest_bid',
      key: 'lowest_bid',
      width: 130,
      align: 'right' as const,
      render: (bid: number | undefined) => (
        <span style={{ color: bid ? '#10B981' : textSecondary, fontWeight: bid ? 600 : 400 }}>
          {bid ? `₹${bid.toLocaleString('en-IN')}` : '—'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Booking) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            // TODO: Open booking detail modal
            console.log('View booking:', record.id);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Filters */}
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <Input
          placeholder="Search bookings..."
          prefix={<SearchOutlined style={{ color: textSecondary }} />}
          style={{ width: 240 }}
        />
        <Select
          placeholder="Status"
          style={{ width: 140 }}
          allowClear
          value={filters.status}
          onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          options={[
            { label: 'Posted', value: 'posted' },
            { label: 'Awarded', value: 'awarded' },
            { label: 'Converted', value: 'converted' },
            { label: 'Cancelled', value: 'cancelled' },
          ]}
        />
        <RangePicker style={{ width: 260 }} />
        <Button
          onClick={() => setFilters({ status: undefined, minPrice: undefined, dateRange: undefined })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Total ${total} bookings`,
        }}
        onChange={(newPagination) => {
          setPagination({
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 10,
          });
        }}
        scroll={{ x: 900 }}
      />
    </div>
  );
}

