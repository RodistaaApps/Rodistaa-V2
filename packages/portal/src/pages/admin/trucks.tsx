/**
 * Truck Management Page
 * List trucks, view inspections, block/unblock
 */

import { useState } from 'react';
import { Card, Table, Button, Tag, message, Modal, Image, Tabs } from 'antd';
import { CarOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Typography } from 'antd';

const { Title, Text: AntText } = Typography;

function TruckManagementPage() {
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockTrucks = [
    {
      id: 'TRK-KA01AB1234-001',
      registrationNumber: 'KA 01 AB 1234',
      operatorName: 'ABC Transport',
      status: 'ACTIVE',
      lastInspection: '2024-01-01',
      nextInspectionDue: '2024-04-30',
      docsExpiring: 0,
    },
    {
      id: 'TRK-MH02CD5678-002',
      registrationNumber: 'MH 02 CD 5678',
      operatorName: 'XYZ Logistics',
      status: 'EXPIRED_DOCS',
      lastInspection: '2023-12-15',
      nextInspectionDue: '2024-04-13',
      docsExpiring: 2,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'PENDING_INSPECTION':
        return 'orange';
      case 'EXPIRED_DOCS':
        return 'red';
      case 'BLOCKED':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleBlock = async (truckId: string) => {
    Modal.confirm({
      title: 'Block Truck',
      content: 'Are you sure you want to block this truck?',
      onOk: async () => {
        try {
          // await apiClient.blockTruck(truckId, 'Admin action');
          message.success('Truck blocked successfully');
        } catch (error) {
          message.error('Failed to block truck');
        }
      },
    });
  };

  const handleUnblock = async (truckId: string) => {
    try {
      // await apiClient.unblockTruck(truckId);
      message.success('Truck unblocked successfully');
    } catch (error) {
      message.error('Failed to unblock truck');
    }
  };

  const columns = [
    {
      title: 'Registration',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      render: (text: string) => <strong>{text}</strong>,
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
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Last Inspection',
      dataIndex: 'lastInspection',
      key: 'lastInspection',
    },
    {
      title: 'Next Due',
      dataIndex: 'nextInspectionDue',
      key: 'nextInspectionDue',
      render: (date: string, record: any) => (
        <span style={{ color: record.docsExpiring > 0 ? '#F44336' : '#000000' }}>
          {date}
          {record.docsExpiring > 0 && ` (${record.docsExpiring} docs expiring)`}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="small"
            onClick={() => {
              setSelectedTruck(record);
              setModalVisible(true);
            }}
          >
            View Details
          </Button>
          {record.status === 'BLOCKED' ? (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleUnblock(record.id)}
            >
              Unblock
            </Button>
          ) : (
            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleBlock(record.id)}
            >
              Block
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <Title level={2}>Truck Management</Title>

        <Card style={{ marginTop: 24 }}>
          <Table
            columns={columns}
            dataSource={mockTrucks}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>

        <Modal
          title={`Truck Details: ${selectedTruck?.registrationNumber}`}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedTruck(null);
          }}
          footer={null}
          width={800}
        >
          {selectedTruck && (
            <Tabs
              items={[
                {
                  key: 'details',
                  label: 'Details',
                  children: (
                    <div>
                      <p><strong>Truck ID:</strong> {selectedTruck.id}</p>
                      <p><strong>Operator:</strong> {selectedTruck.operatorName}</p>
                      <p><strong>Status:</strong> <Tag color={getStatusColor(selectedTruck.status)}>{selectedTruck.status}</Tag></p>
                    </div>
                  ),
                },
                {
                  key: 'inspections',
                  label: 'Inspection Photos',
                  children: (
                    <div>
                      <Image.PreviewGroup>
                        <Image width={200} src="/placeholder-truck.jpg" alt="Truck front" />
                        <Image width={200} src="/placeholder-truck.jpg" alt="Truck rear" />
                        <Image width={200} src="/placeholder-truck.jpg" alt="Number plate" />
                      </Image.PreviewGroup>
                      <p style={{ marginTop: 16 }}>Last inspection: {selectedTruck.lastInspection}</p>
                    </div>
                  ),
                },
                {
                  key: 'documents',
                  label: 'Documents',
                  children: <AntText>Document status and expiry tracking</AntText>,
                },
              ]}
            />
          )}
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default TruckManagementPage;

