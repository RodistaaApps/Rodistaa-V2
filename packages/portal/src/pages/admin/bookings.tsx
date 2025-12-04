/**
 * Bookings Management - Redesigned to match reference UI
 * Dark theme with status filters and modern table
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Button, Modal, Select, Input, Badge } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Search } = Input;

function BookingsManagementPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeStatus, setActiveStatus] = useState('all');

  const mockBookings = [
    {
      id: 'BKG-001',
      customer: 'Ramesh Enterprises',
      phone: '+91 98765 43210',
      route: 'Mumbai → Pune',
      loadType: 'Full Load',
      truckType: '32 FT FTL',
      scheduled: '2024-02-20',
      quotes: 3,
      status: 'ACCEPTED',
      distance: '150 km',
      pickupAddress: 'Bandra East, Mumbai, Maharashtra 400051',
      dropAddress: 'Hinjewadi, Pune, Maharashtra 411057',
      scheduledTime: '09:00',
      quantity: '10 Tons',
      goodsType: 'Electronics',
      notes: 'Handle with care. Fragile items. Need temperature controlled truck.',
    },
    {
      id: 'BKG-002',
      customer: 'Amit Logistics Pvt Ltd',
      phone: '+91 98765 54321',
      route: 'Pune → Bangalore',
      loadType: 'Partial Load',
      truckType: '20 FT PTL',
      scheduled: '2024-02-22',
      quotes: 5,
      status: 'QUOTED',
    },
    {
      id: 'BKG-003',
      customer: 'Delhi Traders',
      phone: '+91 98765 11111',
      route: 'Delhi → Jaipur',
      loadType: 'Full Load',
      truckType: 'CONTAINER',
      scheduled: '2024-02-19',
      quotes: 2,
      status: 'ASSIGNED',
    },
    {
      id: 'BKG-004',
      customer: 'Mumbai Mart',
      phone: '+91 98765 22222',
      route: 'Mumbai → Surat',
      loadType: 'Full Load',
      truckType: '32 FT FTL',
      scheduled: '2024-02-25',
      quotes: 0,
      status: 'NEW',
    },
    {
      id: 'BKG-005',
      customer: 'Bangalore Tech Solutions',
      phone: '+91 98765 33333',
      route: 'Bangalore → Chennai',
      loadType: 'Partial Load',
      truckType: '20 FT PTL',
      scheduled: '2024-02-10',
      quotes: 4,
      status: 'COMPLETED',
    },
    {
      id: 'BKG-006',
      customer: 'Hyderabad Warehousing',
      phone: '+91 98765 44444',
      route: 'Hyderabad → Mumbai',
      loadType: 'Full Load',
      truckType: '32 FT FTL',
      scheduled: '2024-02-16',
      quotes: 1,
      status: 'CANCELLED',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'NEW': '#3B82F6',
      'ACCEPTED': '#10B981',
      'QUOTED': '#F59E0B',
      'ASSIGNED': '#8B5CF6',
      'COMPLETED': '#10B981',
      'CANCELLED': '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const statusCounts = {
    all: mockBookings.length,
    new: mockBookings.filter(b => b.status === 'NEW').length,
    accepted: mockBookings.filter(b => b.status === 'ACCEPTED').length,
    quoted: mockBookings.filter(b => b.status === 'QUOTED').length,
    assigned: mockBookings.filter(b => b.status === 'ASSIGNED').length,
    completed: mockBookings.filter(b => b.status === 'COMPLETED').length,
    cancelled: mockBookings.filter(b => b.status === 'CANCELLED').length,
  };

  const filteredBookings = activeStatus === 'all' 
    ? mockBookings 
    : mockBookings.filter(b => b.status === activeStatus.toUpperCase());

  const columns = [
    {
      title: 'BOOKING ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{id}</span>,
    },
    {
      title: 'CUSTOMER',
      key: 'customer',
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 500, color: '#FFFFFF' }}>{record.customer}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'ROUTE',
      dataIndex: 'route',
      key: 'route',
      render: (route: string) => <span style={{ color: '#FFFFFF' }}>{route}</span>,
    },
    {
      title: 'LOAD TYPE',
      dataIndex: 'loadType',
      key: 'loadType',
      render: (type: string) => <span style={{ color: '#B4B9C5' }}>{type}</span>,
    },
    {
      title: 'TRUCK TYPE',
      dataIndex: 'truckType',
      key: 'truckType',
      render: (type: string) => <span style={{ color: '#B4B9C5' }}>{type}</span>,
    },
    {
      title: 'SCHEDULED',
      dataIndex: 'scheduled',
      key: 'scheduled',
      render: (date: string) => <span style={{ color: '#B4B9C5' }}>{date}</span>,
    },
    {
      title: 'QUOTES',
      dataIndex: 'quotes',
      key: 'quotes',
      render: (quotes: number) => (
        <span style={{ color: '#C90D0D', fontWeight: 600 }}>{quotes}</span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
          background: `${getStatusColor(status)}20`,
          color: getStatusColor(status),
          border: `1px solid ${getStatusColor(status)}`,
        }}>
          {status}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          size="small"
          style={{ 
            background: '#1E2430', 
            color: '#FFFFFF', 
            border: '1px solid #2D3748' 
          }}
          onClick={() => {
            setSelectedBooking(record);
            setModalVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const statusTabs = [
    { key: 'all', label: `All (${statusCounts.all})` },
    { key: 'new', label: `New (${statusCounts.new})` },
    { key: 'accepted', label: `Accepted (${statusCounts.accepted})` },
    { key: 'quoted', label: `Quoted (${statusCounts.quoted})` },
    { key: 'assigned', label: `Assigned (${statusCounts.assigned})` },
    { key: 'completed', label: `Completed (${statusCounts.completed})` },
    { key: 'cancelled', label: `Cancelled (${statusCounts.cancelled})` },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <div style={{ padding: '24px', background: '#0A0E14', minHeight: '100vh' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '8px' }}>
              Booking Management
            </h1>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>
              Manage bookings, quotes, and assignments
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {statusTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: activeStatus === tab.key ? '2px solid #C90D0D' : '1px solid #2D3748',
                  background: activeStatus === tab.key ? '#C90D0D20' : '#151922',
                  color: activeStatus === tab.key ? '#C90D0D' : '#B4B9C5',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters and Actions */}
          <div style={{
            background: '#151922',
            border: '1px solid #2D3748',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
              <Search
                placeholder="Search..."
                style={{ width: 250 }}
                prefix={<SearchOutlined style={{ color: '#6B7280' }} />}
              />
              <Select defaultValue="all" style={{ width: 120 }}>
                <Select.Option value="all">All Pickup</Select.Option>
              </Select>
              <Select defaultValue="all" style={{ width: 120 }}>
                <Select.Option value="all">All Drop</Select.Option>
              </Select>
              <Select defaultValue="all" style={{ width: 120 }}>
                <Select.Option value="all">All Trucks</Select.Option>
              </Select>
              <Button style={{ color: '#6B7280' }}>Clear</Button>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ color: '#B4B9C5' }}>{filteredBookings.length} bookings</span>
              <Button icon={<DownloadOutlined />} style={{ background: '#1E2430', color: '#FFFFFF', border: '1px solid #2D3748' }}>
                Export
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                style={{ background: '#C90D0D', borderColor: '#C90D0D' }}
              >
                Add Booking
              </Button>
            </div>
          </div>

          {/* Bookings Table */}
          <div style={{
            background: '#151922',
            border: '1px solid #2D3748',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <Table
              columns={columns}
              dataSource={filteredBookings}
              rowKey="id"
              pagination={{ 
                pageSize: 20,
                style: { 
                  padding: '16px',
                },
              }}
            />
          </div>

          {/* Booking Detail Modal */}
          <Modal
            title={null}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={900}
            style={{ top: 20 }}
          >
            {selectedBooking && (
              <div style={{ background: '#151922', color: '#FFFFFF' }}>
                {/* Modal Header */}
                <div style={{ 
                  padding: '24px', 
                  borderBottom: '1px solid #2D3748',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: '#C90D0D20',
                    border: '1px solid #C90D0D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#C90D0D',
                  }}>
                    📦
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{selectedBooking.id}</h2>
                    <div style={{ color: '#6B7280' }}>{selectedBooking.customer}</div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs 
                  defaultActiveKey="details" 
                  style={{ padding: '0 24px' }}
                  items={[
                    {
                      key: 'details',
                      label: 'Details',
                      children: (
                        <div style={{ paddingBottom: '24px' }}>
                          {/* Route Details */}
                          <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#B4B9C5', textTransform: 'uppercase' }}>
                              Route Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                                  {selectedBooking.route.split(' → ')[0]}
                                </div>
                                <div style={{ color: '#6B7280', fontSize: '14px' }}>
                                  {selectedBooking.pickupAddress}
                                </div>
                              </div>
                              <div style={{ color: '#C90D0D', fontSize: '24px' }}>
                                <ArrowRightOutlined />
                              </div>
                              <div>
                                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                                  {selectedBooking.route.split(' → ')[1]}
                                </div>
                                <div style={{ color: '#6B7280', fontSize: '14px' }}>
                                  {selectedBooking.dropAddress}
                                </div>
                              </div>
                            </div>
                            {selectedBooking.distance && (
                              <div style={{ marginTop: '16px', fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
                                Distance: {selectedBooking.distance}
                              </div>
                            )}
                          </div>

                          {/* Schedule */}
                          {selectedBooking.scheduledTime && (
                            <div style={{ marginBottom: '24px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#B4B9C5', textTransform: 'uppercase' }}>
                                Schedule
                              </h3>
                              <div style={{ display: 'flex', gap: '32px' }}>
                                <div>
                                  <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}>Scheduled Date</div>
                                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedBooking.scheduled}</div>
                                </div>
                                <div>
                                  <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}>Scheduled Time</div>
                                  <div style={{ fontSize: '16px', fontWeight: 600' }}>{selectedBooking.scheduledTime}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Requirements */}
                          {selectedBooking.quantity && (
                            <div style={{ marginBottom: '24px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#B4B9C5', textTransform: 'uppercase' }}>
                                Requirements
                              </h3>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                <div>
                                  <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}>Truck Type</div>
                                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedBooking.truckType}</div>
                                </div>
                                <div>
                                  <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}>Load Type</div>
                                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedBooking.loadType}</div>
                                </div>
                                <div>
                                  <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}>Quantity</div>
                                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedBooking.quantity}</div>
                                </div>
                                <div>
                                  <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}>Goods Type</div>
                                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedBooking.goodsType}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {selectedBooking.notes && (
                            <div>
                              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#B4B9C5', textTransform: 'uppercase' }}>
                                Notes
                              </h3>
                              <div style={{ 
                                padding: '16px', 
                                background: '#1E2430', 
                                borderRadius: '8px', 
                                color: '#B4B9C5',
                                fontSize: '14px',
                                lineHeight: '1.6',
                              }}>
                                {selectedBooking.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'quotes',
                      label: (
                        <Badge count={selectedBooking.quotes} offset={[10, 0]}>
                          <span>Quotes</span>
                        </Badge>
                      ),
                      children: <div style={{ padding: '24px', color: '#6B7280' }}>Quotes list would be displayed here</div>,
                    },
                    {
                      key: 'assigned',
                      label: 'Assigned',
                      children: <div style={{ padding: '24px', color: '#6B7280' }}>Assignment details would be displayed here</div>,
                    },
                    {
                      key: 'documents',
                      label: 'Documents',
                      children: <div style={{ padding: '24px', color: '#6B7280' }}>Documents would be displayed here</div>,
                    },
                    {
                      key: 'activity',
                      label: (
                        <Badge count={3} offset={[10, 0]}>
                          <span>Activity</span>
                        </Badge>
                      ),
                      children: <div style={{ padding: '24px', color: '#6B7280' }}>Activity log would be displayed here</div>,
                    },
                  ]}
                />
              </div>
            )}
          </Modal>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default BookingsManagementPage;
