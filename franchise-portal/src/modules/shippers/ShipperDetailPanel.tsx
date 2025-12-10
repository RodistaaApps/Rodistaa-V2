/**
 * Shipper Detail Panel
 * Slide-in panel with 9 tabs for complete shipper information
 */

import { useState, useEffect } from 'react';
import { Drawer, Tabs, Button, Tag, Space, Statistic, Row, Col, Progress, Card, Badge, Tooltip } from 'antd';
import {
  CloseOutlined,
  UserOutlined,
  BookOutlined,
  TruckOutlined,
  WalletOutlined,
  FileTextOutlined,
  MessageOutlined,
  HistoryOutlined,
  WarningOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ShipperDetail } from './types';
import { OverviewTab } from './tabs/OverviewTab';
import { BookingsTab } from './tabs/BookingsTab';
import { ShipmentsTab } from './tabs/ShipmentsTab';
import { LedgerTab } from './tabs/LedgerTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { MessagesTab } from './tabs/MessagesTab';
import { ActivityTab } from './tabs/ActivityTab';
import { ACSTab } from './tabs/ACSTab';
import { AdminActionsTab } from './tabs/AdminActionsTab';

interface ShipperDetailPanelProps {
  shipperId: string | null;
  open: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export function ShipperDetailPanel({ shipperId, open, onClose, theme = 'dark' }: ShipperDetailPanelProps) {
  const [loading, setLoading] = useState(false);
  const [shipper, setShipper] = useState<ShipperDetail | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  useEffect(() => {
    if (shipperId && open) {
      fetchShipperDetail();
    }
  }, [shipperId, open]);

  const fetchShipperDetail = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/users/${shipperId}`);
      // const data = await response.json();
      
      // Mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      setShipper({
        id: 'USR-20241',
        role: 'shipper',
        name: 'Rohit Sharma',
        mobile: '+911234561234',
        email: 'rohit@example.com',
        franchise: 'Vijayawada – Unit 2',
        city: 'Vijayawada',
        state: 'Andhra Pradesh',
        trust_score: 86,
        last_active: '2025-12-04T09:34:00Z',
        metrics: {
          bookings: 12,
          completed_shipments: 10,
          open_shipments: 2,
        },
        ledger: { balance: 12500.5 },
        acs_flags: [
          {
            id: 'ACS-001',
            severity: 'high',
            summary: 'Multiple cancellations in last 30 days',
            created_at: '2025-11-20T10:00:00Z',
          },
        ],
        recent_activities: [],
        documents: [],
        bookings: { total: 50, items: [] },
        shipments: { total: 40, items: [] },
        ledger_balance: 12500.5,
        acs_flags_count: 1,
      });
    } catch (error) {
      console.error('Failed to fetch shipper detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <UserOutlined /> Overview
        </span>
      ),
      children: shipper && <OverviewTab shipper={shipper} theme={theme} />,
    },
    {
      key: 'bookings',
      label: (
        <span>
          <BookOutlined /> Bookings
          {shipper && <Badge count={shipper.bookings.total} offset={[10, 0]} />}
        </span>
      ),
      children: shipper && <BookingsTab shipperId={shipper.id} theme={theme} />,
    },
    {
      key: 'shipments',
      label: (
        <span>
          <TruckOutlined /> Shipments
          {shipper && <Badge count={shipper.shipments.total} offset={[10, 0]} />}
        </span>
      ),
      children: shipper && <ShipmentsTab shipperId={shipper.id} theme={theme} />,
    },
    {
      key: 'ledger',
      label: (
        <span>
          <WalletOutlined /> Ledger
        </span>
      ),
      children: shipper && <LedgerTab shipperId={shipper.id} theme={theme} />,
    },
    {
      key: 'documents',
      label: (
        <span>
          <FileTextOutlined /> Documents
        </span>
      ),
      children: shipper && <DocumentsTab shipperId={shipper.id} theme={theme} />,
    },
    {
      key: 'messages',
      label: (
        <span>
          <MessageOutlined /> Messages
        </span>
      ),
      children: shipper && <MessagesTab shipperId={shipper.id} theme={theme} />,
    },
    {
      key: 'activity',
      label: (
        <span>
          <HistoryOutlined /> Activity
        </span>
      ),
      children: shipper && <ActivityTab shipperId={shipper.id} theme={theme} />,
    },
    {
      key: 'acs',
      label: (
        <span>
          <WarningOutlined /> ACS / Risk
          {shipper && shipper.acs_flags.length > 0 && (
            <Badge count={shipper.acs_flags.length} offset={[10, 0]} style={{ backgroundColor: '#EF4444' }} />
          )}
        </span>
      ),
      children: shipper && <ACSTab shipper={shipper} theme={theme} />,
    },
    {
      key: 'admin',
      label: (
        <span>
          <SettingOutlined /> Admin Actions
        </span>
      ),
      children: shipper && <AdminActionsTab shipper={shipper} theme={theme} />,
    },
  ];

  return (
    <Drawer
      title={
        shipper ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary }}>
                {shipper.name}
              </div>
              <Space size="small" style={{ marginTop: '4px' }}>
                <Tag color="blue">Shipper</Tag>
                <span style={{ fontSize: '12px', color: textSecondary, fontFamily: 'monospace' }}>
                  {shipper.id}
                </span>
                <Tag>{shipper.franchise}</Tag>
              </Space>
            </div>
          </div>
        ) : (
          'Loading...'
        )
      }
      open={open}
      onClose={onClose}
      width="90%"
      style={{ maxWidth: '1400px' }}
      extra={
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
        />
      }
    >
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: textSecondary }}>
          Loading shipper details...
        </div>
      ) : shipper ? (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: textSecondary }}>
          Failed to load shipper details
        </div>
      )}
    </Drawer>
  );
}

