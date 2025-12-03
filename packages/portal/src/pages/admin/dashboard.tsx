/**
 * Admin Dashboard
 * Overview of platform metrics and KPIs
 */

import { Card, Row, Col, Statistic, Typography, Table, Tag, Button } from 'antd';
import { UserOutlined, CarOutlined, FileTextOutlined, DollarOutlined, WarningOutlined } from '@ant-design/icons';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const { Title } = Typography;

function DashboardPage() {
  // Mock data for display
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
    // Use mock data on error (development mode)
    placeholderData: mockStats,
    retry: false,
  });

  // Use actual stats or fallback to mock
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

  const columns = [
    {
      title: 'Alert Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="red">{type}</Tag>,
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
      render: (severity: string) => (
        <Tag color={severity === 'high' ? 'red' : 'orange'}>{severity.toUpperCase()}</Tag>
      ),
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
        <Title level={2}>Dashboard</Title>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Daily Active Users"
                value={displayStats.dau}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#C90D0D' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Bookings"
                value={displayStats.totalBookings}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#C90D0D' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Trucks"
                value={displayStats.activeTrucks}
                prefix={<CarOutlined />}
                valueStyle={{ color: '#C90D0D' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Revenue (₹)"
                value={displayStats.revenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#4CAF50' }}
                precision={0}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="Recent Fraud Alerts" extra={<WarningOutlined style={{ color: '#F44336' }} />}>
              <Table
                columns={columns}
                dataSource={recentAlerts}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Quick Actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Button type="primary" block onClick={() => {}}>
                  View Pending KYC
                </Button>
                <Button block onClick={() => {}}>
                  Review Override Requests
                </Button>
                <Button block onClick={() => {}}>
                  Truck Expiry Report
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default DashboardPage;

