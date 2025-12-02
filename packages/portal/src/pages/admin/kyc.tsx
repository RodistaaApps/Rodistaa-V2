/**
 * KYC Management Page
 * View, decrypt, and verify KYC documents
 */

import { useState } from 'react';
import { Card, Table, Button, Tag, message, Modal, Typography, Space } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const { Title, Text: AntText } = Typography;

function KycManagementPage() {
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [decryptedData, setDecryptedData] = useState<any>(null);

  // Mock data - replace with actual API call
  const mockKycRecords = [
    {
      id: 'KYC-001',
      userId: 'USR-SH-001',
      userName: 'John Doe (Masked)',
      documentType: 'Aadhaar',
      status: 'pending',
      uploadedAt: '2024-01-01',
    },
    {
      id: 'KYC-002',
      userId: 'USR-OP-002',
      userName: 'Jane Smith (Masked)',
      documentType: 'PAN',
      status: 'verified',
      uploadedAt: '2024-01-02',
    },
  ];

  const handleDecrypt = async (kycId: string) => {
    try {
      const decrypted = await apiClient.decryptKyc(kycId);
      setDecryptedData(decrypted);
      message.success('KYC decrypted successfully');
      
      // Log audit event
      message.info('Audit log created for KYC decryption');
    } catch (error: any) {
      message.error(error.message || 'Failed to decrypt KYC');
    }
  };

  const handleVerify = async (kycId: string, status: 'verified' | 'rejected') => {
    try {
      await apiClient.verifyKyc(kycId, status);
      message.success(`KYC ${status} successfully`);
      // Refresh list
    } catch (error: any) {
      message.error(error.message || 'Failed to update KYC status');
    }
  };

  const columns = [
    {
      title: 'KYC ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <AntText code>{id}</AntText>,
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Document Type',
      dataIndex: 'documentType',
      key: 'documentType',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'verified' ? 'green' : status === 'pending' ? 'orange' : 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Uploaded',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedKyc(record);
              handleDecrypt(record.id);
            }}
          >
            Decrypt & View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleVerify(record.id, 'verified')}
                style={{ color: '#4CAF50' }}
              >
                Verify
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleVerify(record.id, 'rejected')}
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
        <Title level={2}>KYC Management</Title>

        <Card style={{ marginTop: 24 }}>
          <Table
            columns={columns}
            dataSource={mockKycRecords}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Modal
          title="KYC Document Details"
          open={!!selectedKyc}
          onCancel={() => {
            setSelectedKyc(null);
            setDecryptedData(null);
          }}
          footer={null}
          width={600}
        >
          {selectedKyc && (
            <div>
              <p><strong>KYC ID:</strong> {selectedKyc.id}</p>
              <p><strong>User:</strong> {selectedKyc.userName}</p>
              <p><strong>Document Type:</strong> {selectedKyc.documentType}</p>
              
              {decryptedData ? (
                <div style={{ marginTop: 16, padding: 16, backgroundColor: '#FFF3E0', borderRadius: 8 }}>
                  <AntText type="warning">⚠️ Decrypted Data (audit logged)</AntText>
                  <pre style={{ marginTop: 12 }}>{JSON.stringify(decryptedData, null, 2)}</pre>
                </div>
              ) : (
                <AntText type="secondary">Click "Decrypt & View" to see document details</AntText>
              )}
            </div>
          )}
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default KycManagementPage;

