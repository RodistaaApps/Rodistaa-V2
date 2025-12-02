/**
 * Override Requests Page
 * Approve or deny override requests from ACS or franchises
 */

import { Card, Table, Button, Tag, message, Modal, Typography, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';

const { Title, Text: AntText } = Typography;

function OverridesPage() {
  const mockOverrides = [
    {
      id: 'OVR-001',
      requestedBy: 'District Franchise - North',
      type: 'bid_finalization',
      reason: 'Operator dispute resolution',
      status: 'pending',
      createdAt: '2024-01-02 10:30',
    },
    {
      id: 'OVR-002',
      requestedBy: 'ACS Engine',
      type: 'truck_unblock',
      reason: 'Document verification completed',
      status: 'pending',
      createdAt: '2024-01-02 09:15',
    },
  ];

  const handleApprove = (overrideId: string) => {
    Modal.confirm({
      title: 'Approve Override Request',
      content: 'This action will be audited. Do you want to continue?',
      onOk: async () => {
        try {
          // await apiClient.approveOverride(overrideId);
          message.success('Override request approved');
        } catch (error) {
          message.error('Failed to approve override');
        }
      },
    });
  };

  const handleDeny = (overrideId: string) => {
    Modal.confirm({
      title: 'Deny Override Request',
      content: 'Please provide a reason for denial:',
      onOk: async () => {
        try {
          // await apiClient.denyOverride(overrideId, 'Reason here');
          message.success('Override request denied');
        } catch (error) {
          message.error('Failed to deny override');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <AntText code>{id}</AntText>,
    },
    {
      title: 'Requested By',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type.replace('_', ' ').toUpperCase()}</Tag>,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'approved' ? 'green' : status === 'denied' ? 'red' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        record.status === 'pending' && (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id)}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => handleDeny(record.id)}
            >
              Deny
            </Button>
          </Space>
        )
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <Title level={2}>Override Requests</Title>

        <Card style={{ marginTop: 24 }}>
          <Table
            columns={columns}
            dataSource={mockOverrides}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default OverridesPage;

