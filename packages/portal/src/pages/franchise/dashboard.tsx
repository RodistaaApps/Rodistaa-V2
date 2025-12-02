/**
 * Franchise Dashboard Page
 * Different views for District vs Unit franchises
 */

import { Card, Row, Col, Statistic, Typography, Table, Button } from 'antd';
import { TeamOutlined, CarOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import { Layout, Menu } from 'antd';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

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
        <Header style={{ backgroundColor: '#C90D0D', color: '#FFFFFF', padding: '0 24px' }}>
          <Title level={3} style={{ color: '#FFFFFF', margin: 0, lineHeight: '64px' }}>
            Rodistaa Franchise Portal
          </Title>
        </Header>

        <Content style={{ padding: 24 }}>
          <Title level={2}>
            {isDistrict ? 'District Franchise Dashboard' : 'Unit Franchise Dashboard'}
          </Title>

          {isDistrict ? (
            <>
              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Linked Units"
                      value={districtStats.linkedUnits}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#C90D0D' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Total Inspections"
                      value={districtStats.totalInspections}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#C90D0D' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Targets Achieved"
                      value={districtStats.targetsAchieved}
                      suffix="%"
                      prefix={<CarOutlined />}
                      valueStyle={{ color: '#4CAF50' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Revenue (₹)"
                      value={districtStats.revenue}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#4CAF50' }}
                      precision={0}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="Unit Franchises" style={{ marginTop: 24 }}>
                <Button type="primary" style={{ marginBottom: 16 }}>
                  Set Monthly Targets
                </Button>
                <Table
                  columns={[
                    { title: 'Unit Name', dataIndex: 'name', key: 'name' },
                    { title: 'Inspections', dataIndex: 'inspections', key: 'inspections' },
                    { title: 'Target Progress', dataIndex: 'progress', key: 'progress', render: (p: number) => `${p}%` },
                    { title: 'Actions', key: 'actions', render: () => <Button size="small">View Details</Button> },
                  ]}
                  dataSource={[
                    { id: 1, name: 'North Unit 1', inspections: 42, progress: 85 },
                    { id: 2, name: 'North Unit 2', inspections: 38, progress: 76 },
                  ]}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </>
          ) : (
            <>
              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Inspections This Month"
                      value={unitStats.inspectionsThisMonth}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#C90D0D' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Target Progress"
                      value={unitStats.targetProgress}
                      suffix="%"
                      prefix={<CarOutlined />}
                      valueStyle={{ color: unitStats.targetProgress >= 80 ? '#4CAF50' : '#FF9800' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Pending Inspections"
                      value={unitStats.pendingInspections}
                      valueStyle={{ color: '#FF9800' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Earnings (₹)"
                      value={unitStats.earnings}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#4CAF50' }}
                      precision={0}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="Inspection Schedule" style={{ marginTop: 24 }}>
                <Button type="primary" style={{ marginBottom: 16 }}>
                  Schedule Inspection
                </Button>
                <Table
                  columns={[
                    { title: 'Truck', dataIndex: 'truck', key: 'truck' },
                    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
                    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag>{s}</Tag> },
                    { title: 'Actions', key: 'actions', render: () => <Button size="small">Perform Inspection</Button> },
                  ]}
                  dataSource={[
                    { id: 1, truck: 'KA 01 AB 1234', dueDate: '2024-01-05', status: 'Scheduled' },
                  ]}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </>
          )}
        </Content>
      </Layout>
    </ProtectedRoute>
  );
}

export default FranchiseDashboard;

