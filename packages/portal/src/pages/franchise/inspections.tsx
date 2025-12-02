/**
 * Inspection Management Page (Unit Franchise)
 * Perform and track truck inspections
 */

import { Card, Button, Table, Upload, message, Modal, Form, Input, Typography } from 'antd';
import { CameraOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Layout } from 'antd';

const { Title } = Typography;
const { Header, Content } = Layout;
const { TextArea } = Input;

function InspectionsPage() {
  const [inspectionModal, setInspectionModal] = useState(false);
  const [form] = Form.useForm();

  const pendingInspections = [
    { id: 1, truck: 'KA 01 AB 1234', dueDate: '2024-01-05', operator: 'ABC Transport' },
    { id: 2, truck: 'KA 02 EF 5678', dueDate: '2024-01-07', operator: 'XYZ Logistics' },
  ];

  const handlePerformInspection = async (values: any) => {
    message.success('Inspection recorded successfully');
    setInspectionModal(false);
    form.resetFields();
  };

  const columns = [
    { title: 'Truck', dataIndex: 'truck', key: 'truck' },
    { title: 'Operator', dataIndex: 'operator', key: 'operator' },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button
          type="primary"
          size="small"
          icon={<CameraOutlined />}
          onClick={() => setInspectionModal(true)}
        >
          Perform Inspection
        </Button>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['FRANCHISE_UNIT']}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ backgroundColor: '#C90D0D', color: '#FFF', padding: '0 24px' }}>
          <Title level={3} style={{ color: '#FFF', margin: 0, lineHeight: '64px' }}>
            Rodistaa Franchise Portal
          </Title>
        </Header>
        <Content style={{ padding: 24 }}>
          <Title level={2}>Inspection Management</Title>

          <Card title="Pending Inspections" style={{ marginTop: 24 }}>
            <Table columns={columns} dataSource={pendingInspections} rowKey="id" pagination={false} />
          </Card>

          <Modal
            title="Perform Inspection"
            open={inspectionModal}
            onCancel={() => setInspectionModal(false)}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handlePerformInspection}>
              <Form.Item label="Inspection Photos" name="photos">
                <Upload listType="picture-card" accept="image/*" maxCount={5}>
                  <div>
                    <CameraOutlined style={{ fontSize: 24 }} />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item label="Notes" name="notes">
                <TextArea rows={4} placeholder="Any observations or issues..." />
              </Form.Item>

              <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                <select style={{ padding: 8, width: '100%' }}>
                  <option value="passed">Passed</option>
                  <option value="minor_issues">Minor Issues</option>
                  <option value="failed">Failed</option>
                </select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block icon={<CheckCircleOutlined />}>
                  Submit Inspection
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </ProtectedRoute>
  );
}

export default InspectionsPage;

