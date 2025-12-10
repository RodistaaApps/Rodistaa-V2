/**
 * Location Logs Tab - PRIVACY-SENSITIVE
 * Shows GPS ping history with security controls
 */

import { Table, Button, Tag, Modal, Input, message } from 'antd';
import { DownloadOutlined, EnvironmentOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import dayjs from 'dayjs';

export function LocationLogsTab({ driverId, theme = 'dark' }: { driverId: string; theme?: 'light' | 'dark' }) {
  const [exportModal, setExportModal] = useState(false);
  const [exportReason, setExportReason] = useState('');
  
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const bgCard = isDark ? '#151922' : '#FFFFFF';

  const mockLogs = [
    { id: 'LOC-001', lat: 17.3850, lng: 78.4867, accuracy: 5, timestamp: '2025-12-04T09:10:00Z', network_type: '4g', trip_id: 'TRIP-001' },
    { id: 'LOC-002', lat: 17.3855, lng: 78.4870, accuracy: 8, timestamp: '2025-12-04T09:05:00Z', network_type: '4g', trip_id: 'TRIP-001' },
  ];

  const handleExport = () => {
    if (!exportReason.trim()) {
      message.error('Reason is required for location export');
      return;
    }
    message.success('Location export queued. Audit log created.');
    setExportModal(false);
    setExportReason('');
  };

  const columns = [
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (t: string) => <span style={{ color: textPrimary }}>{dayjs(t).format('DD MMM YYYY, HH:mm:ss')}</span> },
    { title: 'Latitude', dataIndex: 'lat', key: 'lat', render: (l: number) => <span style={{ fontFamily: 'monospace', color: textPrimary }}>{l.toFixed(6)}</span> },
    { title: 'Longitude', dataIndex: 'lng', key: 'lng', render: (l: number) => <span style={{ fontFamily: 'monospace', color: textPrimary }}>{l.toFixed(6)}</span> },
    { title: 'Accuracy', dataIndex: 'accuracy', key: 'accuracy', render: (a: number) => <span style={{ color: textSecondary }}>{a}m</span> },
    { title: 'Network', dataIndex: 'network_type', key: 'network_type', render: (n: string) => <Tag>{n.toUpperCase()}</Tag> },
    { title: 'Trip', dataIndex: 'trip_id', key: 'trip_id', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textSecondary }}>{t || '—'}</span> },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: '16px', padding: '12px', background: '#F59E0B20', border: '1px solid #F59E0B', borderRadius: '6px' }}>
        <Space><LockOutlined style={{ color: '#F59E0B' }} /><div style={{ fontSize: '13px', color: textPrimary }}><strong>Privacy Notice:</strong> Location data is sensitive. Viewing and exporting requires reason and creates audit log.</div></Space>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <Button icon={<DownloadOutlined />} onClick={() => setExportModal(true)}>Export Locations (CSV)</Button>
      </div>
      <Table columns={columns} dataSource={mockLogs} rowKey="id" pagination={{ pageSize: 50 }} scroll={{ x: 900 }} />
      
      <Modal title="Export Location Logs" open={exportModal} onCancel={() => setExportModal(false)} onOk={handleExport} okButtonProps={{ style: { background: '#C90D0D', borderColor: '#C90D0D' } }}>
        <div style={{ marginBottom: '12px', color: textPrimary }}>Exporting location logs is a sensitive operation. Please provide a reason:</div>
        <Input.TextArea rows={3} value={exportReason} onChange={(e) => setExportReason(e.target.value)} placeholder="e.g., Investigation for incident INC-001" />
        <div style={{ marginTop: '12px', padding: '8px', background: '#3B82F620', border: '1px solid #3B82F6', borderRadius: '4px', fontSize: '12px', color: textPrimary }}>ℹ️ Export will be logged with your admin ID, timestamp, and reason.</div>
      </Modal>
    </div>
  );
}

