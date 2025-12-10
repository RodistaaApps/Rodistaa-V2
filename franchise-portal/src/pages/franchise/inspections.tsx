/**
 * Inspection Management Page (Unit Franchise) - Uses design system InspectionGrid
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Layout } from 'antd';
import { RCardWeb, RTableWeb, RButtonWeb, RModalWeb, InspectionGrid } from '@rodistaa/design-system';
import { RodistaaColors, WebTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { CameraOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

function InspectionsPage() {
  const [inspectionModal, setInspectionModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);

  const pendingInspections = [
    { id: 1, truck: 'KA 01 AB 1234', dueDate: '2024-01-05', operator: 'ABC Transport' },
    { id: 2, truck: 'KA 02 EF 5678', dueDate: '2024-01-07', operator: 'XYZ Logistics' },
  ];

  const handlePerformInspection = (truck: any) => {
    setSelectedTruck(truck);
    setInspectionModal(true);
  };

  const handleSubmitInspection = async (photos: any[]) => {
    console.log('Submit inspection:', selectedTruck, photos);
    setInspectionModal(false);
    setSelectedTruck(null);
  };

  const columns = [
    { title: 'Truck', dataIndex: 'truck', key: 'truck' },
    { title: 'Operator', dataIndex: 'operator', key: 'operator' },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <RButtonWeb
          variant="primary"
          size="small"
          onClick={() => handlePerformInspection(record)}
        >
          <CameraOutlined /> Perform Inspection
        </RButtonWeb>
      ),
    },
  ];

  const inspectionPhotos = selectedTruck
    ? [
        {
          id: '1',
          url: '',
          type: 'front' as const,
          uploadedAt: new Date().toISOString(),
        },
        {
          id: '2',
          url: '',
          type: 'back' as const,
          uploadedAt: new Date().toISOString(),
        },
        {
          id: '3',
          url: '',
          type: 'left' as const,
          uploadedAt: new Date().toISOString(),
        },
        {
          id: '4',
          url: '',
          type: 'right' as const,
          uploadedAt: new Date().toISOString(),
        },
      ]
    : [];

  return (
    <ProtectedRoute allowedRoles={['FRANCHISE_UNIT']}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ backgroundColor: RodistaaColors.primary.main, color: RodistaaColors.primary.contrast, padding: '0 24px' }}>
          <h1 style={{ ...WebTextStyles.h1, color: RodistaaColors.primary.contrast, margin: 0, lineHeight: '64px' }}>
            Rodistaa Franchise Portal
          </h1>
        </Header>
        <Content style={{ padding: RodistaaSpacing.xl }}>
          <h1 style={{ ...WebTextStyles.h1, marginBottom: RodistaaSpacing.xl }}>Inspection Management</h1>

          <RCardWeb title="Pending Inspections" style={{ marginTop: RodistaaSpacing.xl }}>
            <RTableWeb columns={columns} data={pendingInspections} pagination={false} />
          </RCardWeb>

          <RModalWeb
            visible={inspectionModal}
            onClose={() => {
              setInspectionModal(false);
              setSelectedTruck(null);
            }}
            title={`Perform Inspection: ${selectedTruck?.truck}`}
            size="large"
          >
            {selectedTruck && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.lg}px` }}>
                <InspectionGrid
                  photos={inspectionPhotos}
                  onUpload={(type, file) => {
                    console.log('Upload photo:', type, file);
                    const photo = inspectionPhotos.find((p) => p.type === type);
                    if (photo) {
                      photo.url = URL.createObjectURL(file);
                    }
                  }}
                  canUpload={true}
                />

                <RButtonWeb
                  variant="primary"
                  onClick={() => handleSubmitInspection(inspectionPhotos)}
                >
                  <CheckCircleOutlined /> Submit Inspection
                </RButtonWeb>
              </div>
            )}
          </RModalWeb>
        </Content>
      </Layout>
    </ProtectedRoute>
  );
}

export default InspectionsPage;
