import { Card, Button, Space, Tag, Row, Col, Statistic } from 'antd';
import { EnvironmentOutlined, SendOutlined, CameraOutlined } from '@ant-design/icons';
import type { DriverDetail } from '../types';
import dayjs from 'dayjs';

interface LiveTrackingTabProps {
  driver: DriverDetail;
  theme?: 'light' | 'dark';
}

export function LiveTrackingTab({ driver, theme = 'dark' }: LiveTrackingTabProps) {
  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const bgElevated = isDark ? '#1E2430' : '#F3F4F6';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  if (!driver.active_trip) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚛</div>
        <div style={{ fontSize: '16px', color: textPrimary, marginBottom: '8px' }}>No Active Trip</div>
        <div style={{ fontSize: '14px', color: textSecondary }}>Driver is currently {driver.availability}</div>
      </div>
    );
  }

  const trip = driver.active_trip;

  return (
    <div style={{ padding: '24px 0' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <div style={{ fontWeight: 600, color: textPrimary, marginBottom: '12px', fontSize: '16px' }}>Trip Details</div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div><span style={{ color: textSecondary }}>Trip ID:</span> <span style={{ fontFamily: 'monospace', color: textPrimary }}>{trip.id}</span></div>
              <div><span style={{ color: textSecondary }}>Booking:</span> <span style={{ fontFamily: 'monospace', color: textPrimary }}>{trip.booking_id}</span></div>
              <div><span style={{ color: textSecondary }}>Route:</span> <span style={{ color: textPrimary }}>{trip.route.from} → {trip.route.to}</span></div>
              <div><span style={{ color: textSecondary }}>Operator:</span> <span style={{ color: textPrimary }}>{trip.operator_name}</span></div>
              <div><span style={{ color: textSecondary }}>Truck:</span> <span style={{ fontFamily: 'monospace', color: textPrimary }}>{trip.truck_reg}</span></div>
              <div><span style={{ color: textSecondary }}>Status:</span> <Tag color="blue">{trip.status.replace('_', ' ').toUpperCase()}</Tag></div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Row gutter={[16, 16]}>
              <Col span={12}><Statistic title={<span style={{ color: textSecondary }}>Current Speed</span>} value={trip.current_speed || 0} suffix="km/h" valueStyle={{ color: textPrimary }} /></Col>
              <Col span={12}><Statistic title={<span style={{ color: textSecondary }}>ETA</span>} value={trip.eta ? dayjs(trip.eta).format('HH:mm') : '—'} valueStyle={{ color: textPrimary }} /></Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title={<span style={{ color: textPrimary }}>Live Map</span>} style={{ marginBottom: '24px', background: bgCard, border: `1px solid ${border}` }}>
        <div style={{ height: '400px', background: bgElevated, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textSecondary }}>
          <div style={{ textAlign: 'center' }}>
            <EnvironmentOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>Live Map Integration (OSM/Google Maps)</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>Current: {trip.current_location.lat.toFixed(4)}, {trip.current_location.lng.toFixed(4)}</div>
          </div>
        </div>
      </Card>

      <Card title={<span style={{ color: textPrimary }}>Live Controls</span>} style={{ background: bgCard, border: `1px solid ${border}` }}>
        <Space>
          <Button icon={<EnvironmentOutlined />}>Request Ping</Button>
          <Button icon={<SendOutlined />}>Send Message</Button>
          <Button icon={<CameraOutlined />}>Request Photo</Button>
        </Space>
      </Card>
    </div>
  );
}

