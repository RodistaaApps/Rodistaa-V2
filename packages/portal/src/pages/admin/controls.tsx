/**
 * Admin Controls - Theme-aware version
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Card, Button, Switch, Tabs, Table } from 'antd';
import { SettingOutlined, ApiOutlined, FlagOutlined, DatabaseOutlined } from '@ant-design/icons';

interface ControlsPageProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

function AdminControlsPage({ theme = 'dark', toggleTheme }: ControlsPageProps) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, marginBottom: '24px' }}>Admin Controls</h1>
          
          <Card title="Critical System Controls" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: isDark ? '#1E2430' : '#F3F4F6', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px', color: textPrimary }}>Maintenance Mode</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Block all non-admin traffic</div>
              </div>
              <Switch checked={maintenanceMode} onChange={setMaintenanceMode} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button icon={<DatabaseOutlined />}>Trigger Backup</Button>
              <Button icon={<ApiOutlined />}>Test Webhook</Button>
            </div>
          </Card>

          <Tabs defaultActiveKey="settings">
            <Tabs.TabPane tab={<span><SettingOutlined /> Settings</span>} key="settings">
              <Card><div style={{ color: textPrimary }}>Platform settings would be here</div></Card>
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span><ApiOutlined /> API Keys</span>} key="apiKeys">
              <Card><div style={{ color: textPrimary }}>API keys management would be here</div></Card>
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span><FlagOutlined /> Feature Flags</span>} key="featureFlags">
              <Card><div style={{ color: textPrimary }}>Feature flags would be here</div></Card>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default AdminControlsPage;
