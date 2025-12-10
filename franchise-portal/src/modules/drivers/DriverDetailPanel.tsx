/**
 * Driver Detail Panel - Slide-in with 10 tabs
 */

import { useState, useEffect } from 'react';
import { Drawer, Tabs, Button, Tag, Space, Badge } from 'antd';
import { CloseOutlined, UserOutlined, EnvironmentOutlined, CarOutlined, TeamOutlined, FileTextOutlined, WarningOutlined, HistoryOutlined, WalletOutlined, FileProtectOutlined, DashboardOutlined } from '@ant-design/icons';
import type { DriverDetail } from './types';
import { OverviewTab } from './tabs/OverviewTab';
import { LiveTrackingTab } from './tabs/LiveTrackingTab';
import { TripsTab } from './tabs/TripsTab';
import { AssignmentsTab } from './tabs/AssignmentsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { IncidentsTab } from './tabs/IncidentsTab';
import { LocationLogsTab } from './tabs/LocationLogsTab';
import { InspectionsTab } from './tabs/InspectionsTab';
import { LedgerTab } from './tabs/LedgerTab';
import { ActivityTab } from './tabs/ActivityTab';

interface DriverDetailPanelProps {
  driverId: string | null;
  open: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export function DriverDetailPanel({ driverId, open, onClose, theme = 'dark' }: DriverDetailPanelProps) {
  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState<DriverDetail | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  useEffect(() => {
    if (driverId && open) {
      fetchDriverDetail();
    }
  }, [driverId, open]);

  const fetchDriverDetail = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Mock data
      setDriver({
        id: 'USR-50421',
        role: 'driver',
        name: 'Prakash Kumar',
        mobile: '+911234561234',
        email: 'prakash@example.com',
        operators: [{ id: 'OP-1', name: 'Suresh Logistics', is_primary: true }],
        assigned_truck: 'TN 01 AB 1234',
        dl_number: 'DL1234567890',
        dl_expiry: '2026-05-12',
        availability: 'on_trip',
        last_ping: '2025-12-04T09:10:00Z',
        last_location: { city: 'Hyderabad', lat: 17.3850, lng: 78.4867, timestamp: '2025-12-04T09:10:00Z' },
        trips_30d: 42,
        behaviour_score: 82,
        acs_flags_count: 0,
        trust_score: 82,
        city: 'Hyderabad',
        state: 'Telangana',
        last_active: '2025-12-04T09:10:00Z',
        metrics: {
          completed_trips_30d: 42,
          avg_onroad_time: 6.5,
          last_trip_start: '2025-12-04T06:00:00Z',
          total_driving_hours_30d: 273,
        },
        active_trip: {
          id: 'TRIP-001',
          booking_id: 'BKG-101',
          operator_name: 'Suresh Logistics',
          truck_reg: 'TN 01 AB 1234',
          route: { from: 'Hyderabad', to: 'Vijayawada' },
          start_time: '2025-12-04T06:00:00Z',
          eta: '2025-12-04T12:00:00Z',
          current_speed: 65,
          current_location: { lat: 17.3850, lng: 78.4867, timestamp: '2025-12-04T09:10:00Z' },
          status: 'in_transit',
        },
        trips: { total: 156, items: [] },
        assignments: { total: 2, items: [] },
        documents: [],
        incidents: { total: 3, items: [] },
        location_logs: { total: 5420, items: [] },
        ledger: { balance: 0 },
        recent_activities: [],
        acs_flags: [],
      });
    } catch (error) {
      console.error('Failed to fetch driver detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    { key: 'overview', label: <span><UserOutlined /> Overview</span>, children: driver && <OverviewTab driver={driver} theme={theme} /> },
    { key: 'live', label: <span><EnvironmentOutlined /> {driver?.active_trip ? 'Live Tracking' : 'Last Trip'}</span>, children: driver && <LiveTrackingTab driver={driver} theme={theme} /> },
    { key: 'trips', label: <span><CarOutlined /> Trips ({driver?.trips.total || 0})</span>, children: driver && <TripsTab driverId={driver.id} theme={theme} /> },
    { key: 'assignments', label: <span><TeamOutlined /> Assignments ({driver?.assignments.total || 0})</span>, children: driver && <AssignmentsTab driverId={driver.id} theme={theme} /> },
    { key: 'documents', label: <span><FileTextOutlined /> Documents</span>, children: driver && <DocumentsTab driverId={driver.id} theme={theme} /> },
    { key: 'incidents', label: <span><WarningOutlined /> Incidents ({driver?.incidents.total || 0})</span>, children: driver && <IncidentsTab driverId={driver.id} theme={theme} /> },
    { key: 'locations', label: <span><DashboardOutlined /> Location Logs ({driver?.location_logs.total || 0})</span>, children: driver && <LocationLogsTab driverId={driver.id} theme={theme} /> },
    { key: 'inspections', label: <span><FileProtectOutlined /> Inspections</span>, children: driver && <InspectionsTab driverId={driver.id} theme={theme} /> },
    { key: 'ledger', label: <span><WalletOutlined /> Ledger</span>, children: driver && <LedgerTab driverId={driver.id} theme={theme} /> },
    { key: 'activity', label: <span><HistoryOutlined /> Activity</span>, children: driver && <ActivityTab driverId={driver.id} theme={theme} /> },
  ];

  return (
    <Drawer
      title={driver ? (
        <div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary }}>{driver.name}</div>
          <Space size="small" style={{ marginTop: '4px' }}>
            <Tag color="orange">Driver</Tag>
            <span style={{ fontSize: '12px', color: textSecondary, fontFamily: 'monospace' }}>{driver.id}</span>
            {driver.operators[0] && <Tag color="blue">{driver.operators[0].name}</Tag>}
          </Space>
        </div>
      ) : 'Loading...'}
      open={open}
      onClose={onClose}
      width="90%"
      style={{ maxWidth: '1400px' }}
      extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
    >
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: textSecondary }}>Loading driver details...</div>
      ) : driver ? (
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: textSecondary }}>Failed to load driver details</div>
      )}
    </Drawer>
  );
}

