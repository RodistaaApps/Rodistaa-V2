/**
 * Ledger Tab - Shipper Detail
 * Shows financial transactions and balance with manual adjustment capability
 */

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, InputNumber, Card, Statistic, Row, Col, Select, Form, message } from 'antd';
import { WalletOutlined, DownloadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import type { LedgerTransaction } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface LedgerTabProps {
  shipperId: string;
  theme?: 'light' | 'dark';
}

export function LedgerTab({ shipperId, theme = 'dark' }: LedgerTabProps) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [balance, setBalance] = useState(12500.5);
  const [form] = Form.useForm();

  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const mockTransactions: LedgerTransaction[] = [
    {
      id: 'TXN-001',
      type: 'credit',
      amount: 15000,
      date: '2025-12-01T10:00:00Z',
      reference: 'BKG-001',
      description: 'Booking refund',
    },
    {
      id: 'TXN-002',
      type: 'debit',
      amount: 2500,
      date: '2025-12-02T14:30:00Z',
      reference: 'SYS-AUTO',
      description: 'Service fee',
    },
  ];

  useEffect(() => {
    fetchTransactions();
  }, [shipperId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = async (values: any) => {
    try {
      // TODO: API call to adjust ledger
      // await fetch(`/api/admin/users/${shipperId}/ledger/adjust`, { method: 'POST', body: JSON.stringify(values) });
      
      message.success('Ledger adjusted successfully');
      setAdjustModalOpen(false);
      form.resetFields();
      fetchTransactions();
    } catch (error) {
      message.error('Failed to adjust ledger');
    }
  };

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      width: 130,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', color: textPrimary }}>{id}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <span style={{ 
          color: type === 'credit' ? '#10B981' : type === 'debit' ? '#EF4444' : '#F59E0B',
          fontWeight: 600,
        }}>
          {type === 'credit' && <PlusOutlined style={{ marginRight: '4px' }} />}
          {type === 'debit' && <MinusOutlined style={{ marginRight: '4px' }} />}
          {type.toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right' as const,
      render: (amount: number, record: LedgerTransaction) => (
        <span style={{ 
          fontWeight: 600,
          color: record.type === 'credit' ? '#10B981' : '#EF4444',
        }}>
          {record.type === 'credit' ? '+' : '-'}₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 140,
      render: (date: string) => (
        <span style={{ color: textSecondary }}>{dayjs(date).format('DD MMM YYYY, HH:mm')}</span>
      ),
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
      width: 120,
      render: (ref: string) => (
        <span style={{ fontFamily: 'monospace', color: textSecondary }}>{ref}</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => <span style={{ color: textPrimary }}>{desc}</span>,
    },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Balance Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={<span style={{ color: textSecondary }}>Current Balance</span>}
              value={balance}
              prefix="₹"
              precision={2}
              valueStyle={{ 
                color: balance < 0 ? '#EF4444' : '#10B981',
                fontWeight: 'bold',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={<span style={{ color: textSecondary }}>Total Credits (30d)</span>}
              value={45000}
              prefix="₹"
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={<span style={{ color: textSecondary }}>Total Debits (30d)</span>}
              value={32500}
              prefix="₹"
              valueStyle={{ color: '#EF4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <Button
          type="primary"
          icon={<WalletOutlined />}
          onClick={() => setAdjustModalOpen(true)}
          style={{ background: '#C90D0D', borderColor: '#C90D0D' }}
        >
          Manual Adjustment
        </Button>
        <Button icon={<DownloadOutlined />}>
          Export Ledger (CSV)
        </Button>
      </div>

      {/* Transactions Table */}
      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showTotal: (total) => `Total ${total} transactions` }}
      />

      {/* Manual Adjustment Modal */}
      <Modal
        title="Manual Ledger Adjustment"
        open={adjustModalOpen}
        onCancel={() => {
          setAdjustModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdjustment}
        >
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select
              options={[
                { label: 'Credit (Add Money)', value: 'credit' },
                { label: 'Debit (Deduct Money)', value: 'debit' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <InputNumber
              prefix="₹"
              style={{ width: '100%' }}
              min={0}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason (Required for Audit)"
            rules={[{ required: true, message: 'Please provide reason' }]}
          >
            <TextArea
              rows={4}
              placeholder="Explain why this adjustment is being made..."
            />
          </Form.Item>

          <div style={{ 
            padding: '12px',
            background: '#F59E0B20',
            border: '1px solid #F59E0B',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '13px',
            color: textPrimary,
          }}>
            ⚠️ This action will be logged in audit trail with your admin ID, timestamp, and reason.
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setAdjustModalOpen(false)} style={{ marginRight: '8px' }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>
              Confirm Adjustment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

