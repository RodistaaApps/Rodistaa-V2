/**
 * Franchise Portal - Dashboard
 */

import { Layout, Card, Row, Col, Statistic } from 'antd';
import { CarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Content } = Layout;

export default function FranchiseDashboard() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <h1>Franchise Dashboard</h1>
        
        <Row gutter={16} style={{ marginTop: '24px' }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Inspections Due"
                value={0}
                prefix={<CarOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Completed Today"
                value={0}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Pending Reviews"
                value={0}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

