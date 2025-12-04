/**
 * Overview Tab - Operator Detail
 * Shows key metrics, trust score, and quick summary
 */

import { Card, Row, Col, Statistic, Progress, Tag, Space, Button } from 'antd';
import { CarOutlined, DollarOutlined, TruckOutlined, ClockCircleOutlined, WalletOutlined, MobileOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import type { OperatorDetail } from '../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface OverviewTabProps {
  operator: OperatorDetail;
  theme?: 'light' | 'dark';
}

export function OverviewTab({ operator, theme = 'dark' }: OverviewTabProps) {
  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const bgElevated = isDark ? '#1E2430' : '#F3F4F6';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 75) return '#3B82F6';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Card style={{ marginBottom: '24px', background: bgCard, border: `1px solid ${border}` }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={operator.trust_score}
                strokeColor={getTrustScoreColor(operator.trust_score)}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: textPrimary }}>{percent}</div>
                    <div style={{ fontSize: '12px', color: textSecondary }}>Trust Score</div>
                  </div>
                )}
                width={120}
              />
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ color: textSecondary, fontSize: '12px', marginBottom: '4px' }}>Email</div>
                <div style={{ color: textPrimary, fontWeight: 500 }}>{operator.email || '—'}</div>
              </Col>
              <Col span={12}>
                <div style={{ color: textSecondary, fontSize: '12px', marginBottom: '4px' }}>Mobile</div>
                <div style={{ color: textPrimary, fontWeight: 500 }}>
                  <MobileOutlined style={{ marginRight: '8px' }} />{operator.mobile}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ color: textSecondary, fontSize: '12px', marginBottom: '4px' }}>Location</div>
                <div style={{ color: textPrimary, fontWeight: 500 }}>
                  <EnvironmentOutlined style={{ marginRight: '8px' }} />{operator.city}, {operator.state}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ color: textSecondary, fontSize: '12px', marginBottom: '4px' }}>Franchise</div>
                <div><Tag color="blue">{operator.franchise}</Tag></div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={12} md={6}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={<span style={{ color: textSecondary }}>Total Trucks</span>}
              value={operator.trucks.total}
              prefix={<CarOutlined style={{ color: '#3B82F6' }} />}
              valueStyle={{ color: textPrimary, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={<span style={{ color: textSecondary }}>Active Bids</span>}
              value={operator.active_bids}
              prefix={<DollarOutlined style={{ color: '#F59E0B' }} />}
              valueStyle={{ color: textPrimary, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={<span style={{ color: textSecondary }}>Completed (30d)</span>}
              value={operator.metrics.completed_shipments}
              prefix={<TruckOutlined style={{ color: '#10B981' }} />}
              valueStyle={{ color: textPrimary, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={<span style={{ color: textSecondary }}>Ledger Balance</span>}
              value={operator.ledger.balance}
              prefix="₹"
              valueStyle={{ color: operator.ledger.balance < 0 ? '#EF4444' : '#10B981', fontWeight: 'bold' }}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Card title={<span style={{ color: textPrimary }}>Quick Actions</span>} style={{ background: bgCard, border: `1px solid ${border}` }}>
        <Space wrap>
          <Button icon={<TeamOutlined />}>Assign Franchise</Button>
          <Button icon={<MobileOutlined />}>Message Operator</Button>
          <Button icon={<FileTextOutlined />}>Export Profile</Button>
        </Space>
      </Card>
    </div>
  );
}

