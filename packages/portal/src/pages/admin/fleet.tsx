/**
 * Fleet Management Page - Comprehensive truck fleet overview
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space, Modal, Tabs, Select, Statistic, Row, Col } from 'antd';
import { EyeOutlined, CarOutlined, CheckCircleOutlined, StopOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

function FleetManagementPage() {
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      operatorId: 'OP-001',
      operatorName: 'Rajesh Kumar Transport',
      status: 'ACTIVE',
      lastInspectionDate: '2025-11-15',
      nextInspectionDue: '2026-02-15',
      docsExpiring: 0,
      totalTrips: 234,
      currentLocation: 'Kurnool',
    },
    {
      id: 'TRK-AP09CD5678-002',
      registrationNumber: 'AP 09 CD 5678',
      vehicleType: 'Flatbed 32ft',
      make: 'ASHOK LEYLAND',
      model: 'DOST PLUS',
      year: 2021,
      operatorId: 'OP-002',
      operatorName: 'Suresh Logistics',
      status: 'ACTIVE',
      lastInspectionDate: '2025-10-20',
      nextInspectionDue: '2025-12-10',
      docsExpiring: 2,
      totalTrips: 67,
      currentLocation: 'Vijayawada',
    },
    {
      id: 'TRK-TN12EF9012-003',
      registrationNumber: 'TN 12 EF 9012',
      vehicleType: 'Tanker 5000L',
      make: 'EICHER',
      model: 'PRO 3015',
      year: 2019,
      operatorId: 'OP-003',
      operatorName: 'Krishna Logistics',
      status: 'BLOCKED',
      lastInspectionDate: '2025-09-01',
      nextInspectionDue: '2025-12-01',
      docsExpiring: 3,
      totalTrips: 189,
      currentLocation: 'Guntur',
    },
  ];

  const handleViewTruck = (record: any) => {
    setSelectedTruck(record);
    setModalVisible(true);
  };

  const handleBlockTruck = (truckId: string) => {
    if (confirm('Are you sure you want to block this truck?')) {
      alert(`Truck ${truckId} blocked successfully!`);
    }
  };

  const handleUnblockTruck = (truckId: string) => {
    if (confirm('Are you sure you want to unblock this truck?')) {
      alert(`Truck ${truckId} unblocked successfully!`);
    }
  };

  const handleExportCSV = () => {
    alert('Fleet CSV export started!');
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
        </div>
      ),
    },
    {
      title: 'Operator',
      dataIndex: 'operatorName',
      key: 'operatorName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Inspection',
      key: 'inspection',
      render: (_: any, record: any) => (
        <div style={{ fontSize: '12px' }}>
          <div>Next Due: {record.nextInspectionDue}</div>
          {record.docsExpiring > 0 && (
            <div style={{ color: '#C90D0D', fontWeight: 500 }}>
              <WarningOutlined /> {record.docsExpiring} docs expiring
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trips',
      dataIndex: 'totalTrips',
      key: 'totalTrips',
    },
    {
      title: 'Location',
      dataIndex: 'currentLocation',
      key: 'currentLocation',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewTruck(record)}
          >
            Details
          </Button>
          {record.status === 'BLOCKED' ? (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleUnblockTruck(record.id)}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Unblock
            </Button>
          ) : (
            <Button
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleBlockTruck(record.id)}
            >
              Block
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Fleet Management</h1>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            style={{ background: '#C90D0D', borderColor: '#C90D0D' }}
          >
            Export Fleet Data
          </Button>
        </div>

        {/* Fleet Stats */}
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
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Pending Inspection"
                value={mockFleetStats.pendingInspection}
                valueStyle={{ color: '#faad14' }}
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

        <Card>
          <Table
            columns={columns}
            dataSource={mockTrucks}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>

        <Modal
          title={`Truck Details: ${selectedTruck?.registrationNumber || ''}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={900}
        >
          {selectedTruck && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
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
                  <div style={{ fontSize: '12px', color: '#666' }}>Operator</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.operatorName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Status</div>
                  <Tag color={selectedTruck.status === 'ACTIVE' ? 'green' : 'red'}>{selectedTruck.status}</Tag>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Total Trips</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.totalTrips}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Current Location</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.currentLocation}</div>
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px', marginBottom: '16px' }}>
                Inspection & Documents
              </h3>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <div>Last Inspection: {selectedTruck.lastInspectionDate}</div>
                <div>Next Due: {selectedTruck.nextInspectionDue}</div>
                {selectedTruck.docsExpiring > 0 && (
                  <div style={{ color: '#C90D0D', fontWeight: 500, marginTop: '8px' }}>
                    <WarningOutlined /> {selectedTruck.docsExpiring} documents expiring soon
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

export default FleetManagementPage;

