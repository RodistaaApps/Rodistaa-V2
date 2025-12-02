/**
 * Bookings Management Page
 * View and manage all bookings
 */

import { Card, Table, Tag, Button, Space, Modal, Descriptions } from 'antd';
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Typography } from 'antd';

const { Title } = Typography;

function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockBookings = [
    {
      id: 'RID-20240102-0001',
      shipper: 'ABC Corp',
      route: 'Bangalore → Chennai',
      weight: 15,
      status: 'open',
      bidsCount: 5,
      createdAt: '2024-01-02 10:00',
    },
    {
      id: 'RID-20240102-0002',
      shipper: 'XYZ Ltd',
      route: 'Mumbai → Delhi',
      weight: 20,
      status: 'finalized',
      bidsCount: 3,
      createdAt: '2024-01-02 09:30',
    },
  ];

  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <code>{id}</code>,
    },
    {
      title: 'Shipper',
      dataIndex: 'shipper',
      key: 'shipper',
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => `${weight} tons`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'finalized' ? 'green' : status === 'open' ? 'blue' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
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
            onClick={() => {
              setSelectedBooking(record);
              setModalVisible(true);
            }}
          >
            View
          </Button>
          {record.status === 'open' && (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />}>
              Force Finalize
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <Title level={2}>Booking Management</Title>

        <Card style={{ marginTop: 24 }}>
          <Table
            columns={columns}
            dataSource={mockBookings}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>

        <Modal
          title="Booking Details"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedBooking && (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Booking ID">{selectedBooking.id}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag>{selectedBooking.status.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Shipper">{selectedBooking.shipper}</Descriptions.Item>
              <Descriptions.Item label="Route">{selectedBooking.route}</Descriptions.Item>
              <Descriptions.Item label="Weight">{selectedBooking.weight} tons</Descriptions.Item>
              <Descriptions.Item label="Bids">{selectedBooking.bidsCount}</Descriptions.Item>
              <Descriptions.Item label="Created">{selectedBooking.createdAt}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default BookingsPage;

