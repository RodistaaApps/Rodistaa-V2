/**
 * Shipments Management Page - Uses design system components
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { RCardWeb, RTableWeb, RModalWeb, RButtonWeb, TimelineWeb } from '@rodistaa/design-system';
import { RodistaaColors, WebTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { EyeOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons';

function ShipmentsPage() {
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockShipments = [
    {
      id: 'SH-001',
      bookingId: 'RID-20240102-0001',
      route: 'Bangalore → Chennai',
      driver: 'Rajesh Kumar',
      truck: 'KA 01 AB 1234',
      status: 'IN_TRANSIT' as const,
      progress: 65,
      hasPod: false,
    },
    {
      id: 'SH-002',
      bookingId: 'RID-20240101-0087',
      route: 'Mumbai → Delhi',
      driver: 'Amit Singh',
      truck: 'MH 02 CD 5678',
      status: 'COMPLETED' as const,
      progress: 100,
      hasPod: true,
    },
  ];

  const timelineEvents = selectedShipment
    ? [
        {
          id: '1',
          title: 'Shipment Created',
          description: 'Shipment assigned to driver',
          timestamp: '2024-01-02T08:00:00Z',
          status: 'completed' as const,
        },
        {
          id: '2',
          title: 'Pickup Completed',
          description: 'Driver completed pickup',
          timestamp: '2024-01-02T10:00:00Z',
          status: 'completed' as const,
        },
        {
          id: '3',
          title: 'In Transit',
          description: 'On route to destination',
          timestamp: '2024-01-02T12:00:00Z',
          status: selectedShipment.status === 'IN_TRANSIT' ? ('active' as const) : ('completed' as const),
        },
        {
          id: '4',
          title: 'Delivered',
          description: 'Shipment completed',
          timestamp: '2024-01-02T18:00:00Z',
          status: selectedShipment.status === 'COMPLETED' ? ('completed' as const) : ('pending' as const),
        },
      ]
    : [];

  const columns = [
    {
      title: 'Shipment ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
    },
    {
      title: 'Driver',
      dataIndex: 'driver',
      key: 'driver',
    },
    {
      title: 'Truck',
      dataIndex: 'truck',
      key: 'truck',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => status.replace('_', ' ').toUpperCase(),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <RButtonWeb
          variant="secondary"
          size="small"
          onClick={() => {
            setSelectedShipment(record);
            setModalVisible(true);
          }}
        >
          <EyeOutlined /> Details
        </RButtonWeb>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <h1 style={{ ...WebTextStyles.h1, marginBottom: RodistaaSpacing.xl }}>Shipment Management</h1>

        <RCardWeb style={{ marginTop: RodistaaSpacing.xl }}>
          <RTableWeb
            columns={columns}
            data={mockShipments}
            pagination={{ pageSize: 20 }}
          />
        </RCardWeb>

        <RModalWeb
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={`Shipment: ${selectedShipment?.id}`}
          size="large"
        >
          {selectedShipment && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.lg}px` }}>
              <div>
                <h3 style={{ ...WebTextStyles.h3, marginBottom: RodistaaSpacing.md }}>Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: `${RodistaaSpacing.md}px` }}>
                  <div>
                    <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>Booking ID</div>
                    <div style={{ ...WebTextStyles.body }}>{selectedShipment.bookingId}</div>
                  </div>
                  <div>
                    <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>Route</div>
                    <div style={{ ...WebTextStyles.body }}>{selectedShipment.route}</div>
                  </div>
                  <div>
                    <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>Driver</div>
                    <div style={{ ...WebTextStyles.body }}>{selectedShipment.driver}</div>
                  </div>
                  <div>
                    <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>Truck</div>
                    <div style={{ ...WebTextStyles.body }}>{selectedShipment.truck}</div>
                  </div>
                  <div>
                    <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>Progress</div>
                    <div style={{ ...WebTextStyles.body }}>{selectedShipment.progress}%</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ ...WebTextStyles.h3, marginBottom: RodistaaSpacing.md }}>Timeline</h3>
                <TimelineWeb events={timelineEvents} />
              </div>

              <div>
                <h3 style={{ ...WebTextStyles.h3, marginBottom: RodistaaSpacing.md }}>
                  <EnvironmentOutlined /> GPS Tracking
                </h3>
                <div
                  style={{
                    height: '400px',
                    backgroundColor: RodistaaColors.background.paper,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
                  }}
                >
                  <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.secondary }}>
                    GPS Map View (integrate with maps)
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ ...WebTextStyles.h3, marginBottom: RodistaaSpacing.md }}>
                  <FileTextOutlined /> POD
                </h3>
                {selectedShipment.hasPod ? (
                  <div
                    style={{
                      height: '400px',
                      backgroundColor: RodistaaColors.background.paper,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
                    }}
                  >
                    <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.secondary }}>
                      PDF Viewer (react-pdf integration)
                    </div>
                  </div>
                ) : (
                  <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.secondary }}>
                    POD not yet uploaded
                  </div>
                )}
              </div>
            </div>
          )}
        </RModalWeb>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default ShipmentsPage;
