/**
 * Bookings Management Page - Uses design system components
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { RCardWeb, RTableWeb, RModalWeb, RButtonWeb, LoadCardWeb } from '@rodistaa/design-system';
import { RodistaaColors, WebTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';

function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockBookings = [
    {
      id: 'RID-20240102-0001',
      shipper: 'ABC Corp',
      pickup: { address: '123 Main St', city: 'Bangalore', state: 'KA' },
      drop: { address: '456 Park Ave', city: 'Chennai', state: 'TN' },
      tonnage: 15,
      priceRange: { min: 20000, max: 30000 },
      status: 'OPEN_FOR_BIDDING' as const,
      bidsCount: 5,
      createdAt: '2024-01-02T10:00:00Z',
    },
    {
      id: 'RID-20240102-0002',
      shipper: 'XYZ Ltd',
      pickup: { address: '789 Market Rd', city: 'Mumbai', state: 'MH' },
      drop: { address: '321 Tower St', city: 'Delhi', state: 'DL' },
      tonnage: 20,
      priceRange: { min: 50000, max: 60000 },
      status: 'CONFIRMED' as const,
      bidsCount: 3,
      createdAt: '2024-01-02T09:30:00Z',
    },
  ];

  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Shipper',
      dataIndex: 'shipper',
      key: 'shipper',
    },
    {
      title: 'Route',
      key: 'route',
      render: (_: any, record: any) => `${record.pickup.city} → ${record.drop.city}`,
    },
    {
      title: 'Weight',
      dataIndex: 'tonnage',
      key: 'tonnage',
      render: (tonnage: number) => `${tonnage} tons`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Bids',
      dataIndex: 'bidsCount',
      key: 'bidsCount',
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
              setSelectedBooking(record);
              setModalVisible(true);
            }}
          >
            <EyeOutlined /> View
          </RButtonWeb>
          {record.status === 'OPEN_FOR_BIDDING' && (
            <RButtonWeb variant="primary" size="small">
              <CheckCircleOutlined /> Force Finalize
            </RButtonWeb>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <h1 style={{ ...WebTextStyles.h1, marginBottom: RodistaaSpacing.xl }}>Booking Management</h1>

        <RCardWeb style={{ marginTop: RodistaaSpacing.xl }}>
          <RTableWeb
            columns={columns}
            data={mockBookings.map((booking) => ({
              ...booking,
              status: booking.status.replace('_', ' '),
            }))}
            pagination={{ pageSize: 20 }}
          />
        </RCardWeb>

        <RModalWeb
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Booking Details"
          size="large"
        >
          {selectedBooking && (
            <LoadCardWeb
              id={selectedBooking.id}
              pickup={selectedBooking.pickup}
              drop={selectedBooking.drop}
              tonnage={selectedBooking.tonnage}
              priceRange={selectedBooking.priceRange}
              status={selectedBooking.status}
              bidCount={selectedBooking.bidsCount}
              shipperName={selectedBooking.shipper}
              createdAt={selectedBooking.createdAt}
            />
          )}
        </RModalWeb>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default BookingsPage;
