/**
 * Operator Detail Panel
 * Slide-in panel with 10 tabs for complete operator information
 */

import { useState, useEffect } from 'react';
import { Drawer, Tabs, Button, Tag, Space } from 'antd';
import {
  CloseOutlined,
  UserOutlined,
  CarOutlined,
  DollarOutlined,
  TruckOutlined,
  TeamOutlined,
  FileProtectOutlined,
  WalletOutlined,
  FileTextOutlined,
  HistoryOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { OperatorDetail } from './types';
import { OverviewTab } from './tabs/OverviewTab';
import { TrucksTab } from './tabs/TrucksTab';
import { BidsTab } from './tabs/BidsTab';
import { ShipmentsTab } from './tabs/ShipmentsTab';
import { DriversTab } from './tabs/DriversTab';
import { InspectionsTab } from './tabs/InspectionsTab';
import { LedgerTab } from './tabs/LedgerTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { ActivityTab } from './tabs/ActivityTab';
import { ACSTab } from './tabs/ACSTab';

interface OperatorDetailPanelProps {
  operatorId: string | null;
  open: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export function OperatorDetailPanel({ operatorId, open, onClose, theme = 'dark' }: OperatorDetailPanelProps) {
  const [loading, setLoading] = useState(false);
  const [operator, setOperator] = useState<OperatorDetail | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  useEffect(() => {
    if (operatorId && open) {
      fetchOperatorDetail();
    }
  }, [operatorId, open]);

  const fetchOperatorDetail = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300));
      // Mock data - replace with API call
      setOperator({
        id: 'USR-30321',
        role: 'operator',
        name: 'Suresh Logistics',
        mobile: '+911234561234',
        email: 'suresh@logistics.com',
        franchise: 'Hyderabad – Unit 1',
        city: 'Hyderabad',
        state: 'Telangana',
        last_active: '2025-12-04T10:12:00Z',
        trucks: { total: 10, active: 8, blocked: 1 },
        active_bids: 4,
        pending_inspections: 2,
        ledger_balance: 75200.0,
        acs_flags_count: 1,
        trust_score: 78,
        metrics: {
          trucks: { total: 10, active: 8, blocked: 1 },
          active_bids: 4,
          completed_shipments: 45,
          avg_response_time: 25,
        },
        ledger: { balance: 75200.0 },
        acs_flags: [],
        recent_activities: [],
        documents: [],
        trucks_list: { total: 10, items: [] },
        bids: { total: 50, items: [] },
        shipments: { total: 45, items: [] },
        drivers: { total: 12, items: [] },
        inspections: { pending: 2, items: [] },
      });
    } catch (error) {
      console.error('Failed to fetch operator detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'overview',
      label: <span><UserOutlined /> Overview</span>,
      children: operator && <OverviewTab operator={operator} theme={theme} />,
    },
    {
      key: 'trucks',
      label: <span><CarOutlined /> Trucks ({operator?.trucks.total || 0})</span>,
      children: operator && <TrucksTab operatorId={operator.id} theme={theme} />,
    },
    {
      key: 'bids',
      label: <span><DollarOutlined /> Bids ({operator?.bids.total || 0})</span>,
      children: operator && <BidsTab operatorId={operator.id} theme={theme} />,
    },
    {
      key: 'shipments',
      label: <span><TruckOutlined /> Shipments ({operator?.shipments.total || 0})</span>,
      children: operator && <ShipmentsTab operatorId={operator.id} theme={theme} />,
    },
    {
      key: 'drivers',
      label: <span><TeamOutlined /> Drivers ({operator?.drivers.total || 0})</span>,
      children: operator && <DriversTab operatorId={operator.id} theme={theme} />,
    },
    {
      key: 'inspections',
      label: <span><FileProtectOutlined /> Inspections ({operator?.inspections.pending || 0})</span>,
      children: operator && <InspectionsTab operatorId={operator.id} theme={theme} />,
    },
    {
      key: 'ledger',
      label: <span><WalletOutlined /> Ledger</span>,
      children: operator && <LedgerTab operatorId={operator.id} theme={theme} />,
    },
    {
      key: 'documents',
      label: <span><FileTextOutlined /> Documents</span>,
      children: operator && <DocumentsTab operatorId={operator.id} theme={theme} />,
    },
    {
      key: 'activity',
      label: <span><HistoryOutlined /> Activity</span>,
      children: operator && <ActivityTab operatorId={operator.id} theme={theme} />,
    },
    {
      key: 'acs',
      label: <span><WarningOutlined /> ACS / Risk ({operator?.acs_flags_count || 0})</span>,
      children: operator && <ACSTab operator={operator} theme={theme} />,
    },
  ];

  return (
    <Drawer
      title={
        operator ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary }}>
                {operator.name}
              </div>
              <Space size="small" style={{ marginTop: '4px' }}>
                <Tag color="green">Operator</Tag>
                <span style={{ fontSize: '12px', color: textSecondary, fontFamily: 'monospace' }}>
                  {operator.id}
                </span>
                <Tag>{operator.franchise}</Tag>
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
          Loading operator details...
        </div>
      ) : operator ? (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: textSecondary }}>
          Failed to load operator details
        </div>
      )}
    </Drawer>
  );
}

