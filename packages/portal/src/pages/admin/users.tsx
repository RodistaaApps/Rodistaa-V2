/**
 * Users Management Page - Combined view for Shippers, Operators, Drivers
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space, Modal, Tabs, Select, Input } from 'antd';
import { EyeOutlined, UserOutlined, CheckCircleOutlined, StopOutlined, DownloadOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Search } = Input;

function UsersManagementPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for all user types
  const mockUsers = [
    {
      id: 'SH-001',
      name: 'Krishna Enterprises',
      phone: '+919876543210',
      email: 'krishna@example.com',
      role: 'SHIPPER',
      kycStatus: 'VERIFIED',
      isActive: true,
      totalBookings: 45,
      activeBookings: 3,
      createdAt: '2025-10-15',
      lastLogin: '2025-12-03',
    },
    {
      id: 'OP-001',
      name: 'Rajesh Kumar Transport',
      phone: '+919876543211',
      email: 'rajesh@example.com',
      role: 'OPERATOR',
      kycStatus: 'VERIFIED',
      isActive: true,
      totalTrucks: 12,
      activeBids: 8,
      totalShipments: 156,
      createdAt: '2025-09-20',
      lastLogin: '2025-12-04',
    },
    {
      id: 'OP-002',
      name: 'Suresh Logistics',
      phone: '+919876543212',
      email: 'suresh@example.com',
      role: 'OPERATOR',
      kycStatus: 'PENDING',
      isActive: true,
      totalTrucks: 5,
      activeBids: 2,
      totalShipments: 23,
      createdAt: '2025-11-10',
      lastLogin: '2025-12-03',
    },
    {
      id: 'DR-001',
      name: 'Ramesh Kumar',
      phone: '+919876543213',
      role: 'DRIVER',
      kycStatus: 'VERIFIED',
      isActive: true,
      assignedTruck: 'KA 01 AB 1234',
      currentOperator: 'Rajesh Kumar Transport',
      totalTrips: 89,
      driverScore: 87,
      createdAt: '2025-09-25',
      lastLogin: '2025-12-04',
    },
    {
      id: 'DR-002',
      name: 'Kumar Reddy',
      phone: '+919876543214',
      role: 'DRIVER',
      kycStatus: 'VERIFIED',
      isActive: false,
      assignedTruck: null,
      currentOperator: null,
      totalTrips: 12,
      driverScore: 62,
      createdAt: '2025-11-15',
      lastLogin: '2025-11-28',
    },
    {
      id: 'SH-002',
      name: 'Reddy Freight Co',
      phone: '+919876543215',
      email: 'reddy@example.com',
      role: 'SHIPPER',
      kycStatus: 'REJECTED',
      isActive: false,
      totalBookings: 2,
      activeBookings: 0,
      createdAt: '2025-11-20',
      lastLogin: '2025-11-22',
    },
  ];

  const handleViewUser = (record: any) => {
    setSelectedUser(record);
    setModalVisible(true);
  };

  const handleBlockUser = (userId: string) => {
    if (confirm('Are you sure you want to block this user?')) {
      alert(`User ${userId} blocked successfully!`);
    }
  };

  const handleUnblockUser = (userId: string) => {
    if (confirm('Are you sure you want to unblock this user?')) {
      alert(`User ${userId} unblocked successfully!`);
    }
  };

  const handleExportCSV = () => {
    console.log('Exporting users to CSV...');
    alert('CSV export started! Download will be ready in a moment.');
  };

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{id}</div>
          <Tag color={
            record.role === 'SHIPPER' ? 'blue' :
            record.role === 'OPERATOR' ? 'green' :
            'orange'
          }>
            {record.role}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
          {record.email && <div style={{ fontSize: '12px', color: '#999' }}>{record.email}</div>}
        </div>
      ),
    },
    {
      title: 'KYC Status',
      dataIndex: 'kycStatus',
      key: 'kycStatus',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          'VERIFIED': 'green',
          'PENDING': 'orange',
          'REJECTED': 'red',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'ACTIVE' : 'BLOCKED'}
        </Tag>
      ),
    },
    {
      title: 'Stats',
      key: 'stats',
      render: (_: any, record: any) => (
        <div style={{ fontSize: '12px' }}>
          {record.role === 'SHIPPER' && (
            <div>
              <div>Bookings: {record.totalBookings}</div>
              <div style={{ color: '#666' }}>Active: {record.activeBookings}</div>
            </div>
          )}
          {record.role === 'OPERATOR' && (
            <div>
              <div>Trucks: {record.totalTrucks}</div>
              <div style={{ color: '#666' }}>Shipments: {record.totalShipments}</div>
            </div>
          )}
          {record.role === 'DRIVER' && (
            <div>
              <div>Trips: {record.totalTrips}</div>
              <div style={{ color: '#666' }}>Score: {record.driverScore}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record)}
          >
            View
          </Button>
          {record.isActive ? (
            <Button
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleBlockUser(record.id)}
            >
              Block
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleUnblockUser(record.id)}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Unblock
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Filter users
  const filteredUsers = mockUsers.filter(user => {
    if (activeTab !== 'all' && user.role !== activeTab) return false;
    if (statusFilter === 'active' && !user.isActive) return false;
    if (statusFilter === 'blocked' && user.isActive) return false;
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>User Management</h1>
          <Space>
            <Select 
              defaultValue="all" 
              style={{ width: 150 }}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="active">Active Only</Select.Option>
              <Select.Option value="blocked">Blocked Only</Select.Option>
            </Select>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
              style={{ background: '#C90D0D', borderColor: '#C90D0D' }}
            >
              Export CSV
            </Button>
          </Space>
        </div>

        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={`All Users (${mockUsers.length})`} key="all" />
            <TabPane tab={`Shippers (${mockUsers.filter(u => u.role === 'SHIPPER').length})`} key="SHIPPER" />
            <TabPane tab={`Operators (${mockUsers.filter(u => u.role === 'OPERATOR').length})`} key="OPERATOR" />
            <TabPane tab={`Drivers (${mockUsers.filter(u => u.role === 'DRIVER').length})`} key="DRIVER" />
          </Tabs>

          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <Search
              placeholder="Search by name, phone, or ID..."
              style={{ width: 400 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>

        <Modal
          title={`User Details: ${selectedUser?.name || ''}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedUser && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>User ID</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedUser.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Role</div>
                  <Tag color={
                    selectedUser.role === 'SHIPPER' ? 'blue' :
                    selectedUser.role === 'OPERATOR' ? 'green' :
                    'orange'
                  }>
                    {selectedUser.role}
                  </Tag>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Name</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedUser.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Phone</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedUser.phone}</div>
                </div>
                {selectedUser.email && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Email</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedUser.email}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>KYC Status</div>
                  <Tag color={
                    selectedUser.kycStatus === 'VERIFIED' ? 'green' :
                    selectedUser.kycStatus === 'PENDING' ? 'orange' :
                    'red'
                  }>
                    {selectedUser.kycStatus}
                  </Tag>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Account Status</div>
                  <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                    {selectedUser.isActive ? 'ACTIVE' : 'BLOCKED'}
                  </Tag>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Member Since</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedUser.createdAt}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Last Login</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedUser.lastLogin}</div>
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: '24px' }}>
                Activity Summary
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {selectedUser.role === 'SHIPPER' && (
                  <>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Total Bookings</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedUser.totalBookings}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Active Bookings</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedUser.activeBookings}</div>
                    </div>
                  </>
                )}
                {selectedUser.role === 'OPERATOR' && (
                  <>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Total Trucks</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedUser.totalTrucks}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Active Bids</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedUser.activeBids}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Total Shipments</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedUser.totalShipments}</div>
                    </div>
                  </>
                )}
                {selectedUser.role === 'DRIVER' && (
                  <>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Total Trips</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedUser.totalTrips}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Driver Score</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedUser.driverScore}</div>
                    </div>
                    {selectedUser.assignedTruck && (
                      <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>Assigned Truck</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedUser.assignedTruck}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                {selectedUser.isActive ? (
                  <Button 
                    danger 
                    icon={<StopOutlined />}
                    onClick={() => handleBlockUser(selectedUser.id)}
                  >
                    Block User
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleUnblockUser(selectedUser.id)}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Unblock User
                  </Button>
                )}
                <Button onClick={() => alert('Login as feature (impersonation) - requires admin authorization')}>
                  Login As User
                </Button>
                {selectedUser.kycStatus === 'PENDING' && (
                  <>
                    <Button type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                      Approve KYC
                    </Button>
                    <Button danger>Reject KYC</Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default UsersManagementPage;

