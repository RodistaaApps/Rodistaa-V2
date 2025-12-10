/**
 * ACS / Risk Tab
 * Shows ACS flags with severity, evidence, and admin actions
 */

import { Card, Tag, Space, Button, Modal, Input, message } from 'antd';
import { WarningOutlined, CheckCircleOutlined, ArrowUpOutlined } from '@ant-design/icons';
import type { ShipperDetail } from '../types';
import { useState } from 'react';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ACSTabProps {
  shipper: ShipperDetail;
  theme?: 'light' | 'dark';
}

export function ACSTab({ shipper, theme = 'dark' }: ACSTabProps) {
  const [actionModal, setActionModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [actionType, setActionType] = useState<'acknowledge' | 'escalate' | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const bgElevated = isDark ? '#1E2430' : '#F3F4F6';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626',
    };
    return colors[severity] || '#6B7280';
  };

  const handleAction = async () => {
    if (!actionNotes.trim()) {
      message.error('Please provide notes for this action');
      return;
    }

    try {
      // TODO: API call to record action
      message.success(`Flag ${actionType === 'acknowledge' ? 'acknowledged' : 'escalated'} successfully`);
      setActionModal(false);
      setActionNotes('');
      setSelectedFlag(null);
      setActionType(null);
    } catch (error) {
      message.error('Failed to process action');
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {shipper.acs_flags && shipper.acs_flags.length > 0 ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {shipper.acs_flags.map((flag) => (
            <Card
              key={flag.id}
              style={{
                background: bgCard,
                border: `2px solid ${getSeverityColor(flag.severity)}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <Space size="small" style={{ marginBottom: '8px' }}>
                    <Tag color={getSeverityColor(flag.severity)} style={{ fontWeight: 600 }}>
                      {flag.severity.toUpperCase()}
                    </Tag>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: textSecondary }}>
                      {flag.id}
                    </span>
                  </Space>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: textPrimary, marginBottom: '8px' }}>
                    {flag.summary}
                  </div>
                  <div style={{ fontSize: '13px', color: textSecondary }}>
                    Detected: {dayjs(flag.created_at).format('DD MMM YYYY, HH:mm')}
                  </div>
                  {flag.rule_id && (
                    <div style={{ fontSize: '12px', color: textSecondary, marginTop: '4px' }}>
                      Rule: {flag.rule_id}
                    </div>
                  )}
                </div>

                <Space>
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      setSelectedFlag(flag);
                      setActionType('acknowledge');
                      setActionModal(true);
                    }}
                    style={{ background: '#10B981', borderColor: '#10B981' }}
                  >
                    Acknowledge
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<ArrowUpOutlined />}
                    onClick={() => {
                      setSelectedFlag(flag);
                      setActionType('escalate');
                      setActionModal(true);
                    }}
                  >
                    Escalate
                  </Button>
                </Space>
              </div>

              {flag.evidence && (
                <div
                  style={{
                    padding: '12px',
                    background: bgElevated,
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: textPrimary,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>Evidence:</div>
                  <pre style={{ margin: 0, color: textSecondary, fontFamily: 'monospace', fontSize: '12px' }}>
                    {JSON.stringify(flag.evidence, null, 2)}
                  </pre>
                </div>
              )}
            </Card>
          ))}
        </Space>
      ) : (
        <Card style={{ background: bgCard, border: `1px solid ${border}`, textAlign: 'center', padding: '40px' }}>
          <CheckCircleOutlined style={{ fontSize: '48px', color: '#10B981', marginBottom: '16px' }} />
          <div style={{ fontSize: '16px', color: textPrimary, marginBottom: '8px' }}>
            No Active ACS Flags
          </div>
          <div style={{ fontSize: '14px', color: textSecondary }}>
            This shipper has no active risk or compliance flags.
          </div>
        </Card>
      )}

      <Modal
        title={`${actionType === 'acknowledge' ? 'Acknowledge' : 'Escalate'} ACS Flag`}
        open={actionModal}
        onCancel={() => {
          setActionModal(false);
          setActionNotes('');
          setSelectedFlag(null);
          setActionType(null);
        }}
        onOk={handleAction}
        okText={actionType === 'acknowledge' ? 'Acknowledge' : 'Escalate'}
        okButtonProps={{
          style: {
            background: actionType === 'acknowledge' ? '#10B981' : '#EF4444',
            borderColor: actionType === 'acknowledge' ? '#10B981' : '#EF4444',
          },
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: textPrimary }}>
            Flag: {selectedFlag?.summary}
          </div>
          <div style={{ fontSize: '13px', color: textSecondary }}>
            {actionType === 'acknowledge'
              ? 'Acknowledging this flag will mark it as reviewed. It will remain in the audit trail.'
              : 'Escalating this flag will notify the compliance team for further investigation.'}
          </div>
        </div>

        <TextArea
          rows={4}
          placeholder="Enter notes for this action (required)..."
          value={actionNotes}
          onChange={(e) => setActionNotes(e.target.value)}
          maxLength={500}
          showCount
        />

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#3B82F620',
          border: '1px solid #3B82F6',
          borderRadius: '6px',
          fontSize: '12px',
          color: textPrimary,
        }}>
          ℹ️ This action will be logged in the audit trail with your admin ID and timestamp.
        </div>
      </Modal>
    </div>
  );
}

