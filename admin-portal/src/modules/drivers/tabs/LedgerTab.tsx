import { Table, Card, Statistic } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export function LedgerTab({ driverId, theme = 'dark' }: { driverId: string; theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const mockTransactions = [
    { id: 'TXN-001', type: 'settlement', amount: 5000, date: '2025-12-01', reference: 'TRIP-045' },
  ];

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textPrimary }}>{t}</span> },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <span style={{ color: '#10B981' }}>{t.toUpperCase()}</span> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: number) => <span style={{ fontWeight: 600, color: '#10B981' }}>₹{a.toLocaleString('en-IN')}</span> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => <span style={{ color: textSecondary }}>{dayjs(d).format('DD MMM YYYY')}</span> },
    { title: 'Reference', dataIndex: 'reference', key: 'reference', render: (r: string) => <span style={{ fontFamily: 'monospace', color: textSecondary }}>{r}</span> },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Card style={{ marginBottom: '24px', background: bgCard, border: `1px solid ${border}` }}>
        <Statistic title={<span style={{ color: textSecondary }}>Balance</span>} value={0} prefix="₹" valueStyle={{ color: textPrimary }} />
      </Card>
      <Table columns={columns} dataSource={mockTransactions} rowKey="id" pagination={false} />
    </div>
  );
}

