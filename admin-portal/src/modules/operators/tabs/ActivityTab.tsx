import { Timeline, Tag } from 'antd';
import { LoginOutlined, CarOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface ActivityTabProps {
  operatorId: string;
  theme?: 'light' | 'dark';
}

export function ActivityTab({ operatorId, theme = 'dark' }: ActivityTabProps) {
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockActivities = [
    { id: '1', type: 'login', description: 'Logged in via Android App', timestamp: '2025-12-04T10:12:00Z' },
    { id: '2', type: 'bid_placed', description: 'Placed bid on BKG-101', timestamp: '2025-12-04T09:30:00Z' },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Timeline items={mockActivities.map(a => ({
        dot: <LoginOutlined />,
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

