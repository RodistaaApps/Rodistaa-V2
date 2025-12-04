/**
 * Fleet Management Page - CONSOLIDATED
 * Comprehensive truck fleet management (merged trucks.tsx features)
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space, Modal, Select, Statistic, Row, Col, Tabs, Input } from 'antd';
import { EyeOutlined, CarOutlined, CheckCircleOutlined, StopOutlined, DownloadOutlined, WarningOutlined, ToolOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Search } = Input;

function FleetManagementPage() {
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const mockFleetStats = {
    totalTrucks: 856,
    activeTrucks: 723,
    blockedTrucks: 15,
    pendingInspection: 42,
    docsExpiring: 18,
  };

  const mockTrucks = [
    {
      id: 'TRK-KA01AB1234-001',
      registrationNumber: 'KA 01 AB 1234',
      vehicleType: 'Container 20ft',
      make: 'TATA',
      model: 'LPT 1412',
      year: 2020,
      payloadCapacity: '15 tons',
      operatorId: 'OP-001',
      operatorName: 'Rajesh Kumar Transport',
      status: 'ACTIVE',
      lastInspectionDate: '2025-11-15',
      nextInspectionDue: '2026-02-15',
      docsExpiring: 0,
      totalTrips: 234,
      completedTrips: 228,
      currentLocation: 'Kurnool',
      isOnTrip: false,
    },
    {
      id: 'TRK-AP09CD5678-002',
      registrationNumber: 'AP 09 CD 5678',
      vehicleType: 'Flatbed 32ft',
      make: 'ASHOK LEYLAND',
      model: 'DOST PLUS',
      year: 2021,
      payloadCapacity: '22 tons',
      operatorId: 'OP-002',
      operatorName: 'Suresh Logistics',
      status: 'ACTIVE',
      lastInspectionDate: '2025-10-20',
      nextInspectionDue: '2025-12-10',
      docsExpiring: 2,
      totalTrips: 67,
      completedTrips: 65,
      currentLocation: 'Vijayawada',
      isOnTrip: true,
    },
    {
      id: 'TRK-TN12EF9012-003',
      registrationNumber: 'TN 12 EF 9012',
      vehicleType: 'Tanker 5000L',
      make: 'EICHER',
      model: 'PRO 3015',
      year: 2019,
      payloadCapacity: '18 tons',
      operatorId: 'OP-003',
      operatorName: 'Krishna Logistics',
      status: 'BLOCKED',
      lastInspectionDate: '2025-09-01',
      nextInspectionDue: '2025-12-01',
      docsExpiring: 3,
      totalTrips: 189,
      completedTrips: 175,
      currentLocation: 'Guntur',
      isOnTrip: false,
    },
  ];

  const handleViewTruck = (record: any) => {
    setSelectedTruck(record);
    setModalVisible(true);
  };

  const handleBlockTruck = (truckId: string) => {
    if (confirm('Are you sure you want to block this truck? This will prevent it from accepting new bookings.')) {
      alert(`Truck ${truckId} blocked successfully!`);
    }
  };

  const handleUnblockTruck = (truckId: string) => {
    if (confirm('Are you sure you want to unblock this truck?')) {
      alert(`Truck ${truckId} unblocked successfully!`);
    }
  };

  const handleScheduleInspection = (truckId: string) => {
    alert(`Inspection scheduled for truck ${truckId}`);
  };

  const handleExportCSV = () => {
    console.log('Exporting fleet data to CSV...');
    alert('Fleet CSV export started! Download will be ready in a moment.');
  };

  const columns = [
    {
      title: 'Registration',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.id}</div>
        </div>
      ),
    },
    {
      title: 'Vehicle Details',
      key: 'vehicle',
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.vehicleType}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.make} {record.model} ({record.year})</div>
          <div style={{ fontSize: '12px', color: '#999' }}>Capacity: {record.payloadCapacity}</div>
        </div>
      ),
    },
    {
      title: 'Operator',
      dataIndex: 'operatorName',
      key: 'operatorName',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.operatorId}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => (
        <Space direction="vertical" size="small">
          <Tag color={record.status === 'ACTIVE' ? 'green' : 'red'}>{record.status}</Tag>
          {record.isOnTrip && <Tag color="blue">ON TRIP</Tag>}
        </Space>
      ),
    },
    {
      title: 'Inspection',
      key: 'inspection',
      render: (_: any, record: any) => (
        <div style={{ fontSize: '12px' }}>
          <div>Last: {record.lastInspectionDate}</div>
          <div>Next: {record.nextInspectionDue}</div>
          {record.docsExpiring > 0 && (
            <div style={{ color: '#C90D0D', fontWeight: 500, marginTop: '4px' }}>
              <WarningOutlined /> {record.docsExpiring} docs expiring
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: any, record: any) => (
        <div style={{ fontSize: '12px' }}>
          <div>Total: {record.totalTrips}</div>
          <div style={{ color: '#52c41a' }}>Completed: {record.completedTrips}</div>
          <div style={{ color: '#666' }}>Location: {record.currentLocation}</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space direction="vertical" size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewTruck(record)}
            block
          >
            View Details
          </Button>
          {record.docsExpiring > 0 && (
            <Button
              size="small"
              icon={<ToolOutlined />}
              onClick={() => handleScheduleInspection(record.id)}
              block
            >
              Schedule Inspection
            </Button>
          )}
          {record.status === 'BLOCKED' ? (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleUnblockTruck(record.id)}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
              block
            >
              Unblock
            </Button>
          ) : (
            <Button
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleBlockTruck(record.id)}
              block
            >
              Block
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Filter trucks
  const filteredTrucks = mockTrucks.filter(truck => {
    if (statusFilter === 'active') return truck.status === 'ACTIVE';
    if (statusFilter === 'blocked') return truck.status === 'BLOCKED';
    if (statusFilter === 'onTrip') return truck.isOnTrip;
    if (statusFilter === 'expiring') return truck.docsExpiring > 0;
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Fleet Management</h1>
          <Space>
            <Select 
              defaultValue="all" 
              style={{ width: 180 }}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">All Trucks</Select.Option>
              <Select.Option value="active">Active Only</Select.Option>
              <Select.Option value="blocked">Blocked Only</Select.Option>
              <Select.Option value="onTrip">On Trip</Select.Option>
              <Select.Option value="expiring">Docs Expiring</Select.Option>
            </Select>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
              style={{ background: '#C90D0D', borderColor: '#C90D0D' }}
            >
              Export Fleet Data
            </Button>
          </Space>
        </div>

        {/* Fleet Statistics Dashboard */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Total Trucks"
                value={mockFleetStats.totalTrucks}
                prefix={<CarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Active"
                value={mockFleetStats.activeTrucks}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Blocked"
                value={mockFleetStats.blockedTrucks}
                valueStyle={{ color: '#cf1322' }}
                prefix={<StopOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Pending Inspection"
                value={mockFleetStats.pendingInspection}
                valueStyle={{ color: '#faad14' }}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Docs Expiring"
                value={mockFleetStats.docsExpiring}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#C90D0D' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Fleet List */}
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Search
              placeholder="Search by registration, operator, or location..."
              style={{ width: 400 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredTrucks}
            rowKey="id"
            pagination={{ 
              pageSize: 20,
              showTotal: (total) => `Total ${total} trucks`,
            }}
          />
        </Card>

        {/* Truck Details Modal */}
        <Modal
          title={`Truck Details: ${selectedTruck?.registrationNumber || ''}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={1000}
        >
          {selectedTruck && (
            <div>
              <Tabs defaultActiveKey="details">
                <TabPane tab="Basic Details" key="details">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Registration Number</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.registrationNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Vehicle Type</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.vehicleType}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Make & Model</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.make} {selectedTruck.model}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Year</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.year}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Payload Capacity</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.payloadCapacity}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Operator</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.operatorName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Status</div>
                      <Tag color={selectedTruck.status === 'ACTIVE' ? 'green' : 'red'}>{selectedTruck.status}</Tag>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Current Location</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.currentLocation}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>On Trip</div>
                      <Tag color={selectedTruck.isOnTrip ? 'blue' : 'default'}>
                        {selectedTruck.isOnTrip ? 'YES' : 'NO'}
                      </Tag>
                    </div>
                  </div>
                </TabPane>

                <TabPane tab="Performance" key="performance">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="Total Trips"
                          value={selectedTruck.totalTrips}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="Completed Trips"
                          value={selectedTruck.completedTrips}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="Completion Rate"
                          value={Math.round((selectedTruck.completedTrips / selectedTruck.totalTrips) * 100)}
                          suffix="%"
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </TabPane>

                <TabPane tab="Inspection & Documents" key="inspection">
                  <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }}>
                    <h4 style={{ marginTop: 0 }}>Inspection Schedule</h4>
                    <div>Last Inspection: <strong>{selectedTruck.lastInspectionDate}</strong></div>
                    <div>Next Due: <strong>{selectedTruck.nextInspectionDue}</strong></div>
                    {selectedTruck.docsExpiring > 0 && (
                      <div style={{ color: '#C90D0D', fontWeight: 500, marginTop: '12px' }}>
                        <WarningOutlined /> {selectedTruck.docsExpiring} documents expiring soon
                      </div>
                    )}
                  </div>

                  <div>
                    <h4>Document Status</h4>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <span>RC (Registration Certificate)</span>
                        <Tag color="green">VALID</Tag>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <span>Insurance</span>
                        <Tag color={selectedTruck.docsExpiring > 0 ? 'orange' : 'green'}>
                          {selectedTruck.docsExpiring > 0 ? 'EXPIRING SOON' : 'VALID'}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <span>Fitness Certificate</span>
                        <Tag color="green">VALID</Tag>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <span>PUC (Pollution)</span>
                        <Tag color="green">VALID</Tag>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <span>National Permit</span>
                        <Tag color="green">VALID</Tag>
                      </div>
                    </Space>
                  </div>
                </TabPane>

                <TabPane tab="Photos" key="photos">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {['Front View', 'Rear View', 'Side View', 'Interior', 'Number Plate', 'RC Document'].map(label => (
                      <div key={label} style={{ padding: '32px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                        <div>{label}</div>
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>Photo placeholder</div>
                      </div>
                    ))}
                  </div>
                </TabPane>
              </Tabs>

              {/* Action Buttons */}
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {selectedTruck.docsExpiring > 0 && (
                  <Button 
                    type="primary"
                    icon={<ToolOutlined />}
                    onClick={() => handleScheduleInspection(selectedTruck.id)}
                  >
                    Schedule Inspection
                  </Button>
                )}
                {selectedTruck.status === 'BLOCKED' ? (
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleUnblockTruck(selectedTruck.id)}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Unblock Truck
                  </Button>
                ) : (
                  <Button 
                    danger 
                    icon={<StopOutlined />}
                    onClick={() => handleBlockTruck(selectedTruck.id)}
                  >
                    Block Truck
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default FleetManagementPage;
