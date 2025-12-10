/**
 * Shipment Detail Panel
 * 
 * Comprehensive shipment details with tabs:
 * - Timeline & Live Events: Interactive chronological feed
 * - Live Tracking Map: GPS breadcrumb + last location
 * - POD & Documents: Photo/PDF viewer
 * - Payments & Ledger: Settlement status
 * - Dispute/Exception Handling: Investigation workspace
 * - Admin Actions: Force close, reassign, mark settled
 */

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Tabs,
  Descriptions,
  Tag,
  Button,
  Timeline,
  Space,
  Modal,
  Input,
  message,
  Card,
  Statistic,
  Progress,
  Image,
  List,
  Upload,
} from 'antd';
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  TruckOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;

interface ShipmentDetailPanelProps {
  shipmentId: string | null;
  open: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

interface Shipment {
  id: string;
  booking_id: string;
  operator_id: string;
  operator_name: string;
  truck_id: string;
  truck_reg: string;
  driver_id: string;
  driver_name: string;
  driver_mobile: string;
  pickup_address: string;
  pickup_city: string;
  drop_address: string;
  drop_city: string;
  distance_km: number;
  start_at: string;
  estimated_arrival: string;
  actual_arrival: string | null;
  delivered_at: string | null;
  status: string;
  pod_uploaded: boolean;
  pod_photos: string[];
  pod_pdf_url: string | null;
  otp_verified: boolean;
  freight_amount: number;
  advance_paid: number;
  balance_amount: number;
  payment_state: string;
  settlement_reference: string | null;
  has_dispute: boolean;
  last_known_lat: number;
  last_known_lng: number;
  last_ping_at: string;
  total_distance_traveled: number;
  created_at: string;
}

interface Event {
  id: number;
  event_type: string;
  actor_id: string;
  actor_role: string;
  payload: any;
  geo_lat?: number;
  geo_lng?: number;
  created_at: string;
}

interface GPSPoint {
  lat: number;
  lng: number;
  speed: number;
  timestamp: string;
}

export const ShipmentDetailPanel: React.FC<ShipmentDetailPanelProps> = ({
  shipmentId,
  open,
  onClose,
  theme = 'light',
}) => {
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    type: 'close' | 'settle' | 'dispute' | null;
  }>({ visible: false, type: null });
  const [actionData, setActionData] = useState({ reason: '', amount: 0, reference: '' });

  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  useEffect(() => {
    if (shipmentId && open) {
      fetchShipmentDetails();
    }
  }, [shipmentId, open]);

  const fetchShipmentDetails = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockShipment: Shipment = {
        id: shipmentId!,
        booking_id: 'BKG-002',
        operator_id: 'OP-001',
        operator_name: 'ABC Transport',
        truck_id: 'DL01AB1234',
        truck_reg: 'DL 01 AB 1234',
        driver_id: 'DR-001',
        driver_name: 'Ramesh Kumar',
        driver_mobile: '+919876543210',
        pickup_address: 'Industrial Area, Delhi',
        pickup_city: 'Delhi',
        drop_address: 'Tech Park, Bangalore',
        drop_city: 'Bangalore',
        distance_km: 2150,
        start_at: '2025-12-04T19:00:00Z',
        estimated_arrival: '2025-12-06T10:00:00Z',
        actual_arrival: null,
        delivered_at: null,
        status: 'in_transit',
        pod_uploaded: false,
        pod_photos: [],
        pod_pdf_url: null,
        otp_verified: false,
        freight_amount: 87500,
        advance_paid: 40000,
        balance_amount: 47500,
        payment_state: 'advance_paid',
        settlement_reference: null,
        has_dispute: false,
        last_known_lat: 15.3173,
        last_known_lng: 75.7139,
        last_ping_at: '2025-12-05T14:30:00Z',
        total_distance_traveled: 890,
        created_at: '2025-12-04T19:00:00Z',
      };

