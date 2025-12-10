/**
 * Franchise Dashboard Page - Uses design system components
 */

import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import { Layout } from 'antd';
import { RMetricsCard, RCardWeb, RTableWeb, RButtonWeb } from '@rodistaa/design-system';
import { RodistaaColors, WebTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { TeamOutlined, CarOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';

const { Header, Content } = Layout;

function FranchiseDashboard() {
  const { user } = useAuth();
  const isDistrict = user?.role === 'FRANCHISE_DISTRICT';

  const districtStats = {
    linkedUnits: 12,
    totalInspections: 456,
    targetsAchieved: 89,
    revenue: 1250000,
  };

  const unitStats = {
    inspectionsThisMonth: 42,
    targetProgress: 84,
    pendingInspections: 3,
    earnings: 85000,
  };

  return (
    <ProtectedRoute allowedRoles={['FRANCHISE_DISTRICT', 'FRANCHISE_UNIT']}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ backgroundColor: RodistaaColors.primary.main, color: RodistaaColors.primary.contrast, padding: '0 24px' }}>
          <h1 style={{ ...WebTextStyles.h1, color: RodistaaColors.primary.contrast, margin: 0, lineHeight: '64px' }}>
            Rodistaa Franchise Portal
          </h1>
        </Header>

        <Content style={{ padding: RodistaaSpacing.xl }}>
          <h1 style={{ ...WebTextStyles.h1, marginBottom: RodistaaSpacing.xl }}>
            {isDistrict ? 'District Franchise Dashboard' : 'Unit Franchise Dashboard'}
          </h1>

          {isDistrict ? (
            <>
              <Row gutter={[RodistaaSpacing.lg, RodistaaSpacing.lg]} style={{ marginTop: RodistaaSpacing.xl }}>
                <Col xs={24} sm={12} lg={6}>
                  <RMetricsCard
                    title="Linked Units"
                    value={districtStats.linkedUnits.toString()}
                    icon={<TeamOutlined />}
                    trend="neutral"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <RMetricsCard
                    title="Total Inspections"
                    value={districtStats.totalInspections.toString()}
                    icon={<CheckCircleOutlined />}
                    trend="up"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <RMetricsCard
                    title="Targets Achieved"
                    value={`${districtStats.targetsAchieved}%`}
                    icon={<CarOutlined />}
                    trend="up"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <RMetricsCard
                    title="Revenue (₹)"
                    value={districtStats.revenue.toLocaleString('en-IN')}
                    icon={<DollarOutlined />}
                    trend="up"
                  />
                </Col>
              </Row>

              <RCardWeb title="Unit Franchises" style={{ marginTop: RodistaaSpacing.xl }}>
                <RButtonWeb variant="primary" onClick={() => {}} style={{ marginBottom: RodistaaSpacing.md }}>
                  Set Monthly Targets
                </RButtonWeb>
                <RTableWeb
                  columns={[
                    { title: 'Unit Name', dataIndex: 'name', key: 'name' },
                    { title: 'Inspections', dataIndex: 'inspections', key: 'inspections' },
                    { title: 'Target Progress', dataIndex: 'progress', key: 'progress', render: (p: number) => `${p}%` },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: () => (
                        <RButtonWeb variant="secondary" size="small">
                          View Details
                        </RButtonWeb>
                      ),
                    },
                  ]}
                  data={[
                    { id: 1, name: 'North Unit 1', inspections: 42, progress: 85 },
                    { id: 2, name: 'North Unit 2', inspections: 38, progress: 76 },
                  ]}
                  pagination={false}
                />
              </RCardWeb>
            </>
          ) : (
            <>
              <Row gutter={[RodistaaSpacing.lg, RodistaaSpacing.lg]} style={{ marginTop: RodistaaSpacing.xl }}>
                <Col xs={24} sm={12} lg={6}>
                  <RMetricsCard
                    title="Inspections This Month"
                    value={unitStats.inspectionsThisMonth.toString()}
                    icon={<CheckCircleOutlined />}
                    trend="up"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <RMetricsCard
                    title="Target Progress"
                    value={`${unitStats.targetProgress}%`}
                    icon={<CarOutlined />}
                    trend={unitStats.targetProgress >= 80 ? 'up' : 'down'}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <RMetricsCard
                    title="Pending Inspections"
                    value={unitStats.pendingInspections.toString()}
                    icon={<CheckCircleOutlined />}
                    trend="neutral"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <RMetricsCard
                    title="Earnings (₹)"
                    value={unitStats.earnings.toLocaleString('en-IN')}
                    icon={<DollarOutlined />}
                    trend="up"
                  />
                </Col>
              </Row>

              <RCardWeb title="Inspection Schedule" style={{ marginTop: RodistaaSpacing.xl }}>
                <RButtonWeb variant="primary" onClick={() => {}} style={{ marginBottom: RodistaaSpacing.md }}>
                  Schedule Inspection
                </RButtonWeb>
                <RTableWeb
                  columns={[
                    { title: 'Truck', dataIndex: 'truck', key: 'truck' },
                    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
                    { title: 'Status', dataIndex: 'status', key: 'status' },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: () => (
                        <RButtonWeb variant="primary" size="small">
                          Perform Inspection
                        </RButtonWeb>
                      ),
                    },
                  ]}
                  data={[{ id: 1, truck: 'KA 01 AB 1234', dueDate: '2024-01-05', status: 'Scheduled' }]}
                  pagination={false}
                />
              </RCardWeb>
            </>
          )}
        </Content>
      </Layout>
    </ProtectedRoute>
  );
}

export default FranchiseDashboard;
