/**
 * Override Requests Page - Clean version with Ant Design only
 */

import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

function OverridesPage() {
  const mockOverrides = [
    {
      id: 'OVR-001',
      type: 'TRUCK_VERIFICATION',
      requestedBy: 'Franchise-Kurnool',
      truckId: 'TRK-AP09CD5678',
      reason: 'Vahan API mismatch - verified manually',
      status: 'PENDING',
      requestedAt: '2025-12-03',
    },
    {
      id: 'OVR-002',
      type: 'KYC_VERIFICATION',
      requestedBy: 'Franchise-Vijayawada',
      userId: 'OP-045',
      reason: 'Document upload issue - verified via physical inspection',
      status: 'PENDING',
      requestedAt: '2025-12-02',
    },
    {
      id: 'OVR-003',
      type: 'PAYMENT_WAIVE',
      requestedBy: 'Support-Team',
      operatorId: 'OP-012',
      amount: '₹2,500',
      reason: 'System error caused double charge',
      status: 'APPROVED',
      requestedAt: '2025-12-01',
      approvedAt: '2025-12-01',
      approvedBy: 'ADMIN-001',
    },
  ];

  const handleApprove = (id: string) => {
    console.log('Approve override:', id);
    alert('Override approved!');
  };

  const handleReject = (id: string) => {
    console.log('Reject override:', id);
    alert('Override rejected!');
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type.replace(/_/g, ' ')}</Tag>,
    },
    {
      title: 'Requested By',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => (
        <div style={{ maxWidth: '300px' }}>{reason}</div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          'PENDING': 'orange',
          'APPROVED': 'green',
          'REJECTED': 'red',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Requested',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        record.status === 'PENDING' ? (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record.id)}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleReject(record.id)}
            >
              Reject
            </Button>
          </Space>
        ) : (
          <Tag color={record.status === 'APPROVED' ? 'green' : 'red'}>
            {record.status} by {record.approvedBy || 'System'}
          </Tag>
        )
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Override Requests</h1>

        <Card style={{ marginTop: '24px' }}>
          <Table
            columns={columns}
            dataSource={mockOverrides}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default OverridesPage;
