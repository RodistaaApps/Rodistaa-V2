/**
 * Bookings List Page
 * 
 * Admin view of all load postings with bidding status:
 * - Comprehensive filters (status, date, price, franchise)
 * - Bulk actions (export, bulk cancel)
 * - View booking details with bids
 * - Force finalize, cancel actions
 */

import { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Select, Button, Tag, Space, Badge, Tooltip, 
  DatePicker, InputNumber, message 
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  DollarOutlined,
  DownloadOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { BookingDetailPanel } from '@/modules/bookings/BookingDetailPanel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;

interface Booking {
  id: string;
  shipper_id: string;
  shipper_name: string;
  franchise_id: string;
  pickup_city: string;
  pickup_state: string;
  drop_city: string;
  drop_state: string;
  distance_km: number;
  material: string;
  weight_kg: number;
  expected_price_min: number;
  expected_price_max: number;
  posted_at: string;
  status: 'posted' | 'bidding' | 'finalized' | 'cancelled' | 'converted';
  bids_count: number;
  lowest_bid_amount: number | null;
  lowest_bid_operator: string | null;
  auto_finalize_at: string | null;
  created_shipment_id: string | null;
  finalized_at: string | null;
}

const BookingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 25,
    status: undefined as string | undefined,
    search: '',
  });

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // TODO: Call /admin/bookings API
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockBookings: Booking[] = [
        {
          id: 'BKG-001',
          shipper_id: 'USR-20241',
          shipper_name: 'Rohit Sharma',
          franchise_id: 'FR-001',
          pickup_city: 'Hyderabad',
          pickup_state: 'Telangana',
          drop_city: 'Mumbai',
          drop_state: 'Maharashtra',
          distance_km: 710,
          material: 'Electronics',
          weight_kg: 5000,
          expected_price_min: 45000,
          expected_price_max: 55000,
          posted_at: '2025-12-05T09:00:00Z',
          status: 'bidding',
          bids_count: 4,
          lowest_bid_amount: 48000,
          lowest_bid_operator: 'ABC Transport',
          auto_finalize_at: '2025-12-06T09:00:00Z',
          created_shipment_id: null,
          finalized_at: null,
        },
        {
          id: 'BKG-002',
          shipper_id: 'USR-20242',
          shipper_name: 'Priya Patel',
          franchise_id: 'FR-002',
          pickup_city: 'Delhi',
          pickup_state: 'Delhi',
          drop_city: 'Bangalore',
          drop_state: 'Karnataka',
          distance_km: 2150,
          material: 'Machinery Parts',
          weight_kg: 12000,
          expected_price_min: 85000,
          expected_price_max: 95000,
          posted_at: '2025-12-04T14:30:00Z',
          status: 'finalized',
          bids_count: 6,
          lowest_bid_amount: 87500,
          lowest_bid_operator: 'XYZ Logistics',
          auto_finalize_at: null,
          created_shipment_id: 'SHP-001',
          finalized_at: '2025-12-04T18:45:00Z',
        },
      ];

      setBookings(mockBookings);
      setTotal(45);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      message.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      posted: 'blue',
      bidding: 'orange',
      finalized: 'green',
      cancelled: 'red',
      converted: 'purple',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      width: 130,
      fixed: 'left' as const,
      render: (id: string) => (
        <a 
          style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1890ff' }}
          onClick={() => setSelectedBookingId(id)}
        >
          {id}
        </a>
      ),
    },
    {
      title: 'Posted Date',
      dataIndex: 'posted_at',
      key: 'posted_at',
      width: 140,
      sorter: true,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format('DD MMM YYYY, HH:mm')}>
          <span style={{ color: textSecondary }}>{dayjs(timestamp).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Route',
      key: 'route',
      width: 250,
      render: (_: any, record: Booking) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>
            {record.pickup_city} → {record.drop_city}
          </div>
          <div style={{ fontSize: '12px', color: textSecondary }}>
            {record.distance_km} km • {record.pickup_state} → {record.drop_state}
          </div>
        </div>
      ),
    },
    {
      title: 'Material & Weight',
      key: 'load',
      width: 180,
      render: (_: any, record: Booking) => (
        <div>
          <div style={{ color: textPrimary }}>{record.material}</div>
          <div style={{ fontSize: '12px', color: textSecondary }}>
            {(record.weight_kg / 1000).toFixed(1)} MT
          </div>
        </div>
      ),
    },
    {
      title: 'Expected Price',
      key: 'expected_price',
      width: 140,
      align: 'right' as const,
      render: (_: any, record: Booking) => (
        <div style={{ fontSize: '13px' }}>
          <div style={{ color: textSecondary }}>
            ₹{record.expected_price_min.toLocaleString()} -
          </div>
          <div style={{ fontWeight: 600, color: textPrimary }}>
            ₹{record.expected_price_max.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Lowest Bid',
      key: 'lowest_bid',
      width: 160,
      align: 'right' as const,
      render: (_: any, record: Booking) => (
        record.lowest_bid_amount ? (
          <div>
            <div style={{ fontWeight: 600, color: '#10B981', fontSize: '14px' }}>
              ₹{record.lowest_bid_amount.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: textSecondary }}>
              {record.lowest_bid_operator}
            </div>
          </div>
        ) : (
          <span style={{ color: textSecondary }}>—</span>
        )
      ),
    },
    {
      title: 'Bids',
      dataIndex: 'bids_count',
      key: 'bids_count',
      width: 80,
      align: 'center' as const,
      render: (count: number) => (
        count > 0 ? (
          <Badge count={count} style={{ backgroundColor: '#3B82F6' }} />
        ) : (
          <span style={{ color: textSecondary }}>0</span>
        )
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
      title: 'Shipper',
      dataIndex: 'shipper_name',
      key: 'shipper_name',
      width: 150,
      render: (name: string, record: Booking) => (
        <div>
          <div style={{ color: textPrimary }}>{name}</div>
          <div style={{ fontSize: '11px', color: textSecondary, fontFamily: 'monospace' }}>
            {record.shipper_id}
          </div>
        </div>
      ),
    },
    {
      title: 'Shipment',
      dataIndex: 'created_shipment_id',
      key: 'created_shipment_id',
      width: 130,
      render: (shipmentId: string | null) => (
        shipmentId ? (
          <a style={{ fontFamily: 'monospace', fontSize: '13px' }}>
            {shipmentId}
          </a>
        ) : (
          <span style={{ color: textSecondary }}>—</span>
        )
      ),
    },
  ];

  return (
    <AdminLayout theme={theme} toggleTheme={toggleTheme}>
      <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
            <FileTextOutlined style={{ marginRight: '12px' }} />
            Bookings
          </h1>
          <div style={{ color: textSecondary, fontSize: '14px', marginTop: '4px' }}>
            Load postings, bidding, and finalization management
          </div>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}>
          <Space wrap>
            <Input
              placeholder="Search booking ID, shipper, material..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              allowClear
            />
            <Select
              placeholder="Status"
              style={{ width: 140 }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
              options={[
                { label: 'Posted', value: 'posted' },
                { label: 'Bidding', value: 'bidding' },
                { label: 'Finalized', value: 'finalized' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />
            <Button 
              icon={<FilterOutlined />}
              onClick={() => setFilters({ page: 1, limit: 25, status: undefined, search: '' })}
            >
              Clear Filters
            </Button>
          </Space>
        </Card>

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <Card style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge count={selectedRowKeys.length} style={{ backgroundColor: '#3B82F6' }}>
                <span style={{ color: textPrimary, fontWeight: 600, paddingRight: '20px' }}>
                  Selected
                </span>
              </Badge>
              <Space>
                <Button icon={<DownloadOutlined />}>
                  Export Selected
                </Button>
                <Button onClick={() => setSelectedRowKeys([])}>
                  Clear
                </Button>
              </Space>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="id"
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys as string[]),
            }}
            pagination={{
              current: filters.page,
              pageSize: filters.limit,
              total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100'],
              showTotal: (total) => `Total ${total} bookings`,
            }}
            onChange={(pagination) => {
              setFilters(prev => ({
                ...prev,
                page: pagination.current || 1,
                limit: pagination.pageSize || 25,
              }));
            }}
            scroll={{ x: 1600 }}
          />
        </Card>

        {/* Booking Detail Panel */}
        <BookingDetailPanel
          bookingId={selectedBookingId}
          open={!!selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          theme={theme}
        />
      </div>
    </AdminLayout>
  );
};

export default BookingsPage;
