/**
 * KYC Management Page - Uses design system KYCViewer component
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { RCardWeb, RTableWeb, RButtonWeb, KYCViewer } from '@rodistaa/design-system';
import { RodistaaColors, WebTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

function KycManagementPage() {
  const [selectedKyc, setSelectedKyc] = useState<any>(null);

  const mockKycRecords = [
    {
      id: 'KYC-001',
      userId: 'USR-SH-001',
      userName: 'John Doe (Masked)',
      documentType: 'aadhaar' as const,
      status: 'pending',
      uploadedAt: '2024-01-01',
      encrypted: true,
    },
    {
      id: 'KYC-002',
      userId: 'USR-OP-002',
      userName: 'Jane Smith (Masked)',
      documentType: 'pan' as const,
      status: 'verified',
      uploadedAt: '2024-01-02',
      encrypted: true,
      decryptedData: {
        name: 'Jane Smith',
        number: 'ABCDE1234F',
      },
    },
  ];

  const handleDecrypt = async (kycId: string) => {
    const kyc = mockKycRecords.find((k) => k.id === kycId);
    if (kyc) {
      kyc.decryptedData = {
        name: 'Decrypted Name',
        number: 'Decrypted Number',
        dob: '1990-01-01',
        address: 'Decrypted Address',
      };
      setSelectedKyc({ ...kyc });
    }
  };

  const handleVerify = async (kycId: string, status: 'verified' | 'rejected') => {
    const kyc = mockKycRecords.find((k) => k.id === kycId);
    if (kyc) {
      kyc.status = status;
      setSelectedKyc({ ...kyc });
    }
  };

  const columns = [
    {
      title: 'KYC ID',
      dataIndex: 'id',
      key: 'id',
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
      render: (type: string) => type.toUpperCase(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => status.toUpperCase(),
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
        <div style={{ display: 'flex', gap: `${RodistaaSpacing.sm}px` }}>
          <RButtonWeb
            variant="secondary"
            size="small"
            onClick={() => {
              setSelectedKyc(record);
              handleDecrypt(record.id);
            }}
          >
            <EyeOutlined /> Decrypt & View
          </RButtonWeb>
          {record.status === 'pending' && (
            <>
              <RButtonWeb
                variant="primary"
                size="small"
                onClick={() => handleVerify(record.id, 'verified')}
              >
                <CheckCircleOutlined /> Verify
              </RButtonWeb>
              <RButtonWeb
                variant="danger"
                size="small"
                onClick={() => handleVerify(record.id, 'rejected')}
              >
                <CloseCircleOutlined /> Reject
              </RButtonWeb>
            </>
          )}
        </div>
      ),
    },
  ];

  const kycDocuments = selectedKyc
    ? [
        {
          id: selectedKyc.id,
          type: selectedKyc.documentType,
          encrypted: selectedKyc.encrypted,
          decryptedData: selectedKyc.decryptedData,
        },
      ]
    : [];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FRAUD_INVESTIGATOR']}>
      <AdminLayout>
        <h1 style={{ ...WebTextStyles.h1, marginBottom: RodistaaSpacing.xl }}>KYC Management</h1>

        <RCardWeb style={{ marginTop: RodistaaSpacing.xl }}>
          <RTableWeb
            columns={columns}
            data={mockKycRecords}
            pagination={{ pageSize: 10 }}
          />
        </RCardWeb>

        {selectedKyc && (
          <RCardWeb style={{ marginTop: RodistaaSpacing.xl }}>
            <h2 style={{ ...WebTextStyles.h2, marginBottom: RodistaaSpacing.lg }}>
              KYC Document: {selectedKyc.id}
            </h2>
            <KYCViewer
              documents={kycDocuments}
              canDecrypt={true}
              onDecrypt={handleDecrypt}
              onViewDocument={(docId) => console.log('View document:', docId)}
            />
          </RCardWeb>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default KycManagementPage;
