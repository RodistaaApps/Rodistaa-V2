/**
 * Shipments Management - Theme-aware version
 */

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Table, Card, Button, Tag, Modal, Timeline } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';

interface ShipmentsPageProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

function ShipmentsManagementPage({ theme = 'dark', toggleTheme }: ShipmentsPageProps) {
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';

  const mockShipments = [
    { id: 'SHIP-001', route: 'Kurnool → Vijayawada', driver: 'Ramesh (DL12345)', truck: 'KA 01 AB 1234', status: 'IN_TRANSIT', progress: 65 },
    { id: 'SHIP-002', route: 'Guntur → Nandyal', driver: 'Kumar (DL67890)', truck: 'AP 09 CD 5678', status: 'AT_PICKUP', progress: 10 },
  ];

  const columns = [
    { title: 'Shipment ID', dataIndex: 'id', key: 'id', render: (t: string) => <span style={{ color: textPrimary, fontWeight: 600 }}>{t}</span> },
    { title: 'Route', dataIndex: 'route', key: 'route', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Driver', dataIndex: 'driver', key: 'driver', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Truck', dataIndex: 'truck', key: 'truck', render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color="purple">{s}</Tag> },
    { title: 'Progress', dataIndex: 'progress', key: 'progress', render: (p: number) => <span style={{ color: textPrimary }}>{p}%</span> },
    { title: 'Actions', key: 'actions', render: (_: any, r: any) => <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedShipment(r); setModalVisible(true); }}>Details</Button> },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>Shipment Management</h1>
            <Button type="primary" icon={<DownloadOutlined />} style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>Export CSV</Button>
          </div>
          <Card><Table columns={columns} dataSource={mockShipments} rowKey="id" pagination={{ pageSize: 20 }} /></Card>
          <Modal title="Shipment Details" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={800}>
            {selectedShipment && (
              <div style={{ color: textPrimary }}>
                <Timeline items={[
                  { children: 'Assigned' },
                  { children: 'Started' },
                  { children: 'At Pickup' },
                  { children: 'In Transit' },
                  { children: 'Delivered' },
                ]} />
              </div>
            )}
          </Modal>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default ShipmentsManagementPage;
