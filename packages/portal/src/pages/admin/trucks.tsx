/**
 * Truck Management Page - Uses design system components
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { RCardWeb, RTableWeb, RModalWeb, RButtonWeb, TruckCardWeb, InspectionGrid } from '@rodistaa/design-system';
import { RodistaaColors, WebTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { CarOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';

function TruckManagementPage() {
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockTrucks = [
    {
      id: 'TRK-KA01AB1234-001',
      registrationNumber: 'KA 01 AB 1234',
      vehicleType: 'Container 20ft',
      capacityTons: 10,
      bodyType: 'Container',
      operatorName: 'ABC Transport',
      status: 'ACTIVE' as const,
      lastInspection: '2024-01-01',
      nextInspectionDue: '2024-04-30',
      docsExpiring: 0,
    },
    {
      id: 'TRK-MH02CD5678-002',
      registrationNumber: 'MH 02 CD 5678',
      vehicleType: 'Container 40ft',
      capacityTons: 20,
      bodyType: 'Container',
      operatorName: 'XYZ Logistics',
      status: 'EXPIRED_DOCS' as const,
      lastInspection: '2023-12-15',
      nextInspectionDue: '2024-04-13',
      docsExpiring: 2,
    },
  ];

  const inspectionPhotos = selectedTruck
    ? [
        {
          id: '1',
          url: '/placeholder-truck.jpg',
          type: 'front' as const,
          uploadedAt: selectedTruck.lastInspection,
          geotagged: true,
        },
        {
          id: '2',
          url: '/placeholder-truck.jpg',
          type: 'back' as const,
          uploadedAt: selectedTruck.lastInspection,
          geotagged: true,
        },
        {
          id: '3',
          url: '/placeholder-truck.jpg',
          type: 'left' as const,
          uploadedAt: selectedTruck.lastInspection,
          geotagged: true,
        },
        {
          id: '4',
          url: '/placeholder-truck.jpg',
          type: 'right' as const,
          uploadedAt: selectedTruck.lastInspection,
          geotagged: true,
        },
      ]
    : [];

  const handleBlock = async (truckId: string) => {
    const truck = mockTrucks.find((t) => t.id === truckId);
    if (truck) {
      truck.status = 'BLOCKED';
    }
  };

  const handleUnblock = async (truckId: string) => {
    const truck = mockTrucks.find((t) => t.id === truckId);
    if (truck) {
      truck.status = 'ACTIVE';
    }
  };

  const columns = [
    {
      title: 'Registration',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
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
      render: (status: string) => status.replace('_', ' '),
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
        <span style={{ color: record.docsExpiring > 0 ? RodistaaColors.error.main : RodistaaColors.text.primary }}>
          {date}
          {record.docsExpiring > 0 && ` (${record.docsExpiring} docs expiring)`}
        </span>
      ),
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
              setSelectedTruck(record);
              setModalVisible(true);
            }}
          >
            View Details
          </RButtonWeb>
          {record.status === 'BLOCKED' ? (
            <RButtonWeb variant="primary" size="small" onClick={() => handleUnblock(record.id)}>
              <CheckCircleOutlined /> Unblock
            </RButtonWeb>
          ) : (
            <RButtonWeb variant="danger" size="small" onClick={() => handleBlock(record.id)}>
              <StopOutlined /> Block
            </RButtonWeb>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <h1 style={{ ...WebTextStyles.h1, marginBottom: RodistaaSpacing.xl }}>Truck Management</h1>

        <RCardWeb style={{ marginTop: RodistaaSpacing.xl }}>
          <RTableWeb columns={columns} data={mockTrucks} pagination={{ pageSize: 20 }} />
        </RCardWeb>

        <RModalWeb
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedTruck(null);
          }}
          title={`Truck Details: ${selectedTruck?.registrationNumber}`}
          size="large"
        >
          {selectedTruck && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.lg}px` }}>
              <TruckCardWeb
                id={selectedTruck.id}
                registrationNumber={selectedTruck.registrationNumber}
                vehicleType={selectedTruck.vehicleType}
                capacityTons={selectedTruck.capacityTons}
                bodyType={selectedTruck.bodyType}
                status={selectedTruck.status}
                inspectionDue={selectedTruck.nextInspectionDue}
                operatorName={selectedTruck.operatorName}
              />

              <div>
                <h3 style={{ ...WebTextStyles.h3, marginBottom: RodistaaSpacing.md }}>Inspection Photos</h3>
                <InspectionGrid
                  photos={inspectionPhotos}
                  onPhotoClick={(photo) => console.log('View photo:', photo)}
                  canUpload={false}
                />
              </div>

              <div>
                <h3 style={{ ...WebTextStyles.h3, marginBottom: RodistaaSpacing.md }}>Documents</h3>
                <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.secondary }}>
                  Document status and expiry tracking
                </div>
              </div>
            </div>
          )}
        </RModalWeb>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default TruckManagementPage;
