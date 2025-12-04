/**
 * KYC Management Page - Clean version with Ant Design only
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space, Modal } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

function KYCManagementPage() {
  const [selectedKyc, setSelectedKyc] = useState<any>(null);

  const mockKycRecords = [
    {
      id: 'KYC-OP-001',
      userId: 'OP-001',
      name: 'Rajesh Kumar',
      role: 'Operator',
      phone: '+919876543210',
      status: 'pending',
      submittedAt: '2025-12-02',
      documentCount: 3,
    },
    {
      id: 'KYC-DR-002',
      userId: 'DR-002',
      name: 'Suresh Reddy',
      role: 'Driver',
      phone: '+919876543211',
      status: 'pending',
      submittedAt: '2025-12-03',
      documentCount: 2,
    },
    {
      id: 'KYC-SH-003',
      userId: 'SH-003',
      name: 'Krishna Enterprises',
      role: 'Shipper',
      phone: '+919876543212',
      status: 'verified',
      submittedAt: '2025-12-01',
      verifiedAt: '2025-12-02',
      documentCount: 4,
    },
  ];

  const handleViewKyc = (record: any) => {
    setSelectedKyc(record);
  };

  const handleVerify = (id: string) => {
    console.log('Verify KYC:', id);
    alert('KYC Verified successfully!');
  };

  const handleReject = (id: string) => {
    console.log('Reject KYC:', id);
    alert('KYC Rejected');
  };

  const columns = [
    {
      title: 'KYC ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Documents',
      dataIndex: 'documentCount',
      key: 'documentCount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'verified' ? 'green' : status === 'rejected' ? 'red' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewKyc(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleVerify(record.id)}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Verify
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record.id)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FRAUD_INVESTIGATOR']}>
      <AdminLayout>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>KYC Management</h1>

        <Card style={{ marginTop: '24px' }}>
          <Table
            columns={columns}
            dataSource={mockKycRecords}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>

        <Modal
          title={`KYC Details: ${selectedKyc?.id || ''}`}
          open={!!selectedKyc}
          onCancel={() => setSelectedKyc(null)}
          footer={null}
          width={800}
        >
          {selectedKyc && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                KYC Document: {selectedKyc.id}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Name</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedKyc.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Phone</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedKyc.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Role</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedKyc.role}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Documents</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedKyc.documentCount} uploaded</div>
                </div>
              </div>
              <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Document viewer would show encrypted/hashed Aadhaar, DL, etc.</div>
              </div>
            </div>
          )}
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default KYCManagementPage;
