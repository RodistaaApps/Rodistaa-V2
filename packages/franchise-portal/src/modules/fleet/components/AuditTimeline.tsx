/**
 * AuditTimeline Component
 * 
 * Visual timeline of audit events with filters and export capability.
 * Shows admin actions, system events, and timestamps.
 */

import { Timeline, Card, Tag, Space, Button, Select, DatePicker } from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  RobotOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  LinkOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { AuditLog } from '../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface AuditTimelineProps {
  logs: AuditLog[];
  theme?: 'light' | 'dark';
  onFilter?: (actionType?: string, dateRange?: [Date, Date]) => void;
}

export function AuditTimeline({ logs, theme = 'dark', onFilter }: AuditTimelineProps) {
  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('BLOCK')) return <StopOutlined style={{ color: '#EF4444' }} />;
    if (actionType.includes('UNBLOCK')) return <CheckCircleOutlined style={{ color: '#10B981' }} />;
    if (actionType.includes('REVERIFY')) return <SyncOutlined style={{ color: '#3B82F6' }} />;
    if (actionType.includes('LINK')) return <LinkOutlined style={{ color: '#8B5CF6' }} />;
    if (actionType.includes('TICKET')) return <FileTextOutlined style={{ color: '#F59E0B' }} />;
    return <ClockCircleOutlined style={{ color: textSecondary }} />;
  };

  const getActionColor = (actionType: string) => {
    if (actionType.includes('BLOCK')) return '#EF4444';
    if (actionType.includes('UNBLOCK')) return '#10B981';
    if (actionType.includes('REVERIFY')) return '#3B82F6';
    if (actionType.includes('LINK')) return '#8B5CF6';
    return '#6B7280';
  };

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const timelineItems = logs.map(log => ({
    dot: getActionIcon(log.action_type),
    color: getActionColor(log.action_type),
    children: (
      <Card 
        size="small" 
        style={{ 
          background: bgCard, 
          border: `1px solid ${border}`,
          marginBottom: '8px',
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          <Space>
            <Tag color={log.admin_id === 'SYSTEM' ? 'default' : 'blue'}>
              {log.admin_id === 'SYSTEM' ? <RobotOutlined /> : <UserOutlined />}
              {log.admin_name || log.admin_id}
            </Tag>
            <Tag>{formatActionType(log.action_type)}</Tag>
            {log.txn_id && (
              <Tag style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                {log.txn_id}
              </Tag>
            )}
          </Space>
        </div>

        {log.payload?.reason && (
          <div style={{ 
            color: textSecondary, 
            fontSize: '13px', 
            marginBottom: '8px',
            fontStyle: 'italic',
          }}>
            "{log.payload.reason}"
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: textSecondary, fontSize: '12px' }}>
            <ClockCircleOutlined style={{ marginRight: '4px' }} />
            {dayjs(log.created_at).format('DD MMM YYYY, HH:mm')}
            {' • '}
            {dayjs(log.created_at).fromNow()}
          </div>
          {log.ip_address && (
            <div style={{ color: textSecondary, fontSize: '11px', fontFamily: 'monospace' }}>
              IP: {log.ip_address}
            </div>
          )}
        </div>

        {log.correlation_id && (
          <div style={{ 
            marginTop: '8px', 
            paddingTop: '8px', 
            borderTop: `1px solid ${border}`,
            fontSize: '11px',
            color: textSecondary,
          }}>
            Part of bulk operation: {log.correlation_id}
          </div>
        )}
      </Card>
    ),
  }));

  return (
    <div>
      {onFilter && (
        <Card 
          size="small" 
          style={{ 
            marginBottom: '16px', 
            background: bgCard, 
            border: `1px solid ${border}` 
          }}
        >
          <Space wrap>
            <Select
              placeholder="Filter by action"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => onFilter(value)}
              options={[
                { label: 'All Actions', value: undefined },
                { label: 'Block Events', value: 'BLOCK' },
                { label: 'Unblock Events', value: 'UNBLOCK' },
                { label: 'Reverify Events', value: 'REVERIFY' },
                { label: 'Ticket Events', value: 'TICKET' },
                { label: 'Trailer Events', value: 'TRAILER' },
              ]}
            />
            <DatePicker.RangePicker
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  onFilter(undefined, [dates[0].toDate(), dates[1].toDate()]);
                }
              }}
            />
          </Space>
        </Card>
      )}

      {logs.length === 0 ? (
        <Card style={{ background: bgCard, border: `1px solid ${border}`, textAlign: 'center', padding: '40px' }}>
          <div style={{ color: textSecondary }}>
            <ClockCircleOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
            <div>No audit events found</div>
          </div>
        </Card>
      ) : (
        <Timeline mode="left" items={timelineItems} />
      )}
    </div>
  );
}

