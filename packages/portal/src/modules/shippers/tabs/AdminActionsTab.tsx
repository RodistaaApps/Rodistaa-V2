/**
 * Admin Actions Tab
 * Shows all admin-level actions: Impersonate, Export, Block, Franchise Assignment, Notes
 */

import { useState } from 'react';
import { Card, Button, Space, Modal, Input, Select, message, Form } from 'antd';
import {
  UserSwitchOutlined,
  DownloadOutlined,
  StopOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ShipperDetail } from '../types';

const { TextArea } = Input;

interface AdminActionsTabProps {
  shipper: ShipperDetail;
  theme?: 'light' | 'dark';
}

export function AdminActionsTab({ shipper, theme = 'dark' }: AdminActionsTabProps) {
  const [impersonateModal, setImpersonateModal] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [franchiseModal, setFranchiseModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [form] = Form.useForm();

  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const isBlocked = false; // Mock status

  const handleImpersonate = async (values: any) => {
    try {
      // TODO: API call to create impersonation session
      message.success('Impersonation session started. Audit log created.');
      setImpersonateModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to start impersonation');
    }
  };

  const handleBlockToggle = async (values: any) => {
    try {
      // TODO: API call to block/unblock user
      message.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
      setBlockModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update user status');
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      // TODO: API call to export profile
      message.success(`Exporting profile as ${format.toUpperCase()}...`);
    } catch (error) {
      message.error('Export failed');
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Impersonate */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>
                <UserSwitchOutlined style={{ marginRight: '8px' }} />
                Impersonate User
              </div>
              <div style={{ fontSize: '13px', color: textSecondary }}>
                Log in as this shipper to debug issues. All actions will be logged.
              </div>
            </div>
            <Button
              type="primary"
              danger
              onClick={() => setImpersonateModal(true)}
            >
              Impersonate
            </Button>
          </div>
        </Card>

        {/* Export Profile */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>
                <DownloadOutlined style={{ marginRight: '8px' }} />
                Export Profile
              </div>
              <div style={{ fontSize: '13px', color: textSecondary }}>
                Download complete shipper profile with all associated data.
              </div>
            </div>
            <Space>
              <Button onClick={() => handleExport('json')}>Export JSON</Button>
              <Button onClick={() => handleExport('csv')}>Export CSV</Button>
            </Space>
          </div>
        </Card>

        {/* Assign Franchise */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>
                <TeamOutlined style={{ marginRight: '8px' }} />
                Assign / Change Franchise
              </div>
              <div style={{ fontSize: '13px', color: textSecondary }}>
                Current: <strong>{shipper.franchise}</strong>
              </div>
            </div>
            <Button onClick={() => setFranchiseModal(true)}>Change Franchise</Button>
          </div>
        </Card>

        {/* Add Internal Note */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>
                <FileTextOutlined style={{ marginRight: '8px' }} />
                Internal Note
              </div>
              <div style={{ fontSize: '13px', color: textSecondary }}>
                Add an internal note visible only to admins and franchise managers.
              </div>
            </div>
            <Button onClick={() => setNoteModal(true)}>Add Note</Button>
          </div>
        </Card>

        {/* Block / Unblock */}
        <Card style={{ background: bgCard, border: `2px solid ${isBlocked ? '#F59E0B' : '#EF4444'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>
                {isBlocked ? <CheckCircleOutlined style={{ marginRight: '8px', color: '#10B981' }} /> : <StopOutlined style={{ marginRight: '8px', color: '#EF4444' }} />}
                {isBlocked ? 'Unblock User' : 'Block User'}
              </div>
              <div style={{ fontSize: '13px', color: textSecondary }}>
                {isBlocked
                  ? 'This user is currently blocked and cannot access the platform.'
                  : 'Block this user from accessing the platform. Requires mandatory reason.'}
              </div>
            </div>
            <Button
              danger={!isBlocked}
              type={isBlocked ? 'primary' : 'default'}
              onClick={() => setBlockModal(true)}
              style={isBlocked ? { background: '#10B981', borderColor: '#10B981' } : {}}
            >
              {isBlocked ? 'Unblock' : 'Block User'}
            </Button>
          </div>
        </Card>
      </Space>

      {/* Modals */}
      <Modal
        title="Impersonate User"
        open={impersonateModal}
        onCancel={() => { setImpersonateModal(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleImpersonate}>
          <div style={{ marginBottom: '16px', padding: '12px', background: '#EF444420', border: '1px solid #EF4444', borderRadius: '6px' }}>
            <strong>⚠️ Warning:</strong> Impersonating a user is a sensitive action. All activities will be logged in the audit trail.
          </div>

          <Form.Item name="reason" label="Reason for Impersonation" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Enter reason (required for audit)..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setImpersonateModal(false)} style={{ marginRight: '8px' }}>Cancel</Button>
            <Button type="primary" htmlType="submit" danger>Start Impersonation</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${isBlocked ? 'Unblock' : 'Block'} User`}
        open={blockModal}
        onCancel={() => { setBlockModal(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleBlockToggle}>
          <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Enter reason (required)..." />
          </Form.Item>

          {!isBlocked && (
            <Form.Item name="duration" label="Duration">
              <Select
                options={[
                  { label: 'Permanent', value: 'permanent' },
                  { label: '7 Days', value: '7d' },
                  { label: '30 Days', value: '30d' },
                  { label: '90 Days', value: '90d' },
                ]}
              />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setBlockModal(false)} style={{ marginRight: '8px' }}>Cancel</Button>
            <Button type="primary" htmlType="submit" danger={!isBlocked} style={isBlocked ? { background: '#10B981', borderColor: '#10B981' } : {}}>
              Confirm {isBlocked ? 'Unblock' : 'Block'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

