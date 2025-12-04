/**
 * Bookings Management Page - Clean version with Ant Design only
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space, Modal } from 'antd';
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';

function BookingsManagementPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockBookings = [
    {
      id: 'BKG-001',
      shipperId: 'SH-001',
      shipperName: 'Krishna Enterprises',
      route: 'Kurnool → Vijayawada',
      weight: '15 tons',
      status: 'OPEN_FOR_BIDDING',
      bidsCount: 5,
      createdAt: '2025-12-03',
    },
    {
      id: 'BKG-002',
      shipperId: 'SH-002',
      shipperName: 'Reddy Transport Co',
      route: 'Guntur → Nandyal',
      weight: '22 tons',
      status: 'ASSIGNED',
      bidsCount: 8,
      assignedOperator: 'Suresh Logistics',
      createdAt: '2025-12-02',
    },
    {
      id: 'BKG-003',
      shipperId: 'SH-003',
      shipperName: 'Venkat Freight',
      route: 'Vijayawada → Kurnool',
      weight: '18 tons',
      status: 'COMPLETED',
      bidsCount: 6,
      assignedOperator: 'Rajesh Transport',
      completedAt: '2025-12-01',
      createdAt: '2025-11-28',
    },
  ];

  const handleViewBooking = (record: any) => {
    setSelectedBooking(record);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Shipper',
      dataIndex: 'shipperName',
      key: 'shipperName',
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
      render: (route: string) => <span style={{ fontWeight: 500 }}>{route}</span>,
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          'OPEN_FOR_BIDDING': 'blue',
          'ASSIGNED': 'orange',
          'IN_TRANSIT': 'purple',
          'COMPLETED': 'green',
        };
        return <Tag color={colorMap[status] || 'default'}>{status.replace(/_/g, ' ')}</Tag>;
      },
    },
    {
      title: 'Bids',
      dataIndex: 'bidsCount',
      key: 'bidsCount',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewBooking(record)}
          >
            View
          </Button>
          {record.status === 'OPEN_FOR_BIDDING' && (
            <Button 
              type="primary" 
              size="small"
              icon={<CheckCircleOutlined />}
            >
              Force Finalize
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleExportCSV = () => {
    console.log('Exporting bookings to CSV...');
    alert('CSV export started!');
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Booking Management</h1>
          <Button type="primary" onClick={handleExportCSV} style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>Export CSV</Button>
        </div>

        <Card style={{ marginTop: '24px' }}>
          <Table
            columns={columns}
            dataSource={mockBookings}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>

        <Modal
          title={`Booking Details: ${selectedBooking?.id || ''}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedBooking && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Booking ID</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedBooking.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Shipper</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedBooking.shipperName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Route</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedBooking.route}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Weight</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedBooking.weight}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Bids Received</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedBooking.bidsCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Created</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedBooking.createdAt}</div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default BookingsManagementPage;
