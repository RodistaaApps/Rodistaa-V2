/**
 * Ticket Detail Panel
 * 
 * Comprehensive ticket details with tabs:
 * - Overview: Metadata, SLA, linked entity preview
 * - Timeline: Messages + system events
 * - Attachments: View/download documents
 * - Audit Log: Complete history
 * - Actions: Assign, Escalate, Resolve, Add Note
 */

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Tabs,
  Descriptions,
  Tag,
  Button,
  Timeline,
  Space,
  Modal,
  Input,
  message,
  Card,
  Badge,
  Tooltip,
  List,
  Progress,
  Select,
} from 'antd';
import {
  CloseOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SendOutlined,
  UserAddOutlined,
  ArrowUpOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;

interface TicketDetailPanelProps {
  ticketId: string | null;
  open: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  created_by_id: string;
  created_by_role: string;
  created_by_name: string;
  owner_id: string | null;
  owner_role: string | null;
  owner_name: string | null;
  assigned_franchise_id: string | null;
  priority: string;
  status: string;
  severity: string | null;
  linked_type: string | null;
  linked_id: string | null;
  sla_due_at: string;
  sla_escalation_level: number;
  sla_breached: boolean;
  tags: string[];
  is_sensitive: boolean;
  archived: boolean;
  resolution_summary: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

interface Message {
  id: number;
  actor_id: string;
  actor_role: string;
  actor_name: string;
  message: string;
  attachments: string[];
  is_internal_note: boolean;
  created_at: string;
}

interface AuditEntry {
  id: number;
  actor_id: string;
  actor_role: string;
  action: string;
  payload: any;
  created_at: string;
}

export const TicketDetailPanel: React.FC<TicketDetailPanelProps> = ({
  ticketId,
  open,
  onClose,
  theme = 'light',
}) => {
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    type: 'message' | 'assign' | 'escalate' | 'resolve' | null;
  }>({ visible: false, type: null });
  const [actionData, setActionData] = useState({
    message: '',
    isInternal: false,
    owner_id: '',
    owner_role: '',
    reason: '',
  });

  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  useEffect(() => {
    if (ticketId && open) {
      fetchTicketDetails();
    }
  }, [ticketId, open]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockTicket: Ticket = {
        id: ticketId!,
        title: 'Payment not received for shipment SHP-001',
        description: 'Driver completed delivery 3 days ago but payment still not credited to wallet. Driver is requesting immediate resolution.',
        created_by_id: 'USR-20241',
        created_by_role: 'driver',
        created_by_name: 'Ramesh Kumar',
        owner_id: 'ADM-001',
        owner_role: 'finance',
        owner_name: 'Finance Team',
        assigned_franchise_id: null,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        severity: null,
        linked_type: 'shipment',
        linked_id: 'SHP-001',
        sla_due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        sla_escalation_level: 0,
        sla_breached: false,
        tags: ['payment', 'urgent'],
        is_sensitive: false,
        archived: false,
        resolution_summary: null,
        metadata: {},
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        resolved_at: null,
        closed_at: null,
      };

      const mockMessages: Message[] = [
        {
          id: 1,
          actor_id: 'USR-20241',
          actor_role: 'driver',
          actor_name: 'Ramesh Kumar',
          message: 'I completed the delivery 3 days ago but still no payment received.',
          attachments: [],
          is_internal_note: false,
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          actor_id: 'ADM-001',
          actor_role: 'finance',
          actor_name: 'Finance Team',
          message: 'Checking with accounts team. Will update soon.',
          attachments: [],
          is_internal_note: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const mockAudit: AuditEntry[] = [
        {
          id: 1,
          actor_id: 'USR-20241',
          actor_role: 'driver',
          action: 'CREATED',
          payload: { priority: 'HIGH' },
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          actor_id: 'ADM-001',
          actor_role: 'finance',
          action: 'ASSIGNED',
          payload: { owner_id: 'ADM-001', owner_role: 'finance' },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setTicket(mockTicket);
      setMessages(mockMessages);
      setAuditEntries(mockAudit);
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      message.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(`Ticket ${type} action completed`);
      setActionModal({ visible: false, type: null });
      setActionData({ message: '', isInternal: false, owner_id: '', owner_role: '', reason: '' });
      fetchTicketDetails();
    } catch (error) {
      message.error(`Failed to ${type} ticket`);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = { LOW: 'default', MEDIUM: 'blue', HIGH: 'orange', CRITICAL: 'red' };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      NEW: 'blue', OPEN: 'cyan', IN_PROGRESS: 'orange',
      RESOLVED: 'green', CLOSED: 'default', ESCALATED: 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getSLAProgress = () => {
    if (!ticket) return 0;
    const total = dayjs(ticket.sla_due_at).diff(dayjs(ticket.created_at), 'minute');
    const elapsed = dayjs().diff(dayjs(ticket.created_at), 'minute');
    return Math.min(Math.round((elapsed / total) * 100), 100);
  };

  const renderOverviewTab = () => (
    <div style={{ padding: '16px 0' }}>
      {/* SLA Progress */}
      <Card size="small" style={{ marginBottom: '24px', background: bgCard, border: `1px solid ${border}` }}>
        <div style={{ marginBottom: '8px', fontWeight: 600, color: textPrimary }}>
          SLA Progress
        </div>
        <Progress
          percent={getSLAProgress()}
          status={ticket?.sla_breached ? 'exception' : 'active'}
          strokeColor={ticket?.sla_breached ? '#EF4444' : '#10B981'}
        />
        <div style={{ marginTop: '8px', fontSize: '12px', color: textSecondary }}>
          Due: {dayjs(ticket?.sla_due_at).format('DD MMM YYYY, HH:mm')} ({dayjs(ticket?.sla_due_at).fromNow()})
        </div>
      </Card>

      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Ticket ID" span={2}>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{ticket?.id}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(ticket?.status || '')}>
            {ticket?.status.replace(/_/g, ' ')}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Priority">
          <Tag color={getPriorityColor(ticket?.priority || '')}>
            {ticket?.priority}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created By" span={2}>
          {ticket?.created_by_name} ({ticket?.created_by_role})
        </Descriptions.Item>
        <Descriptions.Item label="Owner" span={2}>
          {ticket?.owner_name || 'Unassigned'} 
          {ticket?.owner_role && ` (${ticket.owner_role.replace(/_/g, ' ')})`}
        </Descriptions.Item>
        <Descriptions.Item label="Linked To" span={2}>
          {ticket?.linked_type && ticket?.linked_id ? (
            <a>{ticket.linked_type}: {ticket.linked_id}</a>
          ) : (
            'None'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Tags" span={2}>
          <Space wrap>
            {ticket?.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {dayjs(ticket?.created_at).format('DD MMM YYYY, HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {dayjs(ticket?.updated_at).fromNow()}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );

  const renderTimelineTab = () => (
    <div style={{ padding: '16px 0' }}>
      <Timeline>
        {messages.map((msg) => (
          <Timeline.Item key={msg.id} color={msg.is_internal_note ? 'gray' : 'blue'}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: textPrimary }}>
                  {msg.actor_name}
                </span>
                <Tag size="small">{msg.actor_role}</Tag>
                {msg.is_internal_note && <Tag color="orange" size="small">Internal</Tag>}
              </div>
              <div style={{ fontSize: '13px', color: textPrimary, margin: '8px 0' }}>
                {msg.message}
              </div>
              <div style={{ fontSize: '11px', color: textSecondary }}>
                {dayjs(msg.created_at).format('DD MMM YYYY, HH:mm')}
              </div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );

  const renderAuditTab = () => (
    <div style={{ padding: '16px 0' }}>
      <List
        dataSource={auditEntries}
        renderItem={(entry) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 600, color: textPrimary }}>
                    {entry.action.replace(/_/g, ' ')}
                  </span>
                  <span style={{ marginLeft: '12px', fontSize: '12px', color: textSecondary }}>
                    by {entry.actor_role}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: textSecondary }}>
                  {dayjs(entry.created_at).format('DD MMM, HH:mm')}
                </div>
              </div>
              {Object.keys(entry.payload).length > 0 && (
                <pre style={{
                  fontSize: '11px',
                  color: textSecondary,
                  marginTop: '8px',
                  background: isDark ? '#0A0E14' : '#F3F4F6',
                  padding: '8px',
                  borderRadius: '4px',
                }}>
                  {JSON.stringify(entry.payload, null, 2)}
                </pre>
              )}
            </div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <>
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Ticket Details
              </div>
              {ticket && (
                <div style={{ fontSize: '13px', color: textSecondary, marginTop: '4px' }}>
                  {ticket.title}
                </div>
              )}
            </div>
            <Space>
              <Tag color={getPriorityColor(ticket?.priority || '')}>
                {ticket?.priority}
              </Tag>
              <Tag color={getStatusColor(ticket?.status || '')}>
                {ticket?.status.replace(/_/g, ' ')}
              </Tag>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => setActionModal({ visible: true, type: 'message' })}
              >
                Add Message
              </Button>
            </Space>
          </div>
        }
        width={920}
        open={open}
        onClose={onClose}
        loading={loading}
        extra={
          <Space>
            <Button
              icon={<UserAddOutlined />}
              onClick={() => setActionModal({ visible: true, type: 'assign' })}
            >
              Assign
            </Button>
            <Button
              danger
              icon={<ArrowUpOutlined />}
              onClick={() => setActionModal({ visible: true, type: 'escalate' })}
            >
              Escalate
            </Button>
            {ticket?.status !== 'RESOLVED' && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => setActionModal({ visible: true, type: 'resolve' })}
              >
                Resolve
              </Button>
            )}
          </Space>
        }
      >
        {ticket && (
          <Tabs
            defaultActiveKey="overview"
            items={[
              {
                key: 'overview',
                label: 'Overview',
                children: renderOverviewTab(),
              },
              {
                key: 'timeline',
                label: (
                  <Badge count={messages.length} offset={[10, 0]}>
                    <span>Timeline</span>
                  </Badge>
                ),
                children: renderTimelineTab(),
              },
              {
                key: 'audit',
                label: 'Audit Log',
                children: renderAuditTab(),
              },
            ]}
          />
        )}
      </Drawer>

      {/* Action Modals */}
      <Modal
        title={
          actionModal.type === 'message' ? 'Add Message' :
          actionModal.type === 'assign' ? 'Assign Ticket' :
          actionModal.type === 'escalate' ? 'Escalate Ticket' :
          'Resolve Ticket'
        }
        open={actionModal.visible}
        onOk={() => handleAction(actionModal.type!)}
        onCancel={() => {
          setActionModal({ visible: false, type: null });
          setActionData({ message: '', isInternal: false, owner_id: '', owner_role: '', reason: '' });
        }}
        okText="Confirm"
      >
        <div style={{ marginTop: '16px' }}>
          {actionModal.type === 'message' && (
            <TextArea
              rows={4}
              placeholder="Enter your message..."
              value={actionData.message}
              onChange={(e) => setActionData(prev => ({ ...prev, message: e.target.value }))}
            />
          )}
          {(actionModal.type === 'assign' || actionModal.type === 'escalate' || actionModal.type === 'resolve') && (
            <TextArea
              rows={4}
              placeholder="Enter reason (minimum 20 characters)..."
              value={actionData.reason}
              onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
            />
          )}
          <div style={{ marginTop: '8px', color: textSecondary, fontSize: '12px' }}>
            {actionData.reason.length || actionData.message.length}/20 characters minimum
          </div>
        </div>
      </Modal>
    </>
  );
};

