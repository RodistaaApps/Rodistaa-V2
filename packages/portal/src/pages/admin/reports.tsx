/**
 * Reports Page
 * Generate and export reports
 */

import { Card, Button, Select, DatePicker, Space, Table, Typography } from 'antd';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';

const { Title } = Typography;
const { RangePicker } = DatePicker;

function ReportsPage() {
  const handleExport = (format: string) => {
    // Export logic here
    console.log(`Exporting as ${format}`);
  };

  const reportData = [
    { id: 1, metric: 'Total Bookings', value: 3542 },
    { id: 2, metric: 'Completed Shipments', value: 2876 },
    { id: 3, metric: 'Active Trucks', value: 856 },
    { id: 4, metric: 'Revenue', value: '₹2,450,000' },
  ];

  const columns = [
    { title: 'Metric', dataIndex: 'metric', key: 'metric' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ACCOUNTS']}>
      <AdminLayout>
        <Title level={2}>Reports</Title>

        <Card style={{ marginTop: 24 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space wrap>
              <Select
                placeholder="Select Report Type"
                style={{ width: 200 }}
                options={[
                  { value: 'inspections', label: 'Truck Inspections' },
                  { value: 'billing', label: 'Billing & Ledger' },
                  { value: 'shipments', label: 'Shipment KPIs' },
                  { value: 'fraud', label: 'Fraud Incidents' },
                ]}
              />
              <RangePicker />
              <Button type="primary" icon={<FileExcelOutlined />}>
                Generate Report
              </Button>
            </Space>

            <Table
              columns={columns}
              dataSource={reportData}
              rowKey="id"
              pagination={false}
              size="small"
              title={() => <strong>Summary Report</strong>}
            />

            <Space>
              <Button icon={<DownloadOutlined />} onClick={() => handleExport('csv')}>
                Export CSV
              </Button>
              <Button icon={<DownloadOutlined />} onClick={() => handleExport('pdf')}>
                Export PDF
              </Button>
            </Space>
          </Space>
        </Card>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default ReportsPage;

