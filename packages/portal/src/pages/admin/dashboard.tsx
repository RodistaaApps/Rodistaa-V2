/**
 * Admin Dashboard - Simple working version
 */

import { Row, Col, Card, Statistic } from 'antd';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
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
  });

  const displayStats = stats || mockStats;

  return (
    <ProtectedRoute allowedRoles={process.env.NODE_ENV === 'development' ? undefined : ['SUPER_ADMIN', 'FRAUD_INVESTIGATOR']}>
      <AdminLayout>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Dashboard</h1>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Daily Active Users"
                value={displayStats.dau}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Bookings"
                value={displayStats.totalBookings}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Trucks"
                value={displayStats.activeTrucks}
                prefix={<CarOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Revenue (₹)"
                value={(displayStats.revenue / 100000).toFixed(2) + 'L'}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Recent Fraud Alerts">
              {displayStats.fraudAlerts > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#fff3f3', borderRadius: '8px' }}>
                  <WarningOutlined style={{ fontSize: '24px', color: '#C90D0D' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{displayStats.fraudAlerts} Active Alerts</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Requires investigation</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: '#666' }}>No active alerts</div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Quick Actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  style={{ padding: '12px 24px', background: '#C90D0D', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
                  onClick={() => window.location.href = '/admin/kyc'}
                >
                  View Pending KYC
                </button>
                <button 
                  style={{ padding: '12px 24px', background: '#f0f0f0', color: '#000', border: '1px solid #d9d9d9', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
                  onClick={() => window.location.href = '/admin/trucks'}
                >
                  Manage Trucks
                </button>
                <button 
                  style={{ padding: '12px 24px', background: '#f0f0f0', color: '#000', border: '1px solid #d9d9d9', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
                  onClick={() => window.location.href = '/admin/bookings'}
                >
                  View Bookings
                </button>
              </div>
            </Card>
          </Col>
        </Row>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default DashboardPage;
