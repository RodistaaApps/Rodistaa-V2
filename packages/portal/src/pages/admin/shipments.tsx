/**
 * Shipments Management - Full functionality, theme-aware
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Modal, Timeline, Progress, Row, Col, Statistic, Select, Input, Tabs } from 'antd';
import { EyeOutlined, DownloadOutlined, SearchOutlined, TruckOutlined, EnvironmentOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';

interface ShipmentsPageProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

function ShipmentsManagementPage({ theme = 'dark', toggleTheme }: ShipmentsPageProps) {
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const bgElevated = isDark ? '#1E2430' : '#F3F4F6';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const mockShipments = [
    {
      id: 'SHIP-001',
      bookingId: 'BKG-003',
      route: 'Kurnool → Vijayawada',
      driver: 'Ramesh Kumar',
      driverPhone: '+919876543213',
      truck: 'KA 01 AB 1234',
      operatorName: 'Rajesh Transport',
      shipperName: 'Krishna Enterprises',
      status: 'IN_TRANSIT',
      progress: 65,
      startedAt: '2025-12-04 08:00',
      expectedDelivery: '2025-12-05 18:00',
      currentLocation: 'Near Guntur',
      cargoType: 'FMCG',
      weight: '3000 kg',
      podUploaded: false,
    },
    {
      id: 'SHIP-002',
      bookingId: 'BKG-002',
      route: 'Guntur → Nandyal',
      driver: 'Kumar Reddy',
      driverPhone: '+919876543214',
      truck: 'AP 09 CD 5678',
      operatorName: 'Suresh Logistics',
      shipperName: 'Ramesh Enterprises',
      status: 'AT_PICKUP',
      progress: 10,
      startedAt: '2025-12-04 10:30',
      expectedDelivery: '2025-12-05 20:00',
      currentLocation: 'Guntur Loading Yard',
      cargoType: 'Agricultural',
      weight: '8000 kg',
      podUploaded: false,
    },
    {
      id: 'SHIP-003',
      bookingId: 'BKG-004',
      route: 'Nandyal → Guntur',
      driver: 'Suresh Kumar',
      driverPhone: '+919876543215',
      truck: 'TN 12 EF 9012',
      operatorName: 'Krishna Logistics',
      shipperName: 'Suresh Enterprises',
      status: 'DELIVERED',
      progress: 100,
      startedAt: '2025-12-03 06:00',
      expectedDelivery: '2025-12-04 16:00',
      deliveredAt: '2025-12-04 15:45',
      currentLocation: 'Guntur Delivery Point',
      cargoType: 'Construction Materials',
      weight: '12000 kg',
      podUploaded: true,
    },
    {
      id: 'SHIP-004',
      bookingId: 'BKG-005',
      route: 'Vijayawada → Kurnool',
      driver: 'Ravi Kumar',
      driverPhone: '+919876543216',
      truck: 'KA 03 GH 3456',
      operatorName: 'Rajesh Transport',
      shipperName: 'Krishna Enterprises',
      status: 'DELAYED',
      progress: 45,
      startedAt: '2025-12-03 14:00',
      expectedDelivery: '2025-12-04 22:00',
      currentLocation: 'Stuck at Nandyal',
      cargoType: 'Electronics',
      weight: '5000 kg',
      podUploaded: false,
      delayReason: 'Vehicle breakdown',
    },
  ];

  const filteredShipments = statusFilter === 'all'
    ? mockShipments
    : mockShipments.filter(s => s.status === statusFilter);

  const stats = {
    total: mockShipments.length,
    inTransit: mockShipments.filter(s => s.status === 'IN_TRANSIT').length,
    delivered: mockShipments.filter(s => s.status === 'DELIVERED').length,
    delayed: mockShipments.filter(s => s.status === 'DELAYED').length,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ASSIGNED: 'blue',
      AT_PICKUP: 'cyan',
      IN_TRANSIT: 'purple',
      NEAR_DELIVERY: 'orange',
      DELIVERED: 'green',
      DELAYED: 'red',
      CANCELLED: 'default',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Shipment ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>{id}</div>
          <div style={{ fontSize: '12px', color: textSecondary }}>{record.bookingId}</div>
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
      title: 'Driver',
      dataIndex: 'driver',
      key: 'driver',
      render: (driver: string, record: any) => (
        <div>
          <div style={{ color: textPrimary, fontWeight: 500 }}>{driver}</div>
          <div style={{ fontSize: '12px', color: textSecondary }}>{record.truck}</div>
        </div>
      ),
    },
    {
      title: 'Operator',
      dataIndex: 'operatorName',
      key: 'operatorName',
      render: (name: string) => (
        <span style={{ color: textPrimary }}>{name}</span>
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
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          strokeColor={progress === 100 ? '#52c41a' : progress > 50 ? '#722ed1' : '#1890ff'}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
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
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
              Shipment Management
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
                  title="Total Shipments"
                  value={stats.total}
                  prefix={<TruckOutlined />}
                  valueStyle={{ color: textPrimary }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="In Transit"
                  value={stats.inTransit}
                  prefix={<EnvironmentOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Delivered"
                  value={stats.delivered}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Delayed"
                  value={stats.delayed}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          <Card>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Input
                placeholder="Search shipments..."
                prefix={<SearchOutlined />}
                style={{ width: '300px' }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '200px' }}
                options={[
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Assigned', value: 'ASSIGNED' },
                  { label: 'At Pickup', value: 'AT_PICKUP' },
                  { label: 'In Transit', value: 'IN_TRANSIT' },
                  { label: 'Near Delivery', value: 'NEAR_DELIVERY' },
                  { label: 'Delivered', value: 'DELIVERED' },
                  { label: 'Delayed', value: 'DELAYED' },
                ]}
              />
            </div>

            <Table
              columns={columns}
              dataSource={filteredShipments}
              rowKey="id"
              pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} shipments` }}
            />
          </Card>

          <Modal
            title={`Shipment Details: ${selectedShipment?.id || ''}`}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setSelectedShipment(null);
            }}
            footer={null}
            width={900}
          >
            {selectedShipment && (
              <div style={{ color: textPrimary }}>
                <Tabs defaultActiveKey="details">
                  <Tabs.TabPane tab="Details" key="details">
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                      <Col span={12}>
                        <div style={{ marginBottom: '16px' }}>
                          <h3 style={{ marginTop: 0, color: textPrimary }}>Shipment Info</h3>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Booking ID:</strong> {selectedShipment.bookingId}
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Route:</strong> {selectedShipment.route}
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Cargo:</strong> {selectedShipment.cargoType} ({selectedShipment.weight})
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Status:</strong> <Tag color={getStatusColor(selectedShipment.status)}>{selectedShipment.status.replace(/_/g, ' ')}</Tag>
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: '16px' }}>
                          <h3 style={{ marginTop: 0, color: textPrimary }}>Parties</h3>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Shipper:</strong> {selectedShipment.shipperName}
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Operator:</strong> {selectedShipment.operatorName}
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Driver:</strong> {selectedShipment.driver}
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Phone:</strong> {selectedShipment.driverPhone}
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Truck:</strong> {selectedShipment.truck}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <div style={{ marginBottom: '24px', padding: '16px', background: bgElevated, borderRadius: '8px' }}>
                      <h3 style={{ marginTop: 0, color: textPrimary }}>Tracking</h3>
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Current Location:</strong> {selectedShipment.currentLocation}
                      </div>
                      <Progress percent={selectedShipment.progress} strokeColor={selectedShipment.status === 'DELAYED' ? '#cf1322' : '#722ed1'} />
                      {selectedShipment.delayReason && (
                        <div style={{ marginTop: '12px', color: '#cf1322' }}>
                          <WarningOutlined /> Delay Reason: {selectedShipment.delayReason}
                        </div>
                      )}
                    </div>
                  </Tabs.TabPane>

                  <Tabs.TabPane tab="Timeline" key="timeline">
                    <Timeline
                      items={[
                        {
                          color: 'green',
                          children: `Started: ${selectedShipment.startedAt}`,
                        },
                        selectedShipment.status !== 'ASSIGNED' && selectedShipment.status !== 'AT_PICKUP'
                          ? {
                              color: 'blue',
                              children: `At Pickup: ${selectedShipment.currentLocation}`,
                            }
                          : null,
                        selectedShipment.status === 'IN_TRANSIT' || selectedShipment.status === 'DELIVERED' || selectedShipment.status === 'DELAYED'
                          ? {
                              color: selectedShipment.status === 'DELAYED' ? 'red' : 'purple',
                              children: `In Transit: ${selectedShipment.progress}% complete`,
                            }
                          : null,
                        selectedShipment.status === 'DELIVERED'
                          ? {
                              color: 'green',
                              children: `Delivered: ${selectedShipment.deliveredAt}`,
                            }
                          : {
                              color: 'gray',
                              children: `Expected Delivery: ${selectedShipment.expectedDelivery}`,
                            },
                      ].filter(Boolean)}
                    />
                  </Tabs.TabPane>

                  <Tabs.TabPane tab="POD" key="pod">
                    <div style={{ padding: '16px' }}>
                      {selectedShipment.podUploaded ? (
                        <div>
                          <div style={{ color: '#52c41a', marginBottom: '16px' }}>
                            <CheckCircleOutlined /> POD uploaded successfully
                          </div>
                          <div style={{ padding: '16px', background: bgElevated, borderRadius: '8px' }}>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>Delivery Time:</strong> {selectedShipment.deliveredAt}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>Received By:</strong> Warehouse Manager
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                              <strong>Signature:</strong> Yes
                            </div>
                            <Button type="primary" style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>
                              View POD Documents
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '32px', color: textSecondary }}>
                          <ClockCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                          <div>POD not uploaded yet</div>
                          <div style={{ fontSize: '12px', marginTop: '8px' }}>
                            Driver will upload POD upon delivery
                          </div>
                        </div>
                      )}
                    </div>
                  </Tabs.TabPane>
                </Tabs>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: `1px solid ${border}` }}>
                  <Button onClick={() => alert('View live tracking')}>
                    Live Tracking
                  </Button>
                  <Button onClick={() => alert('Contact driver')}>
                    Contact Driver
                  </Button>
                  {selectedShipment.status !== 'DELIVERED' && (
                    <Button danger onClick={() => alert('Report issue')}>
                      Report Issue
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

export default ShipmentsManagementPage;
