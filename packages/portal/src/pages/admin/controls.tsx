/**
 * Admin Controls Page - System configuration and operational controls
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Card, Button, Switch, Space, Tag, Tabs, Table, Modal, Input } from 'antd';
import { SettingOutlined, LockOutlined, ApiOutlined, FlagOutlined, BellOutlined, DatabaseOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;

function AdminControlsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [actionReason, setActionReason] = useState('');

  const handleMaintenanceToggle = (checked: boolean) => {
    setReasonModalVisible(true);
  };

  const confirmMaintenanceToggle = () => {
    if (!actionReason || actionReason.length < 10) {
      alert('Please provide a detailed reason (min 10 characters)');
      return;
    }
    setMaintenanceMode(!maintenanceMode);
    setReasonModalVisible(false);
    setActionReason('');
    alert(`Maintenance mode ${!maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
  };

  const mockSettings = [
    {
      key: 'MANDATE_RETRY_COUNT',
      label: 'UPI Mandate Retry Count',
      value: '3',
      category: 'PAYMENT',
      requires2FA: false,
    },
    {
      key: 'TRACKING_PING_INTERVAL',
      label: 'GPS Tracking Interval (seconds)',
      value: '60',
      category: 'TRACKING',
      requires2FA: false,
    },
    {
      key: 'CTL_EXPIRY_HOURS',
      label: 'CTL Expiry Hours',
      value: '72',
      category: 'COMPLIANCE',
      requires2FA: false,
    },
    {
      key: 'COMMISSION_HQ_PERCENTAGE',
      label: 'HQ Commission %',
      value: '40',
      category: 'PAYMENT',
      requires2FA: true,
    },
  ];

  const mockApiKeys = [
    {
      id: 'KEY-001',
      prefix: 'rod_live_1234...',
      label: 'Production Partner API',
      scope: 'READ_WRITE',
      rateLimit: '1000/min',
      lastUsed: '2025-12-04 10:30',
      status: 'ACTIVE',
    },
    {
      id: 'KEY-002',
      prefix: 'rod_test_5678...',
      label: 'Sandbox Testing',
      scope: 'READ_ONLY',
      rateLimit: '100/min',
      lastUsed: '2025-12-03 15:20',
      status: 'ACTIVE',
    },
  ];

  const mockFeatureFlags = [
    {
      key: 'CYM_ENABLED',
      label: 'Certified Yard Method',
      enabled: true,
      regions: ['KNL', 'VJA'],
      rollout: 100,
    },
    {
      key: 'RVA_ENABLED',
      label: 'Registered Verification Agency',
      enabled: false,
      regions: [],
      rollout: 0,
    },
  ];

  const settingsColumns = [
    {
      title: 'Setting',
      dataIndex: 'label',
      key: 'label',
      render: (label: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.key}</div>
        </div>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Security',
      dataIndex: 'requires2FA',
      key: 'requires2FA',
      render: (requires2FA: boolean) => (
        requires2FA ? <Tag color="red"><LockOutlined /> Requires 2FA</Tag> : <span>-</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button size="small">Edit</Button>
      ),
    },
  ];

  const apiKeyColumns = [
    { title: 'Key Prefix', dataIndex: 'prefix', key: 'prefix' },
    { title: 'Label', dataIndex: 'label', key: 'label' },
    { title: 'Scope', dataIndex: 'scope', key: 'scope', render: (s: string) => <Tag>{s}</Tag> },
    { title: 'Rate Limit', dataIndex: 'rateLimit', key: 'rateLimit' },
    { title: 'Last Used', dataIndex: 'lastUsed', key: 'lastUsed' },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" danger>Revoke</Button>
          <Button size="small">Rotate</Button>
        </Space>
      ),
    },
  ];

  const featureFlagColumns = [
    { title: 'Flag', dataIndex: 'label', key: 'label' },
    { 
      title: 'Status', 
      dataIndex: 'enabled', 
      key: 'enabled',
      render: (enabled: boolean) => <Tag color={enabled ? 'green' : 'red'}>{enabled ? 'ENABLED' : 'DISABLED'}</Tag>,
    },
    { 
      title: 'Regions', 
      dataIndex: 'regions', 
      key: 'regions',
      render: (regions: string[]) => regions.length > 0 ? regions.join(', ') : 'All',
    },
    { title: 'Rollout', dataIndex: 'rollout', key: 'rollout', render: (r: number) => `${r}%` },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Switch checked={record.enabled} onChange={() => alert('Toggle feature flag')} />
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Admin Controls</h1>

        {/* Critical Controls */}
        <Card title="🚨 Critical System Controls" style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fff3f3', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>Maintenance Mode</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Block all non-admin traffic during maintenance</div>
              </div>
              <Switch 
                checked={maintenanceMode} 
                onChange={handleMaintenanceToggle}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button icon={<DatabaseOutlined />}>Trigger Manual Backup</Button>
              <Button icon={<ApiOutlined />}>Test Webhook Delivery</Button>
              <Button icon={<BellOutlined />}>Send Test Notification</Button>
            </div>
          </Space>
        </Card>

        <Tabs defaultActiveKey="settings">
          <TabPane tab={<span><SettingOutlined /> Platform Settings</span>} key="settings">
            <Card>
              <Table
                columns={settingsColumns}
                dataSource={mockSettings}
                rowKey="key"
                pagination={false}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span><ApiOutlined /> API Keys</span>} key="apiKeys">
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <Button type="primary" style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>
                  Create New API Key
                </Button>
              </div>
              <Table
                columns={apiKeyColumns}
                dataSource={mockApiKeys}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span><FlagOutlined /> Feature Flags</span>} key="featureFlags">
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <Button type="primary" style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>
                  Create Feature Flag
                </Button>
              </div>
              <Table
                columns={featureFlagColumns}
                dataSource={mockFeatureFlags}
                rowKey="key"
                pagination={false}
              />
            </Card>
          </TabPane>
        </Tabs>

        <Modal
          title="Confirm Action"
          open={reasonModalVisible}
          onOk={confirmMaintenanceToggle}
          onCancel={() => setReasonModalVisible(false)}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>
              You are about to {maintenanceMode ? 'DISABLE' : 'ENABLE'} Maintenance Mode
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
              This will {maintenanceMode ? 'restore' : 'block'} access for all non-admin users.
            </div>
          </div>
          <TextArea
            rows={4}
            placeholder="Enter detailed reason for this action (min 10 characters)..."
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default AdminControlsPage;

