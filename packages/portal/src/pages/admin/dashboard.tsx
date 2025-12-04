/**
 * Admin Dashboard - Uses design system components
 * Overview of platform metrics and KPIs
 */

import { Row, Col } from 'antd';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { RMetricsCard, RCardWeb, RTableWeb, RButtonWeb } from '@rodistaa/design-system';
import { RodistaaColors, WebTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { UserOutlined, CarOutlined, FileTextOutlined, DollarOutlined, WarningOutlined } from '@ant-design/icons';

function DashboardPage() {
  const mockStats = {
    dau: 1247,
    totalBookings: 3542,
    activeTrucks: 856,
    revenue: 2450000,
    fraudAlerts: 23,
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await apiClient.getDashboardStats();
      return response.data;
    },
    placeholderData: mockStats,
    retry: false,
  });

  const displayStats = stats || mockStats;

  const recentAlerts = [
    {
      id: 1,
      type: 'GPS_JUMP',
      severity: 'high',
      shipment: 'SH-001',
      time: '10 mins ago',
    },
    {
      id: 2,
      type: 'POD_DUPLICATE',
      severity: 'medium',
      shipment: 'SH-045',
      time: '1 hour ago',
    },
  ];

  const alertColumns = [
    {
      title: 'Alert Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Shipment',
      dataIndex: 'shipment',
      key: 'shipment',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={process.env.NODE_ENV === 'development' ? undefined : ['SUPER_ADMIN', 'FRAUD_INVESTIGATOR']}>
      <AdminLayout>
        <h1 style={{ ...WebTextStyles.h1, marginBottom: RodistaaSpacing.xl }}>Dashboard</h1>

        <Row gutter={[RodistaaSpacing.lg, RodistaaSpacing.lg]} style={{ marginTop: RodistaaSpacing.xl }}>
          <Col xs={24} sm={12} lg={6}>
            <RMetricsCard
              title="Daily Active Users"
              value={displayStats.dau.toString()}
              icon={<UserOutlined />}
              trend="up"
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <RMetricsCard
              title="Total Bookings"
              value={displayStats.totalBookings.toString()}
              icon={<FileTextOutlined />}
              trend="up"
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <RMetricsCard
              title="Active Trucks"
              value={displayStats.activeTrucks.toString()}
              icon={<CarOutlined />}
              trend="neutral"
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <RMetricsCard
              title="Revenue (₹)"
              value={displayStats.revenue.toLocaleString('en-IN')}
              icon={<DollarOutlined />}
              trend="up"
            />
          </Col>
        </Row>

        <Row gutter={[RodistaaSpacing.lg, RodistaaSpacing.lg]} style={{ marginTop: RodistaaSpacing.xl }}>
          <Col xs={24} lg={12}>
            <RCardWeb title="Recent Fraud Alerts" style={{ height: '100%' }}>
              <RTableWeb
                columns={alertColumns}
                data={recentAlerts.map((alert) => ({
                  ...alert,
                  type: alert.type,
                  shipment: alert.shipment,
                  severity: alert.severity.toUpperCase(),
                  time: alert.time,
                }))}
                pagination={false}
              />
            </RCardWeb>
          </Col>

          <Col xs={24} lg={12}>
            <RCardWeb title="Quick Actions" style={{ height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.md}px` }}>
                <RButtonWeb variant="primary" onClick={() => window.location.href = '/admin/kyc'}>
                  View Pending KYC
                </RButtonWeb>
                <RButtonWeb variant="secondary" onClick={() => window.location.href = '/admin/overrides'}>
                  Review Override Requests
                </RButtonWeb>
                <RButtonWeb variant="secondary" onClick={() => window.location.href = '/admin/trucks'}>
                  Truck Expiry Report
                </RButtonWeb>
              </div>
            </RCardWeb>
          </Col>
        </Row>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default DashboardPage;
