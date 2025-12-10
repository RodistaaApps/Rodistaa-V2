/**
 * Target Setting Page (District Franchise)
 * Set monthly targets for unit franchises
 */

import { Card, Form, InputNumber, Button, Table, message, Typography } from 'antd';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Layout } from 'antd';
import { useState } from 'react';

const { Title } = Typography;
const { Header, Content } = Layout;

function TargetsPage() {
  const [form] = Form.useForm();

  const units = [
    { id: 'FRN-UNIT-001', name: 'North Unit 1', currentTarget: 50, achievement: 42 },
    { id: 'FRN-UNIT-002', name: 'North Unit 2', currentTarget: 45, achievement: 38 },
  ];

  const handleSetTargets = async (values: any) => {
    message.success('Targets updated successfully');
    form.resetFields();
  };

  const columns = [
    { title: 'Unit Name', dataIndex: 'name', key: 'name' },
    { title: 'Current Target', dataIndex: 'currentTarget', key: 'currentTarget' },
    { title: 'Achievement', dataIndex: 'achievement', key: 'achievement' },
    {
      title: 'Progress',
      key: 'progress',
      render: (_: any, record: any) => `${Math.round((record.achievement / record.currentTarget) * 100)}%`,
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['FRANCHISE_DISTRICT']}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ backgroundColor: '#C90D0D', color: '#FFF', padding: '0 24px' }}>
          <Title level={3} style={{ color: '#FFF', margin: 0, lineHeight: '64px' }}>
            Rodistaa Franchise Portal
          </Title>
        </Header>
        <Content style={{ padding: 24 }}>
          <Title level={2}>Set Monthly Targets</Title>

          <Card title="Current Performance" style={{ marginTop: 24 }}>
            <Table columns={columns} dataSource={units} rowKey="id" pagination={false} />
          </Card>

          <Card title="Set New Targets" style={{ marginTop: 16 }}>
            <Form form={form} layout="inline" onFinish={handleSetTargets}>
              <Form.Item label="Unit" name="unitId" rules={[{ required: true }]}>
                <select style={{ padding: 8, width: 200 }}>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </Form.Item>
              <Form.Item label="Target Inspections" name="target" rules={[{ required: true }]}>
                <InputNumber min={1} max={200} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">Set Target</Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>
      </Layout>
    </ProtectedRoute>
  );
}

export default TargetsPage;

