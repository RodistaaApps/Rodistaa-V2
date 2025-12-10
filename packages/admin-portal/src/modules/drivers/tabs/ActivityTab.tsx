import { Timeline } from 'antd';
import { LoginOutlined, CarOutlined, CameraOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export function ActivityTab({ driverId, theme = 'dark' }: { driverId: string; theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockActivities = [
    { type: 'trip_start', description: 'Started trip TRIP-001', timestamp: '2025-12-04T06:00:00Z' },
    { type: 'login', description: 'Logged in via Android App', timestamp: '2025-12-04T05:45:00Z' },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Timeline items={mockActivities.map(a => ({
        dot: <CarOutlined />,
        color: 'blue',
        children: (
          <div>
            <div style={{ color: textPrimary, fontWeight: 500 }}>{a.description}</div>
            <div style={{ fontSize: '12px', color: textSecondary }}>{dayjs(a.timestamp).format('DD MMM YYYY, HH:mm')}</div>
          </div>
        ),
      }))} />
    </div>
  );
}

