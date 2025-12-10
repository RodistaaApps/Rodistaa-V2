/**
 * Trucks Tab - Operator Detail
 * Shows operator's trucks with actions (block, verify inspection, view details)
 */

import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Card, Row, Col, Tabs, message } from 'antd';
import { EyeOutlined, StopOutlined, CheckCircleOutlined, FileProtectOutlined, WarningOutlined } from '@ant-design/icons';
import type { Truck } from '../types';
import dayjs from 'dayjs';

interface TrucksTabProps {
  operatorId: string;
  theme?: 'light' | 'dark';
}

export function TrucksTab({ operatorId, theme = 'dark' }: TrucksTabProps) {
  const [loading, setLoading] = useState(false);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [detailModal, setDetailModal] = useState(false);

  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockTrucks: Truck[] = [
    { id: 'TRK-001', reg_no: 'KA 01 AB 1234', operator_id: operatorId, truck_type: 'Container', model: 'Tata LPT 1613', bs_version: 'BS6', manufacture_year: 2021, status: 'active', last_inspection_at: '2025-11-15', next_inspection_due: '2026-02-15', gps_enabled: true, telematics_installed: true, documents_count: 6, photos_count: 6 },
    { id: 'TRK-002', reg_no: 'AP 09 CD 5678', operator_id: operatorId, truck_type: 'Flatbed', model: 'Ashok Leyland', bs_version: 'BS4', manufacture_year: 2019, status: 'expired_docs', last_inspection_at: '2025-10-20', gps_enabled: false, telematics_installed: false, documents_count: 4, photos_count: 6 },
  ];

  useEffect(() => {
    fetchTrucks();
  }, [operatorId]);

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setTrucks(mockTrucks);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockTruck = async (truckId: string) => {
    message.success('Truck blocked successfully. Audit log created.');
  };

  const columns = [
    { title: 'Reg No', dataIndex: 'reg_no', key: 'reg_no', width: 140, render: (t: string) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: textPrimary }}>{t}</span> },
    { title: 'Type', dataIndex: 'truck_type', key: 'truck_type', width: 110, render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'Model', dataIndex: 'model', key: 'model', width: 150, render: (t: string) => <span style={{ color: textPrimary }}>{t}</span> },
    { title: 'BS', dataIndex: 'bs_version', key: 'bs_version', width: 70, render: (v: string) => <Tag color={v === 'BS6' ? 'green' : 'orange'}>{v}</Tag> },
    { title: 'Year', dataIndex: 'manufacture_year', key: 'manufacture_year', width: 80, render: (y: number) => <span style={{ color: textPrimary }}>{y}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 130, render: (s: string) => <Tag color={s === 'active' ? 'green' : s === 'blocked' ? 'red' : 'orange'}>{s.replace(/_/g, ' ').toUpperCase()}</Tag> },
    { title: 'Last Inspection', dataIndex: 'last_inspection_at', key: 'last_inspection_at', width: 130, render: (d: string) => <span style={{ color: textSecondary }}>{d ? dayjs(d).format('DD MMM YYYY') : '—'}</span> },
    { title: 'GPS', dataIndex: 'gps_enabled', key: 'gps_enabled', width: 70, align: 'center' as const, render: (g: boolean) => g ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: Truck) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedTruck(record); setDetailModal(true); }}>View</Button>
          {record.status === 'active' && <Button danger type="text" size="small" icon={<StopOutlined />} onClick={() => handleBlockTruck(record.id)}>Block</Button>}
          {record.status === 'blocked' && <Button type="text" size="small" icon={<CheckCircleOutlined />} style={{ color: '#10B981' }}>Unblock</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Table columns={columns} dataSource={trucks} rowKey="id" loading={loading} pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} trucks` }} scroll={{ x: 1100 }} />
      
      <Modal title="Truck Details" open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={900}>
        {selectedTruck && (
          <Tabs items={[
            { key: 'info', label: 'Basic Info', children: <div style={{ color: textPrimary }}>Truck: {selectedTruck.reg_no}</div> },
            { key: 'photos', label: `Photos (${selectedTruck.photos_count})`, children: <div style={{ color: textPrimary }}>Photo gallery here</div> },
            { key: 'docs', label: `Documents (${selectedTruck.documents_count})`, children: <div style={{ color: textPrimary }}>Documents here</div> },
            { key: 'inspections', label: 'Inspections', children: <div style={{ color: textPrimary }}>Inspection history here</div> },
          ]} />
        )}
      </Modal>
    </div>
  );
}

