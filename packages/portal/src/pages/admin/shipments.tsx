/**
 * Shipments Management Page
 * View shipments, GPS tracking, POD viewer
 */

import { Card, Table, Tag, Button, Space, Modal, Tabs } from 'antd';
import { EyeOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Typography } from 'antd';

const { Title, Text } = Typography;

function ShipmentsPage() {
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockShipments = [
    {
      id: 'SH-001',
      bookingId: 'RID-20240102-0001',
      route: 'Bangalore → Chennai',
      driver: 'Rajesh Kumar',
      truck: 'KA 01 AB 1234',
      status: 'in_transit',
      progress: 65,
      hasPod: false,
    },
    {
      id: 'SH-002',
      bookingId: 'RID-20240101-0087',
      route: 'Mumbai → Delhi',
      driver: 'Amit Singh',
      truck: 'MH 02 CD 5678',
      status: 'completed',
      progress: 100,
      hasPod: true,
    },
  ];

  const columns = [
    {
      title: 'Shipment ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <code>{id}</code>,
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
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
        const color = status === 'completed' ? 'green' : status === 'in_transit' ? 'blue' : 'orange';
        return <Tag color={color}>{status.replace('_', ' ').toUpperCase()}</Tag>;
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
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedShipment(record);
              setModalVisible(true);
            }}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <Title level={2}>Shipment Management</Title>

        <Card style={{ marginTop: 24 }}>
          <Table
            columns={columns}
            dataSource={mockShipments}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>

        <Modal
          title={`Shipment: ${selectedShipment?.id}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedShipment && (
            <Tabs
              items={[
                {
                  key: 'details',
                  label: 'Details',
                  children: (
                    <div>
                      <p><strong>Booking ID:</strong> {selectedShipment.bookingId}</p>
                      <p><strong>Route:</strong> {selectedShipment.route}</p>
                      <p><strong>Driver:</strong> {selectedShipment.driver}</p>
                      <p><strong>Truck:</strong> {selectedShipment.truck}</p>
                      <p><strong>Progress:</strong> {selectedShipment.progress}%</p>
                    </div>
                  ),
                },
                {
                  key: 'gps',
                  label: 'GPS Tracking',
                  icon: <EnvironmentOutlined />,
                  children: (
                    <div style={{ height: 400, backgroundColor: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary">GPS Map View (integrate with maps mock)</Text>
                    </div>
                  ),
                },
                {
                  key: 'pod',
                  label: 'POD',
                  icon: <FileTextOutlined />,
                  children: selectedShipment.hasPod ? (
                    <div>
                      <Text>POD uploaded on: 2024-01-02 18:30</Text>
                      <div style={{ marginTop: 16, height: 400, backgroundColor: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text type="secondary">PDF Viewer (react-pdf integration)</Text>
                      </div>
                    </div>
                  ) : (
                    <Text type="secondary">POD not yet uploaded</Text>
                  ),
                },
              ]}
            />
          )}
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default ShipmentsPage;

