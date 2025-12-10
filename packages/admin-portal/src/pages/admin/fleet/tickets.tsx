/**
 * Tickets Queue Page
 * 
 * HQ ticket management with:
 * - Priority filtering (P0/P1/P2/P3)
 * - Status filtering (Open, In Progress, Resolved)
 * - SLA countdown indicators
 * - Bulk assignment
 * - Quick resolve modal
 * - Assignment workflow
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Table, Select, Button, Tag, Space, Card, Badge, Tooltip, Modal, Input, message } from 'antd';
import {
  FilterOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import type { Ticket, TicketListParams } from '@/modules/fleet/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;

const TicketsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolutionType, setResolutionType] = useState<string>('FIXED');
  const [params, setParams] = useState<TicketListParams>({
    page: 1,
    limit: 25,
    sort: 'created_at',
    order: 'desc',
  });

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  useEffect(() => {
    fetchTickets();
  }, [params]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from /admin/tickets
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockTickets: Ticket[] = [
        {
          id: 'TKT-001',
          ticket_type: 'PROVIDER_MISMATCH',
          priority: 'P1',
          status: 'OPEN',
          title: 'Provider mismatch for DL01AB1234',
          description: 'VAHAN and Surepass disagree on vehicle_category',
          resource_type: 'truck',
          resource_id: 'DL01AB1234',
          created_by: 'SYSTEM',
          assigned_to: 'ADM-002',
          resolved_by: null,
          sla_due_at: '2025-12-06T10:00:00Z',
          resolved_at: null,
          escalated_at: null,
          resolution: null,
          resolution_type: null,
          metadata: {},
          tags: ['provider-mismatch'],
          created_at: '2025-12-05T10:00:00Z',
          updated_at: '2025-12-05T10:00:00Z',
          is_sla_breached: false,
          time_until_sla: '24h',
        },
        {
          id: 'TKT-002',
          ticket_type: 'DUPLICATE_CHASSIS',
          priority: 'P0',
          status: 'IN_PROGRESS',
          title: 'Duplicate chassis detected',
          description: '2 vehicles with same chassis hash',
          resource_type: 'truck',
          resource_id: 'HR26BX5678',
          created_by: 'SYSTEM',
          assigned_to: 'ADM-001',
          resolved_by: null,
          sla_due_at: '2025-12-05T14:00:00Z',
          resolved_at: null,
          escalated_at: null,
          resolution: null,
          resolution_type: null,
          metadata: {},
          tags: ['duplicate', 'urgent'],
          created_at: '2025-12-05T10:00:00Z',
          updated_at: '2025-12-05T11:30:00Z',
          is_sla_breached: true,
          time_until_sla: '-2h',
        },
      ];

      setTickets(mockTickets);
      setTotal(45);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    return { P0: 'red', P1: 'orange', P2: 'blue', P3: 'default' }[priority] || 'default';
  };

  const getStatusColor = (status: string) => {
    return {
      OPEN: 'blue',
      IN_PROGRESS: 'orange',
      RESOLVED: 'green',
      ESCALATED: 'red',
      CLOSED: 'default',
    }[status] || 'default';
  };

  const handleResolve = async () => {
    if (!selectedTicket || !resolution.trim()) return;

    try {
      // TODO: Call resolve API
      console.log('Resolve ticket:', selectedTicket.id, resolution, resolutionType);
      message.success('Ticket resolved successfully');
      setResolveModalOpen(false);
      setResolution('');
      fetchTickets();
    } catch (error) {
      message.error('Failed to resolve ticket');
    }
  };

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left' as const,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1890ff', cursor: 'pointer' }}>
          {id}
        </span>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 90,
      render: (priority: string, record: Ticket) => (
        <Space>
          <Tag color={getPriorityColor(priority)}>{priority}</Tag>
          {record.is_sla_breached && (
            <WarningOutlined style={{ color: '#EF4444' }} />
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (title: string, record: Ticket) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>{title}</div>
          <div style={{ fontSize: '12px', color: textSecondary }}>
            {record.ticket_type.replace(/_/g, ' ')}
          </div>
        </div>
      ),
    },
    {
      title: 'Resource',
      key: 'resource',
      width: 150,
      render: (_: any, record: Ticket) => (
        <div>
          <div style={{ fontSize: '11px', color: textSecondary }}>{record.resource_type}</div>
          <a 
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
            onClick={() => {
              if (record.resource_type === 'truck') {
                router.push(`/admin/fleet/trucks/${record.resource_id}`);
              }
            }}
          >
            {record.resource_id}
          </a>
        </div>
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      width: 120,
      render: (assignedTo: string | null) => (
        assignedTo ? (
          <Tag icon={<UserOutlined />}>{assignedTo}</Tag>
        ) : (
          <span style={{ color: textSecondary }}>Unassigned</span>
        )
      ),
    },
    {
      title: 'SLA Due',
      dataIndex: 'sla_due_at',
      key: 'sla_due_at',
      width: 140,
      render: (slaDue: string, record: Ticket) => {
        const now = dayjs();
        const due = dayjs(slaDue);
        const isBreached = now.isAfter(due);
        const timeUntil = due.fromNow();

        return (
          <Tooltip title={due.format('DD MMM YYYY, HH:mm')}>
            <div>
              <ClockCircleOutlined 
                style={{ 
                  marginRight: '4px',
                  color: isBreached ? '#EF4444' : textSecondary,
                }} 
              />
              <span style={{ 
                color: isBreached ? '#EF4444' : textSecondary,
                fontWeight: isBreached ? 600 : 400,
              }}>
                {timeUntil}
              </span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format('DD MMM YYYY, HH:mm')}>
          <span style={{ color: textSecondary }}>{dayjs(timestamp).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Ticket) => (
        <Space>
          {record.status === 'OPEN' || record.status === 'IN_PROGRESS' ? (
            <Button 
              size="small" 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setSelectedTicket(record);
                setResolveModalOpen(true);
              }}
            >
              Resolve
            </Button>
          ) : (
            <Tag color="green">Resolved</Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout theme={theme} toggleTheme={toggleTheme}>
      <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
              <FileTextOutlined style={{ marginRight: '12px' }} />
              Tickets Queue
            </h1>
            <div style={{ color: textSecondary, fontSize: '14px', marginTop: '4px' }}>
              HQ ticket management and SLA tracking
            </div>
          </div>
          <Button type="primary" icon={<FileTextOutlined />}>
            Create Ticket
          </Button>
        </div>

        {/* Filters */}
        <Card 
          style={{ 
            marginBottom: '16px', 
            background: bgCard, 
            border: `1px solid ${border}` 
          }}
        >
          <Space wrap>
            <Select
              placeholder="Status"
              style={{ width: 150 }}
              allowClear
              value={params.status}
              onChange={(value) => setParams(prev => ({ ...prev, status: value, page: 1 }))}
              options={[
                { label: 'Open', value: 'OPEN' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Resolved', value: 'RESOLVED' },
                { label: 'Escalated', value: 'ESCALATED' },
              ]}
            />
            
            <Select
              placeholder="Priority"
              style={{ width: 120 }}
              allowClear
              value={params.priority}
              onChange={(value) => setParams(prev => ({ ...prev, priority: value, page: 1 }))}
              options={[
                { label: 'P0 (Critical)', value: 'P0' },
                { label: 'P1 (High)', value: 'P1' },
                { label: 'P2 (Medium)', value: 'P2' },
                { label: 'P3 (Low)', value: 'P3' },
              ]}
            />

            <Select
              placeholder="Assigned To"
              style={{ width: 150 }}
              allowClear
              value={params.assignedTo}
              onChange={(value) => setParams(prev => ({ ...prev, assignedTo: value, page: 1 }))}
              options={[
                { label: 'Assigned to Me', value: 'me' },
                { label: 'Unassigned', value: 'unassigned' },
                { label: 'ADM-001', value: 'ADM-001' },
                { label: 'ADM-002', value: 'ADM-002' },
              ]}
            />

            <Select
              placeholder="SLA Status"
              style={{ width: 140 }}
              allowClear
              value={params.slaBreached}
              onChange={(value) => setParams(prev => ({ ...prev, slaBreached: value, page: 1 }))}
              options={[
                { label: 'SLA Breached', value: true },
                { label: 'Within SLA', value: false },
              ]}
            />

            <Button 
              icon={<FilterOutlined />}
              onClick={() => setParams({ page: 1, limit: 25, sort: 'created_at', order: 'desc' })}
            >
              Clear Filters
            </Button>
          </Space>
        </Card>

        {/* Bulk Assign Toolbar */}
        {selectedRowKeys.length > 0 && (
          <Card 
            style={{ 
              marginBottom: '16px', 
              background: bgCard, 
              border: `1px solid ${border}` 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Badge count={selectedRowKeys.length} style={{ backgroundColor: '#3B82F6' }}>
                  <span style={{ color: textPrimary, fontWeight: 600, paddingRight: '20px' }}>
                    Selected
                  </span>
                </Badge>
              </div>
              <Space>
                <Select
                  placeholder="Assign to..."
                  style={{ width: 180 }}
                  onChange={(value) => {
                    // TODO: Bulk assign
                    console.log('Bulk assign to:', value);
                  }}
                  options={[
                    { label: 'ADM-001 (SuperAdmin)', value: 'ADM-001' },
                    { label: 'ADM-002 (Compliance)', value: 'ADM-002' },
                  ]}
                />
                <Button onClick={() => setSelectedRowKeys([])}>
                  Clear Selection
                </Button>
              </Space>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Table
            columns={columns}
            dataSource={tickets}
            rowKey="id"
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys as string[]),
            }}
            pagination={{
              current: params.page,
              pageSize: params.limit,
              total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100'],
              showTotal: (total) => `Total ${total} tickets`,
            }}
            onChange={(pagination, filters, sorter: any) => {
              setParams(prev => ({
                ...prev,
                page: pagination.current || 1,
                limit: pagination.pageSize || 25,
                sort: sorter.field || prev.sort,
                order: sorter.order === 'ascend' ? 'asc' : 'desc',
              }));
            }}
            scroll={{ x: 1400 }}
          />
        </Card>

        {/* Resolve Modal */}
        <Modal
          open={resolveModalOpen}
          title={`Resolve Ticket: ${selectedTicket?.id}`}
          onCancel={() => {
            setResolveModalOpen(false);
            setResolution('');
          }}
          footer={
            <Space>
              <Button onClick={() => setResolveModalOpen(false)}>Cancel</Button>
              <Button 
                type="primary" 
                onClick={handleResolve}
                disabled={!resolution.trim() || resolution.length < 20}
              >
                Resolve Ticket
              </Button>
            </Space>
          }
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Resolution Type
            </label>
            <Select
              style={{ width: '100%' }}
              value={resolutionType}
              onChange={setResolutionType}
              options={[
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Rejected', value: 'REJECTED' },
                { label: 'Fixed', value: 'FIXED' },
                { label: 'No Action Needed', value: 'NO_ACTION_NEEDED' },
              ]}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Resolution Notes <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <TextArea
              rows={6}
              placeholder="Enter detailed resolution notes (minimum 20 characters)"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              maxLength={2000}
              showCount
            />
            {resolution.length > 0 && resolution.length < 20 && (
              <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                Resolution notes must be at least 20 characters
              </div>
            )}
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default TicketsPage;

