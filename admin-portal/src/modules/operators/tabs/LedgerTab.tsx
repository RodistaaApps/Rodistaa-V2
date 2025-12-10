import { useState } from 'react';
import { Table, Button, Modal, Input, InputNumber, Card, Statistic, Row, Col, Form, message, Select } from 'antd';
import { WalletOutlined, DownloadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import type { LedgerTransaction } from '../types';
import dayjs from 'dayjs';

interface LedgerTabProps {
  operatorId: string;
  theme?: 'light' | 'dark';
}

export function LedgerTab({ operatorId, theme = 'dark' }: LedgerTabProps) {
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [form] = Form.useForm();
  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const mockTransactions: LedgerTransaction[] = [
    { id: 'TXN-001', type: 'credit', amount: 15000, date: '2025-12-01', reference: 'SHIP-001', description: 'Shipment completion payment' },
  ];

  const handleAdjustment = async (values: any) => {
    message.success('Ledger adjusted. Audit log created.');
    setAdjustModalOpen(false);
    form.resetFields();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textPrimary }}>{t}</span> },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <span style={{ color: t === 'credit' ? '#10B981' : '#EF4444', fontWeight: 600 }}>{t === 'credit' ? '+' : '-'}{t.toUpperCase()}</span> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: number, r: LedgerTransaction) => <span style={{ fontWeight: 600, color: r.type === 'credit' ? '#10B981' : '#EF4444' }}>₹{a.toLocaleString('en-IN')}</span> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => <span style={{ color: textSecondary }}>{dayjs(d).format('DD MMM YYYY')}</span> },
    { title: 'Reference', dataIndex: 'reference', key: 'reference', render: (t: string) => <span style={{ fontFamily: 'monospace', color: textSecondary }}>{t}</span> },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={8}><Card><Statistic title={<span style={{ color: textSecondary }}>Balance</span>} value={75200} prefix="₹" valueStyle={{ color: '#10B981', fontWeight: 'bold' }} /></Card></Col>
      </Row>
      <div style={{ marginBottom: '16px' }}>
        <Button type="primary" icon={<WalletOutlined />} onClick={() => setAdjustModalOpen(true)} style={{ background: '#C90D0D', borderColor: '#C90D0D', marginRight: '8px' }}>Manual Adjustment</Button>
        <Button icon={<DownloadOutlined />}>Export CSV</Button>
      </div>
      <Table columns={columns} dataSource={mockTransactions} rowKey="id" pagination={{ pageSize: 20 }} />
      
      <Modal title="Manual Ledger Adjustment" open={adjustModalOpen} onCancel={() => setAdjustModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleAdjustment}>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={[{ label: 'Credit', value: 'credit' }, { label: 'Debit', value: 'debit' }]} />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber prefix="₹" style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setAdjustModalOpen(false)} style={{ marginRight: '8px' }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>Confirm</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

