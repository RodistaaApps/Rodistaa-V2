/**
 * Activity & Audit Timeline Tab
 * Chronological list of all shipper activities and admin actions
 */

import { useState, useEffect } from 'react';
import { Timeline, Tag, Space, Button } from 'antd';
import {
  LoginOutlined,
  BookOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { Activity } from '../types';
import dayjs from 'dayjs';

interface ActivityTabProps {
  shipperId: string;
  theme?: 'light' | 'dark';
}

export function ActivityTab({ shipperId, theme = 'dark' }: ActivityTabProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockActivities: Activity[] = [
    {
      id: 'ACT-001',
      type: 'login',
      description: 'Logged in via Android App',
      timestamp: '2025-12-04T09:34:00Z',
      metadata: { ip: '103.x.x.x', device: 'Samsung Galaxy' },
    },
    {
      id: 'ACT-002',
      type: 'booking_created',
      description: 'Created booking BKG-003',
      timestamp: '2025-12-04T09:40:00Z',
      metadata: { booking_id: 'BKG-003', route: 'Guntur → Chennai' },
    },
    {
      id: 'ACT-003',
      type: 'admin_kyc_view',
      description: 'Admin viewed Aadhaar document',
      actor: 'admin@rodistaa.com',
      timestamp: '2025-12-03T14:20:00Z',
      metadata: { document_id: 'DOC-001', reason: 'Verification check' },
    },
  ];

  useEffect(() => {
    fetchActivities();
  }, [shipperId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setActivities(mockActivities);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      login: <LoginOutlined />,
      booking_created: <BookOutlined />,
      document_upload: <FileTextOutlined />,
      payment: <DollarOutlined />,
      admin_action: <UserOutlined />,
      admin_kyc_view: <EyeOutlined />,
    };
    return icons[type] || <UserOutlined />;
  };

  const getActivityColor = (type: string) => {
    if (type.startsWith('admin_')) return 'orange';
    if (type.includes('login')) return 'blue';
    if (type.includes('booking')) return 'green';
    return 'default';
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Timeline
        items={activities.map((activity) => ({
          dot: getActivityIcon(activity.type),
          color: getActivityColor(activity.type),
          children: (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: textPrimary, fontWeight: 500, marginBottom: '4px' }}>
                    {activity.description}
                  </div>
                  {activity.actor && (
                    <Tag color="orange" style={{ fontSize: '11px' }}>
                      Admin Action: {activity.actor}
                    </Tag>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: textSecondary, whiteSpace: 'nowrap', marginLeft: '16px' }}>
                  {dayjs(activity.timestamp).format('DD MMM YYYY, HH:mm')}
                </div>
              </div>
              {activity.metadata && (
                <div style={{
                  fontSize: '12px',
                  color: textSecondary,
                  marginTop: '8px',
                  padding: '8px',
                  background: isDark ? '#1E2430' : '#F3F4F6',
                  borderRadius: '4px',
                }}>
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
        }))}
      />
      
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button onClick={fetchActivities}>Load More</Button>
      </div>
    </div>
  );
}

