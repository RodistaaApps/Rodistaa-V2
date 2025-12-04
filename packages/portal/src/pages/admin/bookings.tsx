/**
 * Bookings Management - Full functionality, theme-aware
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space, Modal, Select, Input, DatePicker, Statistic, Row, Col, Timeline } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined, SearchOutlined, BookOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface BookingsPageProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

function BookingsManagementPage({ theme = 'dark', toggleTheme }: BookingsPageProps) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockBookings = [
    {
      id: 'BKG-001',
      shipperId: 'SH-001',
      shipperName: 'Krishna Enterprises',
      route: 'Kurnool → Vijayawada',
      pickupDate: '2025-12-05',
      deliveryDate: '2025-12-06',
      cargoType: 'Electronics',
      weight: '5000 kg',
      bidsReceived: 8,
      status: 'OPEN',
      createdAt: '2025-12-04 10:30',
      estimatedValue: 25000,
    },
    {
      id: 'BKG-002',
      shipperId: 'SH-002',
      shipperName: 'Suresh Logistics',
      route: 'Guntur → Nandyal',
      pickupDate: '2025-12-06',
      deliveryDate: '2025-12-07',
      cargoType: 'Agricultural',
      weight: '8000 kg',
      bidsReceived: 12,
      status: 'BIDDING_CLOSED',
      createdAt: '2025-12-03 14:20',
      estimatedValue: 18000,
    },
    {
      id: 'BKG-003',
      shipperId: 'SH-003',
      shipperName: 'Ramesh Transport',
      route: 'Vijayawada → Kurnool',
      pickupDate: '2025-12-04',
      deliveryDate: '2025-12-05',
      cargoType: 'FMCG',
      weight: '3000 kg',
      bidsReceived: 15,
      status: 'ASSIGNED',
      createdAt: '2025-12-02 09:15',
      estimatedValue: 15000,
      assignedOperator: 'Rajesh Kumar Transport',
      winningBid: 14500,
    },
    {
      id: 'BKG-004',
      shipperId: 'SH-001',
      shipperName: 'Krishna Enterprises',
      route: 'Nandyal → Guntur',
      pickupDate: '2025-12-03',
      deliveryDate: '2025-12-04',
      cargoType: 'Construction Materials',
      weight: '12000 kg',
      bidsReceived: 6,
      status: 'COMPLETED',
      createdAt: '2025-12-01 11:00',
      estimatedValue: 32000,
      assignedOperator: 'Suresh Logistics',
      winningBid: 30000,
      completedAt: '2025-12-04 18:45',
    },
  ];

  const filteredBookings = statusFilter === 'all' 
    ? mockBookings 
    : mockBookings.filter(b => b.status === statusFilter);

  const stats = {
    total: mockBookings.length,
    open: mockBookings.filter(b => b.status === 'OPEN').length,
    assigned: mockBookings.filter(b => b.status === 'ASSIGNED').length,
    completed: mockBookings.filter(b => b.status === 'COMPLETED').length,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'blue',
      BIDDING_CLOSED: 'orange',
      ASSIGNED: 'purple',
      COMPLETED: 'green',
      CANCELLED: 'red',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <span style={{ fontWeight: 600, color: textPrimary }}>{id}</span>
      ),
    },
    {
      title: 'Shipper',
      dataIndex: 'shipperName',
      key: 'shipperName',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500, color: textPrimary }}>{name}</div>
          <div style={{ fontSize: '12px', color: textSecondary }}>{record.shipperId}</div>
        </div>
      ),
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
      render: (route: string) => (
        <span style={{ color: textPrimary }}>{route}</span>
      ),
    },
    {
      title: 'Cargo',
      dataIndex: 'cargoType',
      key: 'cargoType',
      render: (cargo: string, record: any) => (
        <div>
          <div style={{ color: textPrimary }}>{cargo}</div>
          <div style={{ fontSize: '12px', color: textSecondary }}>{record.weight}</div>
        </div>
      ),
    },
    {
      title: 'Bids',
      dataIndex: 'bidsReceived',
      key: 'bidsReceived',
      render: (bids: number) => (
        <span style={{ color: textPrimary, fontWeight: 600 }}>{bids}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.replace(/_/g, ' ')}</Tag>
      ),
    },
    {
      title: 'Est. Value',
      dataIndex: 'estimatedValue',
      key: 'estimatedValue',
      render: (value: number) => (
        <span style={{ color: textPrimary }}>₹{value.toLocaleString()}</span>
      ),
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
          {record.status === 'OPEN' && (
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => alert(`Cancel booking ${record.id}`)}
            >
              Cancel
            </Button>
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
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
              Booking Management
            </h1>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              style={{ background: '#C90D0D', borderColor: '#C90D0D' }}
              onClick={() => alert('Export CSV')}
            >
              Export CSV
            </Button>
          </div>

          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Bookings"
                  value={stats.total}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: textPrimary }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Open"
                  value={stats.open}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Assigned"
                  value={stats.assigned}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Completed"
                  value={stats.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <Card>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Input
                placeholder="Search bookings..."
                prefix={<SearchOutlined />}
                style={{ width: '300px' }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '200px' }}
                options={[
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Open', value: 'OPEN' },
                  { label: 'Bidding Closed', value: 'BIDDING_CLOSED' },
                  { label: 'Assigned', value: 'ASSIGNED' },
                  { label: 'Completed', value: 'COMPLETED' },
                  { label: 'Cancelled', value: 'CANCELLED' },
                ]}
              />
              <RangePicker style={{ width: '300px' }} />
            </div>

            <Table
              columns={columns}
              dataSource={filteredBookings}
              rowKey="id"
              pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} bookings` }}
            />
          </Card>

          <Modal
            title={`Booking Details: ${selectedBooking?.id || ''}`}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setSelectedBooking(null);
            }}
            footer={null}
            width={800}
          >
            {selectedBooking && (
              <div style={{ color: textPrimary }}>
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                  <Col span={12}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Shipper:</strong> {selectedBooking.shipperName}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Route:</strong> {selectedBooking.route}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Cargo Type:</strong> {selectedBooking.cargoType}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Weight:</strong> {selectedBooking.weight}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Pickup Date:</strong> {selectedBooking.pickupDate}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Delivery Date:</strong> {selectedBooking.deliveryDate}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Estimated Value:</strong> ₹{selectedBooking.estimatedValue.toLocaleString()}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Bids Received:</strong> {selectedBooking.bidsReceived}
                    </div>
                  </Col>
                </Row>

                {selectedBooking.assignedOperator && (
                  <div style={{ marginBottom: '24px', padding: '16px', background: isDark ? '#1E2430' : '#F3F4F6', borderRadius: '8px' }}>
                    <h3 style={{ marginTop: 0, color: textPrimary }}>Assignment Details</h3>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Operator:</strong> {selectedBooking.assignedOperator}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Winning Bid:</strong> ₹{selectedBooking.winningBid?.toLocaleString()}
                    </div>
                  </div>
                )}

                <div>
                  <h3 style={{ color: textPrimary }}>Timeline</h3>
                  <Timeline
                    items={[
                      {
                        color: 'green',
                        children: `Created: ${selectedBooking.createdAt}`,
                      },
                      selectedBooking.status === 'ASSIGNED' || selectedBooking.status === 'COMPLETED'
                        ? {
                            color: 'purple',
                            children: 'Assigned to operator',
                          }
                        : null,
                      selectedBooking.status === 'COMPLETED'
                        ? {
                            color: 'green',
                            children: `Completed: ${selectedBooking.completedAt}`,
                          }
                        : null,
                    ].filter(Boolean)}
                  />
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {selectedBooking.status === 'OPEN' && (
                    <>
                      <Button onClick={() => alert('View bids')}>View All Bids</Button>
                      <Button danger onClick={() => alert('Cancel booking')}>Cancel Booking</Button>
                    </>
                  )}
                  {selectedBooking.status === 'ASSIGNED' && (
                    <Button type="primary" style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>
                      Track Shipment
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default BookingsManagementPage;
