/**
 * Operators List Component
 * Production-grade table with filters, sorting, pagination
 */

import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Tag, Space, Badge, Tooltip, Dropdown, InputNumber } from 'antd';
import { 
  EyeOutlined, 
  MessageOutlined, 
  DownloadOutlined, 
  MoreOutlined,
  SearchOutlined,
  FilterOutlined,
  WarningOutlined,
  CarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { Operator, OperatorsListParams } from './types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface OperatorsListProps {
  theme?: 'light' | 'dark';
  onViewOperator?: (operatorId: string) => void;
}

export function OperatorsList({ theme = 'dark', onViewOperator }: OperatorsListProps) {
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<OperatorsListParams>({
    limit: 25,
    offset: 0,
    sort: 'last_active',
    order: 'desc',
  });

  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const bgCard = isDark ? '#151922' : '#FFFFFF';

  // Mock data for development
  const mockOperators: Operator[] = [
    {
      id: 'USR-30321',
      role: 'operator',
      name: 'Suresh Logistics',
      mobile: '+911234561234',
      franchise: 'Hyderabad – Unit 1',
      city: 'Hyderabad',
      state: 'Telangana',
      trucks: { total: 10, active: 8, blocked: 1 },
      active_bids: 4,
      pending_inspections: 2,
      ledger_balance: 75200.0,
      acs_flags_count: 1,
      last_active: '2025-12-04T10:12:00Z',
      trust_score: 78,
    },
    {
      id: 'USR-30322',
      role: 'operator',
      name: 'Rajesh Kumar Transport',
      mobile: '+919876543210',
      franchise: 'Vijayawada – Unit 2',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      trucks: { total: 5, active: 5, blocked: 0 },
      active_bids: 2,
      pending_inspections: 0,
      ledger_balance: 45500.5,
      acs_flags_count: 0,
      last_active: '2025-12-03T14:30:00Z',
      trust_score: 92,
    },
    {
      id: 'USR-30323',
      role: 'operator',
      name: 'Krishna Fleet Services',
      mobile: '+919123456789',
      franchise: 'Guntur – HQ',
      city: 'Guntur',
      state: 'Andhra Pradesh',
      trucks: { total: 25, active: 22, blocked: 2 },
      active_bids: 8,
      pending_inspections: 3,
      ledger_balance: -12000.0,
      acs_flags_count: 2,
      last_active: '2025-12-04T09:45:00Z',
      trust_score: 65,
    },
  ];

  useEffect(() => {
    fetchOperators();
  }, [params]);

  const fetchOperators = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/users?role=operator&${new URLSearchParams(params as any)}`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setOperators(mockOperators);
      setTotal(mockOperators.length);
    } catch (error) {
      console.error('Failed to fetch operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const maskMobile = (mobile: string) => {
    if (!mobile) return '';
    return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1••••$2');
  };

  const formatRelativeTime = (timestamp: string) => {
    return dayjs(timestamp).fromNow();
  };

  const columns = [
    {
      title: 'User ID / Role',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (id: string) => (
        <div>
          <div style={{ fontFamily: 'monospace', fontWeight: 600, color: textPrimary }}>{id}</div>
          <Tag color="green" style={{ fontSize: '11px', marginTop: '4px' }}>Operator</Tag>
        </div>
      ),
    },
    {
      title: 'Name & Mobile',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: true,
      render: (name: string, record: Operator) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>{name}</div>
          <div style={{ fontSize: '12px', color: textSecondary }}>{maskMobile(record.mobile)}</div>
        </div>
      ),
    },
    {
      title: 'Franchise',
      dataIndex: 'franchise',
      key: 'franchise',
      width: 180,
      render: (franchise: string) => (
        <span style={{ color: textPrimary }}>{franchise}</span>
      ),
    },
    {
      title: 'City, State',
      key: 'location',
      width: 160,
      render: (_: any, record: Operator) => (
        <span style={{ color: textPrimary }}>{record.city}, {record.state}</span>
      ),
    },
    {
      title: 'Trucks',
      key: 'trucks',
      width: 120,
      sorter: true,
      render: (_: any, record: Operator) => (
        <div style={{ fontSize: '13px' }}>
          <Tooltip title={`Total: ${record.trucks.total}, Active: ${record.trucks.active}, Blocked: ${record.trucks.blocked}`}>
            <span style={{ color: textSecondary }}>
              <span style={{ color: textPrimary, fontWeight: 600 }}>T:{record.trucks.total}</span>
              {' • '}
              <span style={{ color: '#10B981' }}>A:{record.trucks.active}</span>
              {' • '}
              <span style={{ color: '#EF4444' }}>B:{record.trucks.blocked}</span>
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Active Bids',
      dataIndex: 'active_bids',
      key: 'active_bids',
      width: 110,
      align: 'center' as const,
      sorter: true,
      render: (bids: number) => (
        <span style={{ 
          fontWeight: 600, 
          color: bids > 0 ? '#3B82F6' : textSecondary,
          cursor: bids > 0 ? 'pointer' : 'default',
        }}>
          {bids}
        </span>
      ),
    },
    {
      title: 'Inspections',
      dataIndex: 'pending_inspections',
      key: 'pending_inspections',
      width: 110,
      align: 'center' as const,
      render: (count: number) => (
        count > 0 ? (
          <Tooltip title={`${count} pending inspection${count > 1 ? 's' : ''}`}>
            <Badge 
              count={count} 
              style={{ backgroundColor: '#F59E0B', cursor: 'pointer' }}
            >
              <FileTextOutlined style={{ color: '#F59E0B', fontSize: '18px' }} />
            </Badge>
          </Tooltip>
        ) : (
          <span style={{ color: textSecondary }}>—</span>
        )
      ),
    },
    {
      title: 'Ledger Balance',
      dataIndex: 'ledger_balance',
      key: 'ledger_balance',
      width: 140,
      align: 'right' as const,
      sorter: true,
      render: (balance: number) => (
        <span 
          style={{ 
            fontWeight: 600, 
            color: balance < 0 ? '#EF4444' : '#10B981',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open ledger modal
          }}
        >
          ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'ACS',
      dataIndex: 'acs_flags_count',
      key: 'acs_flags_count',
      width: 80,
      align: 'center' as const,
      render: (count: number) => (
        count > 0 ? (
          <Tooltip title="Click to view ACS flags">
            <Badge 
              count={count} 
              style={{ backgroundColor: '#EF4444', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Open ACS modal
              }}
            >
              <WarningOutlined style={{ color: '#EF4444', fontSize: '18px' }} />
            </Badge>
          </Tooltip>
        ) : (
          <span style={{ color: textSecondary }}>—</span>
        )
      ),
    },
    {
      title: 'Last Active',
      dataIndex: 'last_active',
      key: 'last_active',
      width: 120,
      sorter: true,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format('DD MMM YYYY, HH:mm')}>
          <span style={{ color: textSecondary }}>{formatRelativeTime(timestamp)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      fixed: 'right' as const,
      render: (_: any, record: Operator) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewOperator?.(record.id)}
            />
          </Tooltip>
          <Tooltip title="Message">
            <Button
              type="text"
              size="small"
              icon={<MessageOutlined />}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'export', label: 'Export Profile', icon: <DownloadOutlined /> },
                { key: 'impersonate', label: 'Impersonate', danger: true },
                { key: 'assign', label: 'Assign Franchise' },
                { key: 'notes', label: 'Add Note' },
                { key: 'transfer', label: 'Transfer Trucks' },
              ],
            }}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setParams(prev => ({
      ...prev,
      offset: (pagination.current - 1) * pagination.pageSize,
      limit: pagination.pageSize,
      sort: sorter.field || prev.sort,
      order: sorter.order === 'ascend' ? 'asc' : 'desc',
    }));
  };

  return (
    <div>
      {/* Filters Bar */}
      <div style={{ 
        marginBottom: '16px', 
        padding: '16px', 
        background: bgCard,
        borderRadius: '8px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <Input
          placeholder="Search by ID, Name, Mobile, or Truck Reg"
          prefix={<SearchOutlined style={{ color: textSecondary }} />}
          style={{ width: 320 }}
          value={params.search}
          onChange={(e) => setParams(prev => ({ ...prev, search: e.target.value, offset: 0 }))}
        />
        <Select
          placeholder="Franchise"
          style={{ width: 180 }}
          allowClear
          value={params.franchise}
          onChange={(value) => setParams(prev => ({ ...prev, franchise: value, offset: 0 }))}
          options={[
            { label: 'Hyderabad – Unit 1', value: 'hyd-u1' },
            { label: 'Vijayawada – Unit 2', value: 'vij-u2' },
            { label: 'Guntur – HQ', value: 'gun-hq' },
          ]}
        />
        <Select
          placeholder="City"
          style={{ width: 140 }}
          allowClear
          value={params.city}
          onChange={(value) => setParams(prev => ({ ...prev, city: value, offset: 0 }))}
          options={[
            { label: 'Hyderabad', value: 'hyderabad' },
            { label: 'Vijayawada', value: 'vijayawada' },
            { label: 'Guntur', value: 'guntur' },
            { label: 'Kurnool', value: 'kurnool' },
          ]}
        />
        <Select
          placeholder="Pending Inspections"
          style={{ width: 180 }}
          allowClear
          value={params.has_pending_inspections}
          onChange={(value) => setParams(prev => ({ ...prev, has_pending_inspections: value, offset: 0 }))}
          options={[
            { label: 'With Pending', value: true },
            { label: 'Without Pending', value: false },
          ]}
        />
        <InputNumber
          placeholder="Min Trucks"
          style={{ width: 130 }}
          min={0}
          value={params.min_trucks}
          onChange={(value) => setParams(prev => ({ ...prev, min_trucks: value || undefined, offset: 0 }))}
        />
        <Button 
          icon={<FilterOutlined />}
          onClick={() => setParams({ limit: 25, offset: 0, sort: 'last_active', order: 'desc' })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={operators}
        rowKey="id"
        loading={loading}
        pagination={{
          current: (params.offset || 0) / (params.limit || 25) + 1,
          pageSize: params.limit || 25,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total) => `Total ${total} operators`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1400 }}
      />
    </div>
  );
}

