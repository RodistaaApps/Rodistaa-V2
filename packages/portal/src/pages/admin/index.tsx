/**
 * Admin Portal - Dashboard
 */

import { Layout, Card, Row, Col, Statistic } from 'antd';
import { BookOutlined, CarOutlined, CheckCircleOutlined, AlertOutlined } from '@ant-design/icons';

const { Content } = Layout;

export default function AdminDashboard() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <h1>Admin Dashboard</h1>
        
        <Row gutter={16} style={{ marginTop: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Bookings"
                value={0}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Shipments"
                value={0}
                prefix={<CarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Completed Today"
                value={0}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Issues"
                value={0}
                prefix={<AlertOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

