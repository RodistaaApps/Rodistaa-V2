import { Card, Row, Col, Statistic, Progress, Tag, Space, Button } from 'antd';
import { CarOutlined, ClockCircleOutlined, TruckOutlined, TeamOutlined, MessageOutlined, FileTextOutlined } from '@ant-design/icons';
import type { DriverDetail } from '../types';
import dayjs from 'dayjs';

interface OverviewTabProps {
  driver: DriverDetail;
  theme?: 'light' | 'dark';
}

export function OverviewTab({ driver, theme = 'dark' }: OverviewTabProps) {
  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10B981';
    if (score >= 70) return '#3B82F6';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Card style={{ marginBottom: '24px', background: bgCard, border: `1px solid ${border}` }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Progress type="circle" percent={driver.behaviour_score} strokeColor={getScoreColor(driver.behaviour_score)} format={(p) => <div><div style={{ fontSize: '32px', fontWeight: 'bold', color: textPrimary }}>{p}</div><div style={{ fontSize: '12px', color: textSecondary }}>Behaviour Score</div></div>} width={120} />
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col span={12}><div style={{ color: textSecondary, fontSize: '12px' }}>Email</div><div style={{ color: textPrimary, fontWeight: 500 }}>{driver.email || '—'}</div></Col>
              <Col span={12}><div style={{ color: textSecondary, fontSize: '12px' }}>Mobile</div><div style={{ color: textPrimary, fontWeight: 500 }}>{driver.mobile}</div></Col>
              <Col span={12}><div style={{ color: textSecondary, fontSize: '12px' }}>DL Number</div><div style={{ color: textPrimary, fontWeight: 500, fontFamily: 'monospace' }}>{driver.dl_number}</div></Col>
              <Col span={12}><div style={{ color: textSecondary, fontSize: '12px' }}>DL Expiry</div><div style={{ color: textPrimary, fontWeight: 500 }}>{dayjs(driver.dl_expiry).format('DD MMM YYYY')}</div></Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} md={6}><Card style={{ background: bgCard, border: `1px solid ${border}` }}><Statistic title={<span style={{ color: textSecondary }}>Trips (30d)</span>} value={driver.metrics.completed_trips_30d} prefix={<CarOutlined style={{ color: '#10B981' }} />} valueStyle={{ color: textPrimary, fontWeight: 'bold' }} /></Card></Col>
        <Col xs={12} md={6}><Card style={{ background: bgCard, border: `1px solid ${border}` }}><Statistic title={<span style={{ color: textSecondary }}>Avg On-Road (hrs)</span>} value={driver.metrics.avg_onroad_time} prefix={<ClockCircleOutlined style={{ color: '#3B82F6' }} />} valueStyle={{ color: textPrimary, fontWeight: 'bold' }} precision={1} /></Card></Col>
        <Col xs={12} md={6}><Card style={{ background: bgCard, border: `1px solid ${border}` }}><Statistic title={<span style={{ color: textSecondary }}>Driving Hours (30d)</span>} value={driver.metrics.total_driving_hours_30d} suffix="h" valueStyle={{ color: textPrimary, fontWeight: 'bold' }} /></Card></Col>
        <Col xs={12} md={6}><Card style={{ background: bgCard, border: `1px solid ${border}` }}><Statistic title={<span style={{ color: textSecondary }}>Availability</span>} value={driver.availability.replace('_', ' ').toUpperCase()} valueStyle={{ color: driver.availability === 'on_trip' ? '#3B82F6' : driver.availability === 'available' ? '#10B981' : '#6B7280', fontSize: '18px' }} /></Card></Col>
      </Row>

      <Card title={<span style={{ color: textPrimary }}>Quick Actions</span>} style={{ background: bgCard, border: `1px solid ${border}` }}>
        <Space wrap>
          <Button icon={<TeamOutlined />}>Assign to Operator</Button>
          <Button icon={<MessageOutlined />}>Message Driver</Button>
          <Button icon={<FileTextOutlined />}>Export Profile</Button>
        </Space>
      </Card>
    </div>
  );
}

