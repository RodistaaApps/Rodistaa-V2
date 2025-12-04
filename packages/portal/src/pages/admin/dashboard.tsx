/**
 * Admin Dashboard - Theme-aware (no fixed colors)
 */

import { Row, Col } from 'antd';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { 
  BookOutlined, TruckOutlined, CheckCircleOutlined, InboxOutlined,
  ArrowUpOutlined, ArrowDownOutlined, EnvironmentOutlined, DollarOutlined,
  FileTextOutlined, ClockCircleOutlined, PlusOutlined
} from '@ant-design/icons';

interface DashboardPageProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

function DashboardPage({ theme = 'dark', toggleTheme }: DashboardPageProps) {
  const stats = {
    activeBookings: 24,
    ongoingShipments: 58,
    completedToday: 32,
    pendingDispatch: 12,
  };

  const trends = {
    activeBookings: 12.5,
    ongoingShipments: 8.3,
    completedToday: 15.2,
    pendingDispatch: -5.1,
  };

  const isDark = theme === 'dark';

  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const bgElevated = isDark ? '#1E2430' : '#F3F4F6';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const textTertiary = isDark ? '#6B7280' : '#9CA3AF';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const recentActivity = [
    {
      icon: <BookOutlined style={{ color: '#10B981' }} />,
      text: 'New booking received from ABC Corp - Mumbai to Pune',
      time: '2 min ago',
      color: '#10B981',
    },
    {
      icon: <TruckOutlined style={{ color: '#10B981' }} />,
      text: 'Shipment SHP-045 dispatched - Delhi to Jaipur',
      time: '15 min ago',
      color: '#10B981',
    },
    {
      icon: <DollarOutlined style={{ color: '#10B981' }} />,
      text: 'Payment received ₹45,000 from XYZ Logistics',
      time: '32 min ago',
      color: '#10B981',
    },
    {
      icon: <CheckCircleOutlined style={{ color: '#10B981' }} />,
      text: 'Shipment SHP-042 delivered successfully',
      time: '1 hour ago',
      color: '#10B981',
    },
    {
      icon: <TruckOutlined style={{ color: '#F59E0B' }} />,
      text: 'Shipment SHP-041 delayed - expected 2 hours late',
      time: '2 hours ago',
      color: '#F59E0B',
    },
  ];

  const quickActions = [
    { icon: <EnvironmentOutlined />, title: 'Dispatch New Unit', description: 'Create a new dispatch assignment' },
    { icon: <FileTextOutlined />, title: 'Generate Report', description: 'Generate analytics report' },
    { icon: <PlusOutlined />, title: 'Register Asset', description: 'Register new fleet asset' },
  ];

  const alerts = [
    { icon: <ClockCircleOutlined style={{ color: '#C90D0D' }} />, text: 'Unit 451: Low Battery', time: '2 minutes ago' },
  ];

  return (
    <ProtectedRoute allowedRoles={process.env.NODE_ENV === 'development' ? undefined : ['SUPER_ADMIN']}>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <div style={{
                background: bgCard,
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <BookOutlined style={{ fontSize: '32px', color: '#3B82F6', marginRight: '16px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: textSecondary, marginBottom: '4px' }}>Active Bookings</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: textPrimary }}>{stats.activeBookings}</div>
                  </div>
                </div>
                <div style={{ color: '#10B981', fontSize: '14px' }}>
                  <ArrowUpOutlined /> {trends.activeBookings}%
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div style={{
                background: bgCard,
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <TruckOutlined style={{ fontSize: '32px', color: '#F59E0B', marginRight: '16px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: textSecondary, marginBottom: '4px' }}>Ongoing Shipments</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: textPrimary }}>{stats.ongoingShipments}</div>
                  </div>
                </div>
                <div style={{ color: '#10B981', fontSize: '14px' }}>
                  <ArrowUpOutlined /> {trends.ongoingShipments}%
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div style={{
                background: bgCard,
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#10B981', marginRight: '16px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: textSecondary, marginBottom: '4px' }}>Completed Today</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: textPrimary }}>{stats.completedToday}</div>
                  </div>
                </div>
                <div style={{ color: '#10B981', fontSize: '14px' }}>
                  <ArrowUpOutlined /> {trends.completedToday}%
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div style={{
                background: bgCard,
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <InboxOutlined style={{ fontSize: '32px', color: '#C90D0D', marginRight: '16px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: textSecondary, marginBottom: '4px' }}>Pending Dispatch</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: textPrimary }}>{stats.pendingDispatch}</div>
                  </div>
                </div>
                <div style={{ color: '#EF4444', fontSize: '14px' }}>
                  <ArrowDownOutlined /> {Math.abs(trends.pendingDispatch)}%
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col xs={24} lg={12}>
              <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary, marginTop: 0, marginBottom: '20px' }}>
                  Recent Activity
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {recentActivity.map((activity, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: `${activity.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {activity.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: textPrimary, fontSize: '14px', marginBottom: '4px' }}>{activity.text}</div>
                        <div style={{ color: textTertiary, fontSize: '12px' }}>{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary, marginTop: 0, marginBottom: '20px' }}>
                  Quick Actions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {quickActions.map((action, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: bgElevated,
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: '#C90D0D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontSize: '20px',
                      }}>
                        {action.icon}
                      </div>
                      <div>
                        <div style={{ color: textPrimary, fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>{action.title}</div>
                        <div style={{ color: textTertiary, fontSize: '12px' }}>{action.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary, marginTop: 0, marginBottom: '20px' }}>
                  Alerts
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {alerts.map((alert, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      background: '#C90D0D20',
                      borderRadius: '8px',
                      border: '1px solid #C90D0D40',
                    }}>
                      <div style={{ fontSize: '20px', marginTop: '2px' }}>{alert.icon}</div>
                      <div>
                        <div style={{ color: textPrimary, fontSize: '14px', marginBottom: '4px' }}>{alert.text}</div>
                        <div style={{ color: textTertiary, fontSize: '12px' }}>{alert.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col xs={24}>
              <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary, marginTop: 0, marginBottom: '20px' }}>
                  Live Fleet Map
                </h2>
                <div style={{
                  height: '400px',
                  background: bgElevated,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: textTertiary,
                  fontSize: '16px',
                }}>
                  Map integration (OSM/Google Maps) - Shows live truck locations
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default DashboardPage;
