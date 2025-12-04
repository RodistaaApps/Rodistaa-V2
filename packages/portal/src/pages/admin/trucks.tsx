/**
 * Truck Management Page - Clean version with Ant Design only
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space, Modal } from 'antd';
import { CarOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';

function TruckManagementPage() {
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockTrucks = [
    {
      id: 'TRK-KA01AB1234-001',
      registrationNumber: 'KA 01 AB 1234',
      vehicleType: 'Container 20ft',
      operatorId: 'OP-001',
      operatorName: 'Rajesh Kumar',
      status: 'ACTIVE',
      lastInspectionDate: '2025-11-15',
      nextInspectionDue: '2026-02-15',
      docsExpiring: 0,
    },
    {
      id: 'TRK-AP09CD5678-002',
      registrationNumber: 'AP 09 CD 5678',
      vehicleType: 'Flatbed 32ft',
      operatorId: 'OP-002',
      operatorName: 'Suresh Transport',
      status: 'ACTIVE',
      lastInspectionDate: '2025-10-20',
      nextInspectionDue: '2025-12-10',
      docsExpiring: 2,
    },
    {
      id: 'TRK-TN12EF9012-003',
      registrationNumber: 'TN 12 EF 9012',
      vehicleType: 'Tanker 5000L',
      operatorId: 'OP-003',
      operatorName: 'Krishna Logistics',
      status: 'BLOCKED',
      lastInspectionDate: '2025-09-01',
      nextInspectionDue: '2025-12-01',
      docsExpiring: 3,
    },
  ];

  const handleBlock = (id: string) => {
    console.log('Block truck:', id);
    alert('Truck blocked successfully!');
  };

  const handleUnblock = (id: string) => {
    console.log('Unblock truck:', id);
    alert('Truck unblocked successfully!');
  };

  const handleViewDetails = (record: any) => {
    setSelectedTruck(record);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Registration',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
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
      render: (status: string) => {
        const color = status === 'ACTIVE' ? 'green' : status === 'BLOCKED' ? 'red' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Next Inspection',
      dataIndex: 'nextInspectionDue',
      key: 'nextInspectionDue',
      render: (date: string, record: any) => (
        <span style={{ color: record.docsExpiring > 0 ? '#C90D0D' : '#000' }}>
          {date}
          {record.docsExpiring > 0 && ` (${record.docsExpiring} docs expiring)`}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
          {record.status === 'BLOCKED' ? (
            <Button 
              type="primary" 
              size="small" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleUnblock(record.id)}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Unblock
            </Button>
          ) : (
            <Button 
              danger 
              size="small" 
              icon={<StopOutlined />}
              onClick={() => handleBlock(record.id)}
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
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Truck Management</h1>

        <Card style={{ marginTop: '24px' }}>
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
          width={800}
        >
          {selectedTruck && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Registration Number</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.registrationNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Vehicle Type</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.vehicleType}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Operator</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedTruck.operatorName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Status</div>
                  <Tag color={selectedTruck.status === 'ACTIVE' ? 'green' : 'red'}>{selectedTruck.status}</Tag>
                </div>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Inspection Photos</h3>
              <div style={{ padding: '32px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                Inspection photos would be displayed here (geotagged images)
              </div>
            </div>
          )}
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default TruckManagementPage;
