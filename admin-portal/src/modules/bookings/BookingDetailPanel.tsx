/**
 * Booking Detail Panel
 * 
 * Comprehensive booking details with tabs:
 * - Overview: Full booking info, route, load details
 * - Bids & Negotiation: All bids with timeline
 * - Timeline & Events: Chronological event log
 * - Audit Log: Admin actions
 * - Related Shipments: Converted shipments
 */

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Tabs,
  Descriptions,
  Tag,
  Button,
  Table,
  Timeline,
  Space,
  Modal,
  Input,
  message,
  Badge,
  Tooltip,
  Statistic,
  Card,
} from 'antd';
import {
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  DollarOutlined,
  TruckOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;

interface BookingDetailPanelProps {
  bookingId: string | null;
  open: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

interface Booking {
  id: string;
  shipper_id: string;
  shipper_name: string;
  franchise_id: string;
  pickup_address: string;
  pickup_city: string;
  pickup_state: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_address: string;
  drop_city: string;
  drop_state: string;
  drop_lat: number;
  drop_lng: number;
  distance_km: number;
  material: string;
  weight_kg: number;
  dimensions: { length: number; width: number; height: number };
  special_instructions: string;
  attachments: string[];
  expected_price_min: number;
  expected_price_max: number;
  payment_mode: string;
  posted_at: string;
  auto_finalize_at: string | null;
  status: string;
  is_reopened: boolean;
  winning_bid_id: string | null;
  created_shipment_id: string | null;
  finalized_at: string | null;
  cancelled_at: string | null;
}

interface Bid {
  id: string;
  booking_id: string;
  operator_id: string;
  operator_name: string;
  truck_id: string;
  amount: number;
  original_amount: number;
  is_counter: boolean;
  counter_to_bid_id: string | null;
  status: string;
  metadata: any;
  placed_at: string;
  modified_at?: string;
}

interface Event {
  id: number;
  event_type: string;
  actor_id: string;
  actor_role: string;
  payload: any;
  created_at: string;
}

export const BookingDetailPanel: React.FC<BookingDetailPanelProps> = ({
  bookingId,
  open,
  onClose,
  theme = 'light',
}) => {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    type: 'finalize' | 'cancel' | 'reopen' | null;
    selectedBidId?: string;
  }>({ visible: false, type: null });
  const [actionReason, setActionReason] = useState('');

  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  useEffect(() => {
    if (bookingId && open) {
      fetchBookingDetails();
    }
  }, [bookingId, open]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      // TODO: Call API
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockBooking: Booking = {
        id: bookingId!,
        shipper_id: 'USR-20241',
        shipper_name: 'Rohit Sharma',
        franchise_id: 'FR-001',
        pickup_address: 'Warehouse 12, HITEC City, Hyderabad',
        pickup_city: 'Hyderabad',
        pickup_state: 'Telangana',
        pickup_lat: 17.4485,
        pickup_lng: 78.3908,
        drop_address: 'Industrial Area, Andheri, Mumbai',
        drop_city: 'Mumbai',
        drop_state: 'Maharashtra',
        drop_lat: 19.1136,
        drop_lng: 72.8697,
        distance_km: 710,
        material: 'Electronics & Components',
        weight_kg: 5000,
        dimensions: { length: 20, width: 8, height: 8 },
        special_instructions: 'Handle with care. Temperature controlled transport preferred.',
        attachments: ['/uploads/bookings/bkg001-manifest.pdf'],
        expected_price_min: 45000,
        expected_price_max: 55000,
        payment_mode: 'online',
        posted_at: '2025-12-05T09:00:00Z',
        auto_finalize_at: '2025-12-06T09:00:00Z',
        status: 'bidding',
        is_reopened: false,
        winning_bid_id: null,
        created_shipment_id: null,
        finalized_at: null,
        cancelled_at: null,
      };

      const mockBids: Bid[] = [
        {
          id: 'BID-001',
          booking_id: bookingId!,
          operator_id: 'OP-001',
          operator_name: 'ABC Transport',
          truck_id: 'DL01AB1234',
          amount: 48000,
          original_amount: 48000,
          is_counter: false,
          counter_to_bid_id: null,
          status: 'active',
          metadata: { estimated_hours: 18, fuel_included: true },
          placed_at: '2025-12-05T10:00:00Z',
        },
        {
          id: 'BID-002',
          booking_id: bookingId!,
          operator_id: 'OP-002',
          operator_name: 'XYZ Logistics',
          truck_id: 'HR26BX5678',
          amount: 52000,
          original_amount: 54000,
          is_counter: true,
          counter_to_bid_id: 'BID-001',
          status: 'active',
          metadata: { estimated_hours: 16 },
          placed_at: '2025-12-05T11:30:00Z',
          modified_at: '2025-12-05T12:00:00Z',
        },
      ];

      const mockEvents: Event[] = [
        {
          id: 1,
          event_type: 'BOOKING_POSTED',
          actor_id: 'USR-20241',
          actor_role: 'shipper',
          payload: { expected_price_max: 55000 },
          created_at: '2025-12-05T09:00:00Z',
        },
        {
          id: 2,
          event_type: 'BID_PLACED',
          actor_id: 'OP-001',
          actor_role: 'operator',
          payload: { bid_amount: 48000, truck_id: 'DL01AB1234' },
          created_at: '2025-12-05T10:00:00Z',
        },
      ];

      setBooking(mockBooking);
      setBids(mockBids);
      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      message.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: 'finalize' | 'cancel' | 'reopen') => {
    if (actionReason.length < 20) {
      message.error('Reason must be at least 20 characters');
      return;
    }

    try {
      // TODO: Call API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(`Booking ${type}d successfully`);
      setActionModal({ visible: false, type: null });
      setActionReason('');
      fetchBookingDetails();
      onClose();
    } catch (error) {
      message.error(`Failed to ${type} booking`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      posted: 'blue',
      bidding: 'orange',
      finalized: 'green',
      cancelled: 'red',
      converted: 'purple',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const renderOverviewTab = () => (
    <div style={{ padding: '16px 0' }}>
      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card size="small" style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Statistic
            title="Distance"
            value={booking?.distance_km}
            suffix="km"
            valueStyle={{ color: textPrimary, fontSize: '20px' }}
          />
        </Card>
        <Card size="small" style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Statistic
            title="Weight"
            value={(booking?.weight_kg || 0) / 1000}
            suffix="MT"
            precision={1}
            valueStyle={{ color: textPrimary, fontSize: '20px' }}
          />
        </Card>
        <Card size="small" style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Statistic
            title="Bids Received"
            value={bids.length}
            valueStyle={{ color: '#3B82F6', fontSize: '20px' }}
          />
        </Card>
        <Card size="small" style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Statistic
            title="Lowest Bid"
            value={Math.min(...bids.map(b => b.amount))}
            prefix="₹"
            valueStyle={{ color: '#10B981', fontSize: '20px' }}
          />
        </Card>
      </div>

      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Booking ID" span={2}>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{booking?.id}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(booking?.status || '')}>
            {booking?.status.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Posted">
          {dayjs(booking?.posted_at).format('DD MMM YYYY, HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="Shipper">
          {booking?.shipper_name}
        </Descriptions.Item>
        <Descriptions.Item label="Franchise">
          {booking?.franchise_id}
        </Descriptions.Item>
        <Descriptions.Item label="Pickup" span={2}>
          <div>
            <div style={{ fontWeight: 600 }}>{booking?.pickup_address}</div>
            <div style={{ color: textSecondary, fontSize: '12px' }}>
              {booking?.pickup_city}, {booking?.pickup_state}
            </div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Drop" span={2}>
          <div>
            <div style={{ fontWeight: 600 }}>{booking?.drop_address}</div>
            <div style={{ color: textSecondary, fontSize: '12px' }}>
              {booking?.drop_city}, {booking?.drop_state}
            </div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Material">
          {booking?.material}
        </Descriptions.Item>
        <Descriptions.Item label="Weight">
          {booking?.weight_kg.toLocaleString()} kg ({((booking?.weight_kg || 0) / 1000).toFixed(1)} MT)
        </Descriptions.Item>
        <Descriptions.Item label="Dimensions" span={2}>
          {booking?.dimensions.length}L × {booking?.dimensions.width}W × {booking?.dimensions.height}H ft
        </Descriptions.Item>
        <Descriptions.Item label="Expected Price Range" span={2}>
          ₹{booking?.expected_price_min.toLocaleString()} - ₹{booking?.expected_price_max.toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Payment Mode">
          <Tag>{booking?.payment_mode.toUpperCase()}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Auto-Finalize">
          {booking?.auto_finalize_at ? (
            <Tooltip title={dayjs(booking.auto_finalize_at).format('DD MMM YYYY, HH:mm')}>
              <span style={{ color: '#F59E0B' }}>
                <ClockCircleOutlined /> {dayjs(booking.auto_finalize_at).fromNow()}
              </span>
            </Tooltip>
          ) : (
            <span style={{ color: textSecondary }}>Manual</span>
          )}
        </Descriptions.Item>
        {booking?.special_instructions && (
          <Descriptions.Item label="Special Instructions" span={2}>
            {booking.special_instructions}
          </Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );

  const renderBidsTab = () => {
    const columns = [
      {
        title: 'Bid ID',
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => <span style={{ fontFamily: 'monospace' }}>{id}</span>,
      },
      {
        title: 'Operator',
        dataIndex: 'operator_name',
        key: 'operator_name',
      },
      {
        title: 'Truck',
        dataIndex: 'truck_id',
        key: 'truck_id',
        render: (truck: string) => <span style={{ fontFamily: 'monospace' }}>{truck}</span>,
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount: number, record: Bid) => (
          <div>
            <div style={{ fontWeight: 600, color: '#10B981' }}>
              ₹{amount.toLocaleString()}
            </div>
            {record.is_counter && record.original_amount !== amount && (
              <div style={{ fontSize: '11px', color: textSecondary, textDecoration: 'line-through' }}>
                ₹{record.original_amount.toLocaleString()}
              </div>
            )}
          </div>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'is_counter',
        key: 'is_counter',
        render: (isCounter: boolean) => (
          <Tag color={isCounter ? 'orange' : 'blue'}>
            {isCounter ? 'Counter' : 'Original'}
          </Tag>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'active' ? 'green' : 'default'}>
            {status.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: 'Placed',
        dataIndex: 'placed_at',
        key: 'placed_at',
        render: (timestamp: string) => dayjs(timestamp).fromNow(),
      },
    ];

    return (
      <div style={{ padding: '16px 0' }}>
        <Table
          columns={columns}
          dataSource={bids}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </div>
    );
  };

  const renderTimelineTab = () => (
    <div style={{ padding: '16px 0' }}>
      <Timeline>
        {events.map((event) => (
          <Timeline.Item
            key={event.id}
            color={event.event_type === 'BOOKING_POSTED' ? 'blue' : 'green'}
          >
            <div>
              <div style={{ fontWeight: 600, color: textPrimary }}>
                {event.event_type.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '12px', color: textSecondary }}>
                {event.actor_role} • {dayjs(event.created_at).format('DD MMM YYYY, HH:mm')}
              </div>
              {Object.keys(event.payload).length > 0 && (
                <pre style={{ 
                  fontSize: '11px', 
                  color: textSecondary, 
                  marginTop: '4px',
                  background: isDark ? '#0A0E14' : '#F3F4F6',
                  padding: '8px',
                  borderRadius: '4px',
                }}>
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              )}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );

  return (
    <>
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Booking Details
              </div>
              {booking && (
                <div style={{ fontSize: '13px', color: textSecondary, marginTop: '4px' }}>
                  {booking.pickup_city} → {booking.drop_city}
                </div>
              )}
            </div>
            <Space>
              {booking?.status === 'bidding' && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => setActionModal({ visible: true, type: 'finalize' })}
                  >
                    Force Finalize
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => setActionModal({ visible: true, type: 'cancel' })}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {booking?.status === 'finalized' && (
                <Button
                  icon={<WarningOutlined />}
                  onClick={() => setActionModal({ visible: true, type: 'reopen' })}
                >
                  Reopen Bidding
                </Button>
              )}
            </Space>
          </div>
        }
        width={920}
        open={open}
        onClose={onClose}
        loading={loading}
      >
        {booking && (
          <Tabs
            defaultActiveKey="overview"
            items={[
              {
                key: 'overview',
                label: 'Overview',
                children: renderOverviewTab(),
              },
              {
                key: 'bids',
                label: (
                  <Badge count={bids.length} offset={[10, 0]}>
                    <span>Bids & Negotiation</span>
                  </Badge>
                ),
                children: renderBidsTab(),
              },
              {
                key: 'timeline',
                label: 'Timeline',
                children: renderTimelineTab(),
              },
            ]}
          />
        )}
      </Drawer>

      {/* Action Modal */}
      <Modal
        title={`${actionModal.type?.charAt(0).toUpperCase()}${actionModal.type?.slice(1)} Booking`}
        open={actionModal.visible}
        onOk={() => handleAction(actionModal.type!)}
        onCancel={() => {
          setActionModal({ visible: false, type: null });
          setActionReason('');
        }}
        okText="Confirm"
        okButtonProps={{ danger: actionModal.type === 'cancel' }}
      >
        <TextArea
          rows={4}
          placeholder="Enter reason (minimum 20 characters)..."
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
          style={{ marginTop: '16px' }}
        />
        <div style={{ marginTop: '8px', color: textSecondary, fontSize: '12px' }}>
          {actionReason.length}/20 characters minimum
        </div>
      </Modal>
    </>
  );
};

