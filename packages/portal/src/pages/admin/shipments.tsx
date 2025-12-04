/**
 * Shipments Management Page - Clean version with Ant Design only
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space, Modal, Timeline } from 'antd';
import { EyeOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons';

function ShipmentsManagementPage() {
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockShipments = [
    {
      id: 'SHIP-001',
      bookingId: 'BKG-001',
      route: 'Kurnool → Vijayawada',
      driver: 'Ramesh (DL12345)',
      truck: 'KA 01 AB 1234',
      status: 'IN_TRANSIT',
      progress: 65,
      eta: '4 hours',
    },
    {
      id: 'SHIP-002',
      bookingId: 'BKG-002',
      route: 'Guntur → Nandyal',
      driver: 'Kumar (DL67890)',
      truck: 'AP 09 CD 5678',
      status: 'AT_PICKUP',
      progress: 10,
      eta: '12 hours',
    },
    {
      id: 'SHIP-003',
      bookingId: 'BKG-003',
      route: 'Vijayawada → Kurnool',
      driver: 'Suresh (DL54321)',
      truck: 'TN 12 EF 9012',
      status: 'COMPLETED',
      progress: 100,
      completedAt: '2025-12-01',
    },
  ];

  const handleViewShipment = (record: any) => {
    setSelectedShipment(record);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Shipment ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
      render: (route: string) => <span style={{ fontWeight: 500 }}>{route}</span>,
    },
    {
      title: 'Driver',
      dataIndex: 'driver',
      key: 'driver',
    },
    {
      title: 'Truck',
      dataIndex: 'truck',
      key: 'truck',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          'AT_PICKUP': 'blue',
          'IN_TRANSIT': 'purple',
          'AT_DELIVERY': 'orange',
          'COMPLETED': 'green',
        };
        return <Tag color={colorMap[status] || 'default'}>{status.replace(/_/g, ' ')}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewShipment(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  const timelineItems = selectedShipment ? [
    {
      color: 'green',
      children: (
        <div>
          <div style={{ fontWeight: 500 }}>Trip Assigned</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Driver accepted assignment</div>
        </div>
      ),
    },
    {
      color: 'green',
      children: (
        <div>
          <div style={{ fontWeight: 500 }}>Trip Started</div>
          <div style={{ fontSize: '12px', color: '#666' }}>GPS tracking activated</div>
        </div>
      ),
    },
    {
      color: selectedShipment.status === 'AT_PICKUP' ? 'blue' : 'green',
      children: (
        <div>
          <div style={{ fontWeight: 500 }}>At Pickup</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Arrived at loading point</div>
        </div>
      ),
    },
    {
      color: selectedShipment.status === 'IN_TRANSIT' ? 'blue' : selectedShipment.status === 'COMPLETED' ? 'green' : 'gray',
      children: (
        <div>
          <div style={{ fontWeight: 500 }}>In Transit</div>
          <div style={{ fontSize: '12px', color: '#666' }}>En route to delivery</div>
        </div>
      ),
    },
    {
      color: selectedShipment.status === 'COMPLETED' ? 'green' : 'gray',
      children: (
        <div>
          <div style={{ fontWeight: 500 }}>Delivered</div>
          <div style={{ fontSize: '12px', color: '#666' }}>POD uploaded</div>
        </div>
      ),
    },
  ] : [];

  const handleExportCSV = () => {
    console.log('Exporting shipments to CSV...');
    alert('CSV export started!');
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Shipment Management</h1>
          <Button type="primary" onClick={handleExportCSV} style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>Export CSV</Button>
        </div>

        <Card style={{ marginTop: '24px' }}>
          <Table
            columns={columns}
            dataSource={mockShipments}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>

        <Modal
          title={`Shipment Details: ${selectedShipment?.id || ''}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={900}
        >
          {selectedShipment && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Booking ID</div>
                    <div style={{ fontSize: '16px' }}>{selectedShipment.bookingId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Route</div>
                    <div style={{ fontSize: '16px' }}>{selectedShipment.route}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Driver</div>
                    <div style={{ fontSize: '16px' }}>{selectedShipment.driver}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Truck</div>
                    <div style={{ fontSize: '16px' }}>{selectedShipment.truck}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Progress</div>
                    <div style={{ fontSize: '16px' }}>{selectedShipment.progress}%</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Timeline</h3>
                <Timeline items={timelineItems} />
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  <EnvironmentOutlined /> GPS Tracking
                </h3>
                <div
                  style={{
                    height: '400px',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    GPS Map View (integrate with OSM/Google Maps)
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  <FileTextOutlined /> POD
                </h3>
                {selectedShipment.status === 'COMPLETED' ? (
                  <div
                    style={{
                      height: '400px',
                      background: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      POD Document Viewer (PDF/Images)
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    POD not yet uploaded
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default ShipmentsManagementPage;
