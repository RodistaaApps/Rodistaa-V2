/**
 * Users Management - Theme-aware version
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space, Modal, Tabs, Select, Input } from 'antd';
import { EyeOutlined, UserOutlined, CheckCircleOutlined, StopOutlined, DownloadOutlined } from '@ant-design/icons';

const { Search } = Input;

interface UsersPageProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

function UsersManagementPage({ theme = 'dark', toggleTheme }: UsersPageProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';

  const mockUsers = [
    { id: 'SH-001', name: 'Krishna Enterprises', phone: '+919876543210', role: 'SHIPPER', kycStatus: 'VERIFIED', isActive: true, totalBookings: 45 },
    { id: 'OP-001', name: 'Rajesh Kumar Transport', phone: '+919876543211', role: 'OPERATOR', kycStatus: 'VERIFIED', isActive: true, totalTrucks: 12 },
    { id: 'DR-001', name: 'Ramesh Kumar', phone: '+919876543213', role: 'DRIVER', kycStatus: 'VERIFIED', isActive: true, totalTrips: 89 },
  ];

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>{id}</div>
          <Tag color={record.role === 'SHIPPER' ? 'blue' : record.role === 'OPERATOR' ? 'green' : 'orange'}>{record.role}</Tag>
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500, color: textPrimary }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
        </div>
      ),
    },
    { title: 'KYC Status', dataIndex: 'kycStatus', key: 'kycStatus', render: (s: string) => <Tag color={s === 'VERIFIED' ? 'green' : 'orange'}>{s}</Tag> },
    { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (a: boolean) => <Tag color={a ? 'green' : 'red'}>{a ? 'ACTIVE' : 'BLOCKED'}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedUser(record); setModalVisible(true); }}>View</Button>
          {record.isActive ? (
            <Button danger size="small" icon={<StopOutlined />}>Block</Button>
          ) : (
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>Unblock</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>User Management</h1>
            <Button type="primary" icon={<DownloadOutlined />} style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>Export CSV</Button>
          </div>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <Tabs.TabPane tab="All Users" key="all" />
              <Tabs.TabPane tab="Shippers" key="SHIPPER" />
              <Tabs.TabPane tab="Operators" key="OPERATOR" />
              <Tabs.TabPane tab="Drivers" key="DRIVER" />
            </Tabs>
            <Search placeholder="Search users..." style={{ width: 400, marginBottom: '16px' }} />
            <Table columns={columns} dataSource={mockUsers} rowKey="id" pagination={{ pageSize: 20 }} />
          </Card>
          <Modal title="User Details" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={800}>
            {selectedUser && <div style={{ color: textPrimary }}>Details for {selectedUser.name}</div>}
          </Modal>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default UsersManagementPage;
