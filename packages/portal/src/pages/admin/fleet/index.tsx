/**
 * Fleet Management Dashboard
 * 
 * Main landing page for fleet management showing:
 * - Fleet health KPIs (total, allowed, blocked, pending)
 * - Provider performance metrics
 * - Ticket SLA status
 * - Top RTOs by blocked count
 * - Recent activity feed
 * - Date range selector for analytics
 */

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Space, DatePicker, Select } from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import type { FleetKPIs, ProviderStats, RTOStats } from '@/modules/fleet/types';
import dayjs from 'dayjs';

const FleetDashboard: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [kpis, setKPIs] = useState<FleetKPIs | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from /admin/analytics/dashboard
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockKPIs: FleetKPIs = {
        totalTrucks: 1248,
        allowedTrucks: 1156,
        blockedTrucks: 67,
        pendingVerifications: 25,
        allowedRatio: 92.6,
        providerSuccessRate: 97.8,
        avgVerificationTime: 45, // minutes
        ticketsSLACompliance: 94.5,
      };

      setKPIs(mockKPIs);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!kpis) {
    return (
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
          <div style={{ color: textPrimary }}>Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  // Provider stats mock data
  const providerStats: ProviderStats[] = [
    { provider: 'VAHAN', totalRequests: 856, successCount: 842, failureCount: 14, successRate: 98.4, avgLatency: 1200, lastFailure: null },
    { provider: 'Surepass', totalRequests: 392, successCount: 378, failureCount: 14, successRate: 96.4, avgLatency: 850, lastFailure: '2025-12-04T15:30:00Z' },
  ];

  // Top RTOs by blocked count
  const topRTOs: RTOStats[] = [
    { rto_code: 'DL', total_trucks: 345, blocked_trucks: 23, blocked_ratio: 6.7 },
    { rto_code: 'HR', total_trucks: 189, blocked_trucks: 12, blocked_ratio: 6.3 },
    { rto_code: 'UP', total_trucks: 267, blocked_trucks: 15, blocked_ratio: 5.6 },
    { rto_code: 'PB', total_trucks: 123, blocked_trucks: 6, blocked_ratio: 4.9 },
    { rto_code: 'RJ', total_trucks: 98, blocked_trucks: 4, blocked_ratio: 4.1 },
  ];

  const rtoColumns = [
    {
      title: 'RTO Code',
      dataIndex: 'rto_code',
      key: 'rto_code',
      render: (code: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: textPrimary }}>
          {code}
        </span>
      ),
    },
    {
      title: 'Total Trucks',
      dataIndex: 'total_trucks',
      key: 'total_trucks',
      align: 'right' as const,
      render: (count: number) => (
        <span style={{ color: textPrimary }}>{count}</span>
      ),
    },
    {
      title: 'Blocked',
      dataIndex: 'blocked_trucks',
      key: 'blocked_trucks',
      align: 'right' as const,
      render: (count: number) => (
        <Tag color="red">{count}</Tag>
      ),
    },
    {
      title: 'Blocked %',
      dataIndex: 'blocked_ratio',
      key: 'blocked_ratio',
      align: 'right' as const,
      render: (ratio: number) => (
        <span style={{ 
          color: ratio > 5 ? '#EF4444' : textSecondary,
          fontWeight: ratio > 5 ? 600 : 400,
        }}>
          {ratio.toFixed(1)}%
        </span>
      ),
    },
  ];

  return (
    <AdminLayout theme={theme} toggleTheme={toggleTheme}>
      <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
              Fleet Management
            </h1>
            <div style={{ color: textSecondary, fontSize: '14px', marginTop: '4px' }}>
              Compliance, verification, and operational control
            </div>
          </div>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            presets={[
              { label: 'Last 7 Days', value: [dayjs().subtract(7, 'days'), dayjs()] },
              { label: 'Last 30 Days', value: [dayjs().subtract(30, 'days'), dayjs()] },
              { label: 'Last 90 Days', value: [dayjs().subtract(90, 'days'), dayjs()] },
            ]}
          />
        </div>

        {/* KPI Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title={<span style={{ color: textSecondary }}>Total Fleet</span>}
                value={kpis.totalTrucks}
                prefix={<CarOutlined style={{ color: '#3B82F6' }} />}
                valueStyle={{ color: textPrimary, fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title={<span style={{ color: textSecondary }}>Allowed</span>}
                value={kpis.allowedTrucks}
                prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />}
                suffix={<span style={{ fontSize: '14px', color: textSecondary }}>({kpis.allowedRatio.toFixed(1)}%)</span>}
                valueStyle={{ color: '#10B981', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title={<span style={{ color: textSecondary }}>Blocked</span>}
                value={kpis.blockedTrucks}
                prefix={<StopOutlined style={{ color: '#EF4444' }} />}
                valueStyle={{ color: '#EF4444', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title={<span style={{ color: textSecondary }}>Pending Verification</span>}
                value={kpis.pendingVerifications}
                prefix={<ClockCircleOutlined style={{ color: '#F59E0B' }} />}
                valueStyle={{ color: '#F59E0B', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Provider Performance & Ticket SLA */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={12}>
            <Card 
              title={<span style={{ color: textPrimary }}>Provider Performance</span>}
              style={{ background: bgCard, border: `1px solid ${border}` }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {providerStats.map(provider => (
                  <div key={provider.provider}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: textPrimary, fontWeight: 600 }}>{provider.provider}</span>
                      <span style={{ color: provider.successRate >= 95 ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                        {provider.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      percent={provider.successRate} 
                      strokeColor={provider.successRate >= 95 ? '#10B981' : '#F59E0B'}
                      showInfo={false}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: textSecondary, marginTop: '4px' }}>
                      <span>{provider.successCount}/{provider.totalRequests} successful</span>
                      <span>Avg: {provider.avgLatency}ms</span>
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card 
              title={<span style={{ color: textPrimary }}>Tickets & SLA</span>}
              style={{ background: bgCard, border: `1px solid ${border}` }}
            >
              <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: textSecondary }}>SLA Compliance</span>
                    <span style={{ 
                      color: kpis.ticketsSLACompliance >= 90 ? '#10B981' : '#EF4444',
                      fontWeight: 600,
                    }}>
                      {kpis.ticketsSLACompliance.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    percent={kpis.ticketsSLACompliance} 
                    strokeColor={kpis.ticketsSLACompliance >= 90 ? '#10B981' : '#EF4444'}
                    status={kpis.ticketsSLACompliance >= 90 ? 'success' : 'exception'}
                  />
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title={<span style={{ color: textSecondary, fontSize: '12px' }}>Open Tickets</span>}
                      value={12}
                      prefix={<FileTextOutlined style={{ color: '#3B82F6' }} />}
                      valueStyle={{ color: textPrimary, fontSize: '20px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title={<span style={{ color: textSecondary, fontSize: '12px' }}>SLA Breached</span>}
                      value={2}
                      prefix={<WarningOutlined style={{ color: '#EF4444' }} />}
                      valueStyle={{ color: '#EF4444', fontSize: '20px' }}
                    />
                  </Col>
                </Row>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Top RTOs by Blocked Count */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card 
              title={<span style={{ color: textPrimary }}>Top RTOs by Blocked Trucks</span>}
              style={{ background: bgCard, border: `1px solid ${border}` }}
              extra={
                <Tag color="red" icon={<WarningOutlined />}>
                  High Risk Areas
                </Tag>
              }
            >
              <Table
                columns={rtoColumns}
                dataSource={topRTOs}
                rowKey="rto_code"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default FleetDashboard;

