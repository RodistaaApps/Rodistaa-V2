/**
 * Fleet Management - Trucks List
 * 
 * List of all trucks with compliance status, operator info, and actions.
 * Similar structure to Bookings page.
 */

import { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Badge,
  Tooltip,
  message,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Truck {
  id: string;
  registration: string;
  operator_id: string;
  operator_name: string;
  truck_type: string;
  capacity_mt: number;
  rto_code: string;
  rc_expiry: string;
  insurance_expiry: string;
  permit_expiry: string;
  fitness_expiry: string;
  compliance_status: 'verified' | 'pending' | 'expired' | 'blocked';
  last_trip_date: string | null;
  total_trips: number;
  created_at: string;
}

const TrucksListPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
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
    fetchTrucks();
  }, [filters]);

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockTrucks: Truck[] = [
        {
          id: 'TRK-001',
          registration: 'DL 01 AB 1234',
          operator_id: 'OP-001',
          operator_name: 'ABC Transport',
          truck_type: 'Container 20ft',
          capacity_mt: 10,
          rto_code: 'DL',
          rc_expiry: '2026-03-15',
          insurance_expiry: '2025-06-30',
          permit_expiry: '2025-12-31',
          fitness_expiry: '2026-01-20',
          compliance_status: 'verified',
          last_trip_date: '2025-12-04T10:00:00Z',
          total_trips: 234,
          created_at: '2023-01-15T08:00:00Z',
        },
        {
          id: 'TRK-002',
          registration: 'HR 26 BX 5678',
          operator_id: 'OP-002',
          operator_name: 'XYZ Logistics',
          truck_type: 'Open Body 14ft',
          capacity_mt: 7.5,
          rto_code: 'HR',
          rc_expiry: '2025-08-20',
          insurance_expiry: '2025-05-10',
          permit_expiry: '2025-11-30',
          fitness_expiry: '2025-09-15',
          compliance_status: 'pending',
          last_trip_date: '2025-11-28T14:30:00Z',
          total_trips: 156,
          created_at: '2023-06-20T10:00:00Z',
        },
        {
          id: 'TRK-003',
          registration: 'MH 12 CD 9012',
          operator_id: 'OP-003',
          operator_name: 'Mumbai Transport Co.',
          truck_type: 'Trailer 32ft',
          capacity_mt: 25,
          rto_code: 'MH',
          rc_expiry: '2025-02-28',
          insurance_expiry: '2024-12-15',
          permit_expiry: '2025-03-31',
          fitness_expiry: '2025-04-10',
          compliance_status: 'expired',
          last_trip_date: '2025-11-15T16:00:00Z',
          total_trips: 89,
          created_at: '2024-02-10T12:00:00Z',
        },
      ];

      setTrucks(mockTrucks);
      setTotal(1248);
    } catch (error) {
      console.error('Failed to fetch trucks:', error);
      message.error('Failed to load trucks');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (status: string) => {
    const colors = {
      verified: 'green',
      pending: 'orange',
      expired: 'red',
      blocked: 'volcano',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const columns = [
    {
      title: 'Registration',
      dataIndex: 'registration',
      key: 'registration',
      width: 150,
      fixed: 'left' as const,
      render: (reg: string, record: Truck) => (
        <Space direction="vertical" size={0}>
          <a style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1890ff' }}>
            {reg}
          </a>
          <span style={{ fontSize: '11px', color: textSecondary, fontFamily: 'monospace' }}>
            {record.id}
          </span>
        </Space>
      ),
    },
    {
      title: 'Operator',
      key: 'operator',
      width: 180,
      render: (_: any, record: Truck) => (
        <div>
          <div style={{ color: textPrimary, fontWeight: 500 }}>{record.operator_name}</div>
          <div style={{ fontSize: '11px', color: textSecondary, fontFamily: 'monospace' }}>
            {record.operator_id}
          </div>
        </div>
      ),
    },
    {
      title: 'Type & Capacity',
      key: 'type',
      width: 160,
      render: (_: any, record: Truck) => (
        <div>
          <div style={{ color: textPrimary }}>{record.truck_type}</div>
          <div style={{ fontSize: '11px', color: textSecondary }}>
            {record.capacity_mt} MT
          </div>
        </div>
      ),
    },
    {
      title: 'RTO',
      dataIndex: 'rto_code',
      key: 'rto_code',
      width: 80,
      render: (code: string) => (
        <Tag style={{ fontFamily: 'monospace', fontWeight: 600 }}>{code}</Tag>
      ),
    },
    {
      title: 'Compliance',
      dataIndex: 'compliance_status',
      key: 'compliance_status',
      width: 120,
      render: (status: string) => (
        <Tag color={getComplianceColor(status)} icon={
          status === 'verified' ? <CheckCircleOutlined /> :
          status === 'expired' ? <CloseCircleOutlined /> :
          <WarningOutlined />
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'RC Expiry',
      dataIndex: 'rc_expiry',
      key: 'rc_expiry',
      width: 120,
      render: (date: string) => {
        const isExpiringSoon = dayjs(date).diff(dayjs(), 'day') < 30;
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <Tooltip title={dayjs(date).format('DD MMM YYYY')}>
            <span style={{
              color: isExpired ? '#EF4444' : isExpiringSoon ? '#F59E0B' : textPrimary,
              fontWeight: isExpired || isExpiringSoon ? 600 : 400,
            }}>
              {dayjs(date).format('DD MMM YY')}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Insurance',
      dataIndex: 'insurance_expiry',
      key: 'insurance_expiry',
      width: 120,
      render: (date: string) => {
        const isExpiringSoon = dayjs(date).diff(dayjs(), 'day') < 30;
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <Tooltip title={dayjs(date).format('DD MMM YYYY')}>
            <span style={{
              color: isExpired ? '#EF4444' : isExpiringSoon ? '#F59E0B' : textPrimary,
              fontWeight: isExpired || isExpiringSoon ? 600 : 400,
            }}>
              {dayjs(date).format('DD MMM YY')}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Total Trips',
      dataIndex: 'total_trips',
      key: 'total_trips',
      width: 100,
      align: 'right' as const,
      render: (trips: number) => (
        <span style={{ color: textPrimary, fontWeight: 600 }}>{trips}</span>
      ),
    },
    {
      title: 'Last Trip',
      dataIndex: 'last_trip_date',
      key: 'last_trip_date',
      width: 120,
      render: (date: string | null) => (
        date ? (
          <Tooltip title={dayjs(date).format('DD MMM YYYY, HH:mm')}>
            <span style={{ color: textSecondary }}>{dayjs(date).fromNow()}</span>
          </Tooltip>
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
            <CarOutlined style={{ marginRight: '12px' }} />
            Fleet Management
          </h1>
          <div style={{ color: textSecondary, fontSize: '14px', marginTop: '4px' }}>
            Truck compliance, verification, and operational control
          </div>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}>
          <Space wrap>
            <Input
              placeholder="Search registration, operator, truck ID..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              allowClear
            />
            <Select
              placeholder="Compliance Status"
              style={{ width: 160 }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
              options={[
                { label: 'Verified', value: 'verified' },
                { label: 'Pending', value: 'pending' },
                { label: 'Expired', value: 'expired' },
                { label: 'Blocked', value: 'blocked' },
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
                <Button icon={<DownloadOutlined />}>Export Selected</Button>
                <Button onClick={() => setSelectedRowKeys([])}>Clear</Button>
              </Space>
            </div>
          </Card>
        )}

        {/* Trucks Table */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Table
            columns={columns}
            dataSource={trucks}
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
              showTotal: (total) => `Total ${total} trucks`,
            }}
            onChange={(pagination) => {
              setFilters(prev => ({
                ...prev,
                page: pagination.current || 1,
                limit: pagination.pageSize || 25,
              }));
            }}
            scroll={{ x: 1400 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default TrucksListPage;
