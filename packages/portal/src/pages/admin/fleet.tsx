/**
 * Fleet Management - Theme-aware version
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Space, Modal, Select, Statistic, Row, Col } from 'antd';
import { EyeOutlined, CarOutlined, CheckCircleOutlined, StopOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons';

interface FleetPageProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

function FleetManagementPage({ theme = 'dark', toggleTheme }: FleetPageProps) {
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';

  const mockTrucks = [
    { id: 'TRK-001', registrationNumber: 'KA 01 AB 1234', vehicleType: 'Container 20ft', operatorName: 'Rajesh Transport', status: 'ACTIVE', totalTrips: 234, docsExpiring: 0 },
    { id: 'TRK-002', registrationNumber: 'AP 09 CD 5678', vehicleType: 'Flatbed 32ft', operatorName: 'Suresh Logistics', status: 'ACTIVE', totalTrips: 67, docsExpiring: 2 },
    { id: 'TRK-003', registrationNumber: 'TN 12 EF 9012', vehicleType: 'Tanker 5000L', operatorName: 'Krishna Logistics', status: 'BLOCKED', totalTrips: 189, docsExpiring: 3 },
  ];

  const columns = [
    { title: 'Registration', dataIndex: 'registrationNumber', key: 'registrationNumber', render: (t: string) => <span style={{ fontWeight: 600, color: textPrimary }}>{t}</span> },
    { title: 'Type', dataIndex: 'vehicleType', key: 'vehicleType', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Operator', dataIndex: 'operatorName', key: 'operatorName', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{s}</Tag> },
    {
      title: 'Docs',
      dataIndex: 'docsExpiring',
      key: 'docsExpiring',
      render: (d: number) => d > 0 ? <span style={{ color: '#C90D0D' }}><WarningOutlined /> {d} expiring</span> : <span style={{ color: textPrimary }}>OK</span>,
    },
    { title: 'Trips', dataIndex: 'totalTrips', key: 'totalTrips', render: (t: number) => <span style={{ color: textPrimary }}>{t}</span> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedTruck(record); setModalVisible(true); }}>View</Button>
          {record.status === 'BLOCKED' ? (
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>Unblock</Button>
          ) : (
            <Button danger size="small" icon={<StopOutlined />}>Block</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>Fleet Management</h1>
            <Button type="primary" icon={<DownloadOutlined />} style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>Export Fleet Data</Button>
          </div>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={8} sm={6} lg={4}><Card><Statistic title="Total Trucks" value={856} prefix={<CarOutlined />} /></Card></Col>
            <Col xs={8} sm={6} lg={4}><Card><Statistic title="Active" value={723} valueStyle={{ color: '#52c41a' }} /></Card></Col>
            <Col xs={8} sm={6} lg={4}><Card><Statistic title="Blocked" value={15} valueStyle={{ color: '#cf1322' }} /></Card></Col>
          </Row>
          <Card><Table columns={columns} dataSource={mockTrucks} rowKey="id" pagination={{ pageSize: 20 }} /></Card>
          <Modal title="Truck Details" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={800}>
            {selectedTruck && <div style={{ color: textPrimary }}>Details for {selectedTruck.registrationNumber}</div>}
          </Modal>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default FleetManagementPage;