      const mockEvents: Event[] = [
        {
          id: 1,
          event_type: 'BOOKING_CONVERTED',
          actor_id: 'SYSTEM',
          actor_role: 'system',
          payload: { booking_id: 'BKG-002', bid_amount: 87500 },
          created_at: '2025-12-04T18:45:00Z',
        },
        {
          id: 2,
          event_type: 'DRIVER_STARTED_TRIP',
          actor_id: 'DR-001',
          actor_role: 'driver',
          payload: {},
          geo_lat: 28.7041,
          geo_lng: 77.1025,
          created_at: '2025-12-04T19:00:00Z',
        },
        {
          id: 3,
          event_type: 'GPS_PING',
          actor_id: 'SYSTEM',
          actor_role: 'system',
          payload: { speed: 65, battery: 85 },
          geo_lat: 27.1767,
          geo_lng: 78.0081,
          created_at: '2025-12-05T02:30:00Z',
        },
      ];

      const mockGPS: GPSPoint[] = [
        { lat: 28.7041, lng: 77.1025, speed: 60, timestamp: '2025-12-04T19:00:00Z' },
        { lat: 27.1767, lng: 78.0081, speed: 65, timestamp: '2025-12-05T02:30:00Z' },
        { lat: 25.5941, lng: 77.7323, speed: 70, timestamp: '2025-12-05T08:00:00Z' },
      ];

      setShipment(mockShipment);
      setEvents(mockEvents);
      setGpsPoints(mockGPS);
    } catch (error) {
      console.error('Failed to fetch shipment:', error);
      message.error('Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: 'close' | 'settle' | 'dispute') => {
    if (!actionData.reason || actionData.reason.length < 20) {
      message.error('Reason must be at least 20 characters');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(`Shipment ${type} action completed`);
      setActionModal({ visible: false, type: null });
      setActionData({ reason: '', amount: 0, reference: '' });
      fetchShipmentDetails();
      onClose();
    } catch (error) {
      message.error(`Failed to ${type} shipment`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: 'blue',
      started: 'cyan',
      in_transit: 'orange',
      delivered: 'green',
      delayed: 'red',
      exception: 'red',
      closed: 'default',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const calculateProgress = () => {
    if (!shipment) return 0;
    const progress = (shipment.total_distance_traveled / shipment.distance_km) * 100;
    return Math.min(Math.round(progress), 100);
  };

  const renderTimelineTab = () => (
    <div style={{ padding: '16px 0' }}>
      {/* Progress */}
      <Card size="small" style={{ marginBottom: '24px', background: bgCard, border: `1px solid ${border}` }}>
        <div style={{ marginBottom: '8px', fontWeight: 600, color: textPrimary }}>
          Trip Progress
        </div>
        <Progress
          percent={calculateProgress()}
          status="active"
          strokeColor="#10B981"
          format={(percent) => `${percent}% • ${shipment?.total_distance_traveled} / ${shipment?.distance_km} km`}
        />
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <div>
            <div style={{ color: textSecondary }}>Started</div>
            <div style={{ color: textPrimary, fontWeight: 600 }}>
              {dayjs(shipment?.start_at).format('DD MMM, HH:mm')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: textSecondary }}>ETA</div>
            <div style={{ color: textPrimary, fontWeight: 600 }}>
              {dayjs(shipment?.estimated_arrival).format('DD MMM, HH:mm')}
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Timeline>
        {events.map((event) => (
          <Timeline.Item
            key={event.id}
            color={event.event_type.includes('GPS') ? 'gray' : 'blue'}
          >
            <div>
              <div style={{ fontWeight: 600, color: textPrimary }}>
                {event.event_type.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '12px', color: textSecondary }}>
                {event.actor_role} • {dayjs(event.created_at).format('DD MMM YYYY, HH:mm')}
              </div>
              {event.geo_lat && event.geo_lng && (
                <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
                  <EnvironmentOutlined /> {event.geo_lat.toFixed(4)}, {event.geo_lng.toFixed(4)}
                </div>
              )}
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

  const renderTrackingTab = () => (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card size="small">
          <Statistic
            title="Last Known Location"
            value={shipment?.last_known_lat.toFixed(4) + ', ' + shipment?.last_known_lng.toFixed(4)}
            valueStyle={{ fontSize: '14px', fontFamily: 'monospace' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Last Ping"
            value={dayjs(shipment?.last_ping_at).fromNow()}
            valueStyle={{ fontSize: '14px' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Distance Traveled"
            value={shipment?.total_distance_traveled}
            suffix="km"
            valueStyle={{ fontSize: '14px' }}
          />
        </Card>
      </div>

      <Card size="small" title="GPS Tracking History">
        <List
          dataSource={gpsPoints}
          renderItem={(point) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <EnvironmentOutlined style={{ marginRight: '8px', color: '#10B981' }} />
                    <span style={{ fontFamily: 'monospace' }}>
                      {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                    </span>
                  </div>
                  <div style={{ color: textSecondary }}>
                    {point.speed} km/h • {dayjs(point.timestamp).format('DD MMM, HH:mm')}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  const renderPODTab = () => (
    <div style={{ padding: '16px 0' }}>
      {shipment?.pod_uploaded ? (
        <>
          {shipment.pod_photos.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: textPrimary }}>POD Photos</h4>
              <Image.PreviewGroup>
                <Space wrap>
                  {shipment.pod_photos.map((url, idx) => (
                    <Image
                      key={idx}
                      width={150}
                      height={150}
                      src={url}
                      alt={`POD Photo ${idx + 1}`}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </div>
          )}
          {shipment.pod_pdf_url && (
            <Card size="small" title="Consolidated POD Document">
              <Button type="primary" icon={<FileTextOutlined />} href={shipment.pod_pdf_url} target="_blank">
                Download PDF
              </Button>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0', color: textSecondary }}>
            <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
            <div>POD not uploaded yet</div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderPaymentsTab = () => (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card size="small">
          <Statistic
            title="Freight Amount"
            value={shipment?.freight_amount}
            prefix="₹"
            valueStyle={{ color: '#3B82F6' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Advance Paid"
            value={shipment?.advance_paid}
            prefix="₹"
            valueStyle={{ color: '#10B981' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Balance"
            value={shipment?.balance_amount}
            prefix="₹"
            valueStyle={{ color: '#F59E0B' }}
          />
        </Card>
      </div>

      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Payment State">
          <Tag color={shipment?.payment_state === 'settled' ? 'green' : 'orange'}>
            {shipment?.payment_state.replace('_', ' ').toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Settlement Reference">
          {shipment?.settlement_reference || <span style={{ color: textSecondary }}>—</span>}
        </Descriptions.Item>
      </Descriptions>

      {shipment?.payment_state !== 'settled' && (
        <div style={{ marginTop: '16px' }}>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => setActionModal({ visible: true, type: 'settle' })}
          >
            Mark Payment Settled
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Shipment Details
              </div>
              {shipment && (
                <div style={{ fontSize: '13px', color: textSecondary, marginTop: '4px' }}>
                  {shipment.pickup_city} → {shipment.drop_city}
                </div>
              )}
            </div>
            <Space>
              <Tag color={getStatusColor(shipment?.status || '')}>
                {shipment?.status.replace('_', ' ').toUpperCase()}
              </Tag>
              {shipment?.status === 'in_transit' && (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => setActionModal({ visible: true, type: 'close' })}
                >
                  Force Close
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
        {shipment && (
          <Tabs
            defaultActiveKey="timeline"
            items={[
              {
                key: 'timeline',
                label: 'Timeline & Events',
                children: renderTimelineTab(),
              },
              {
                key: 'tracking',
                label: 'Live Tracking',
                children: renderTrackingTab(),
              },
              {
                key: 'pod',
                label: 'POD & Documents',
                children: renderPODTab(),
              },
              {
                key: 'payments',
                label: 'Payments',
                children: renderPaymentsTab(),
              },
            ]}
          />
        )}
      </Drawer>

      {/* Action Modal */}
      <Modal
        title={`${actionModal.type?.charAt(0).toUpperCase()}${actionModal.type?.slice(1)} Shipment`}
        open={actionModal.visible}
        onOk={() => handleAction(actionModal.type!)}
        onCancel={() => {
          setActionModal({ visible: false, type: null });
          setActionData({ reason: '', amount: 0, reference: '' });
        }}
        okText="Confirm"
        okButtonProps={{ danger: actionModal.type === 'close' }}
      >
        <div style={{ marginTop: '16px' }}>
          <TextArea
            rows={4}
            placeholder="Enter reason (minimum 20 characters)..."
            value={actionData.reason}
            onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
          />
          <div style={{ marginTop: '8px', color: textSecondary, fontSize: '12px' }}>
            {actionData.reason.length}/20 characters minimum
          </div>
        </div>
      </Modal>
    </>
  );
};

