/**
 * Payout Preview & Approval Page
 * 
 * Payout management workflow:
 * - Generate daily/weekly payout preview
 * - Manual adjustments (penalties, bonuses)
 * - Approval & finalization
 * - Bank CSV generation
 * - Odoo sync
 * - Payout history
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  Modal,
  Input,
  DatePicker,
  Tag,
  message,
  InputNumber,
} from 'antd';
import {
  DollarOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  EditOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import dayjs from 'dayjs';

interface PayoutItem {
  user_id: string;
  user_name: string;
  user_type: 'operator' | 'driver';
  amount: number;
  bank_account: string;
  ifsc: string;
  shipment_count: number;
  adjustments: number;
}

const PayoutsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [payoutItems, setPayoutItems] = useState<PayoutItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [batchStatus, setBatchStatus] = useState<'preview' | 'approved' | 'completed'>('preview');
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PayoutItem | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  useEffect(() => {
    generatePreview();
  }, [selectedDate]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      // TODO: Call /admin/payouts/preview
      await new Promise(resolve => setTimeout(resolve, 600));

      const mockItems: PayoutItem[] = [
        {
          user_id: 'OP-001',
          user_name: 'ABC Transport',
          user_type: 'operator',
          amount: 125000,
          bank_account: '1234567890',
          ifsc: 'HDFC0001234',
          shipment_count: 15,
          adjustments: 0,
        },
        {
          user_id: 'DR-001',
          user_name: 'Ramesh Kumar',
          user_type: 'driver',
          amount: 45000,
          bank_account: '9876543210',
          ifsc: 'ICIC0002345',
          shipment_count: 8,
          adjustments: -5000, // Penalty
        },
      ];

      setPayoutItems(mockItems);
      setBatchStatus('preview');
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = async () => {
    if (!selectedItem || !adjustmentReason.trim()) {
      message.error('Reason is required for adjustments');
      return;
    }

    try {
      // TODO: Apply adjustment
      const updatedItems = payoutItems.map(item =>
        item.user_id === selectedItem.user_id
          ? { ...item, adjustments: item.adjustments + adjustmentAmount }
          : item
      );

      setPayoutItems(updatedItems);
      setAdjustModalOpen(false);
      message.success('Adjustment applied');
    } catch (error) {
      message.error('Adjustment failed');
    }
  };

  const handleApproveBatch = async () => {
    Modal.confirm({
      title: 'Approve Payout Batch?',
      content: `This will finalize payouts for ${payoutItems.length} users totaling ₹${totalAmount.toLocaleString()}. This action cannot be undone.`,
      okText: 'Approve & Finalize',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // TODO: Call /admin/payouts/approve
          console.log('Approve batch:', selectedDate.format('YYYY-MM-DD'));
          
          setBatchStatus('approved');
          message.success('Payout batch approved successfully');
        } catch (error) {
          message.error('Approval failed');
        }
      },
    });
  };

  const handleDownloadCSV = async () => {
    try {
      // TODO: Generate and download CSV
      console.log('Download CSV for:', selectedDate.format('YYYY-MM-DD'));
      message.success('CSV downloaded');
    } catch (error) {
      message.error('Download failed');
    }
  };

  const totalAmount = payoutItems.reduce((sum, item) => sum + item.amount + item.adjustments, 0);
  const totalShipments = payoutItems.reduce((sum, item) => sum + item.shipment_count, 0);

  const columns = [
    {
      title: 'User',
      key: 'user',
      width: 220,
      render: (_: any, record: PayoutItem) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>{record.user_name}</div>
          <div style={{ fontSize: '11px', color: textSecondary }}>
            <Tag color={record.user_type === 'operator' ? 'green' : 'orange'} style={{ fontSize: '10px' }}>
              {record.user_type.toUpperCase()}
            </Tag>
            <span style={{ fontFamily: 'monospace', marginLeft: '4px' }}>{record.user_id}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Shipments',
      dataIndex: 'shipment_count',
      key: 'shipment_count',
      width: 100,
      align: 'center' as const,
      render: (count: number) => (
        <span style={{ fontWeight: 600, color: textPrimary }}>{count}</span>
      ),
    },
    {
      title: 'Base Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right' as const,
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: textPrimary }}>
          ₹{amount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      title: 'Adjustments',
      dataIndex: 'adjustments',
      key: 'adjustments',
      width: 140,
      align: 'right' as const,
      render: (adj: number, record: PayoutItem) => (
        <div>
          <span style={{ 
            fontWeight: 600, 
            color: adj < 0 ? '#EF4444' : adj > 0 ? '#10B981' : textSecondary 
          }}>
            {adj !== 0 ? `₹${Math.abs(adj).toLocaleString('en-IN')}` : '—'}
          </span>
          {adj !== 0 && (
            <div style={{ fontSize: '10px', color: textSecondary }}>
              {adj < 0 ? 'Penalty' : 'Bonus'}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Final Amount',
      key: 'final',
      width: 160,
      align: 'right' as const,
      render: (_: any, record: PayoutItem) => {
        const final = record.amount + record.adjustments;
        return (
          <span style={{ 
            fontSize: '16px',
            fontWeight: 'bold', 
            color: '#10B981'
          }}>
            ₹{final.toLocaleString('en-IN')}
          </span>
        );
      },
    },
    {
      title: 'Bank Details',
      key: 'bank',
      width: 180,
      render: (_: any, record: PayoutItem) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ fontFamily: 'monospace', color: textPrimary }}>{record.bank_account}</div>
          <div style={{ color: textSecondary }}>{record.ifsc}</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: PayoutItem) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedItem(record);
            setAdjustmentAmount(0);
            setAdjustmentReason('');
            setAdjustModalOpen(true);
          }}
          disabled={batchStatus !== 'preview'}
        >
          Adjust
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout theme={theme} toggleTheme={toggleTheme}>
      <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
              <DollarOutlined style={{ marginRight: '12px' }} />
              Payout Management
            </h1>
            <div style={{ color: textSecondary, fontSize: '14px', marginTop: '4px' }}>
              Preview, adjust, and approve operator/driver payouts
            </div>
          </div>
          <Space>
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="DD MMM YYYY"
            />
            {batchStatus === 'preview' && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApproveBatch}
                size="large"
              >
                Approve Batch
              </Button>
            )}
            {batchStatus === 'approved' && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadCSV}
                size="large"
              >
                Download Bank CSV
              </Button>
            )}
          </Space>
        </div>

        {/* Summary Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={12} sm={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title="Total Payouts"
                value={payoutItems.length}
                valueStyle={{ color: textPrimary }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title="Total Amount"
                value={totalAmount}
                prefix="₹"
                valueStyle={{ color: '#10B981', fontWeight: 'bold' }}
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title="Shipments"
                value={totalShipments}
                valueStyle={{ color: textPrimary }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title="Status"
                value={batchStatus.toUpperCase()}
                valueStyle={{ 
                  color: batchStatus === 'preview' ? '#F59E0B' : 
                         batchStatus === 'approved' ? '#10B981' : textPrimary 
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Status Alert */}
        {batchStatus === 'preview' && (
          <Alert
            message="Preview Mode"
            description="Review and adjust payouts before approval. You can manually add penalties or bonuses."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        {/* Table */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Table
            columns={columns}
            dataSource={payoutItems}
            rowKey="user_id"
            loading={loading}
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Adjustment Modal */}
        <Modal
          open={adjustModalOpen}
          title={`Adjust Payout: ${selectedItem?.user_name}`}
          onCancel={() => setAdjustModalOpen(false)}
          footer={
            <Space>
              <Button onClick={() => setAdjustModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleAdjustment}
                disabled={!adjustmentReason.trim() || adjustmentAmount === 0}
              >
                Apply Adjustment
              </Button>
            </Space>
          }
        >
          {selectedItem && (
            <div>
              <div style={{ marginBottom: '16px', padding: '12px', background: isDark ? '#0A0E14' : '#F9FAFB', borderRadius: '6px' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ fontSize: '12px', color: textSecondary }}>Current Amount</div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: textPrimary }}>
                      ₹{selectedItem.amount.toLocaleString('en-IN')}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ fontSize: '12px', color: textSecondary }}>Current Adjustments</div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: selectedItem.adjustments < 0 ? '#EF4444' : '#10B981' }}>
                      ₹{selectedItem.adjustments.toLocaleString('en-IN')}
                    </div>
                  </Col>
                </Row>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  Adjustment Amount <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter amount (positive for bonus, negative for penalty)"
                  value={adjustmentAmount}
                  onChange={(value) => setAdjustmentAmount(value || 0)}
                  prefix="₹"
                  precision={2}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  Reason <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <Input.TextArea
                  rows={3}
                  placeholder="Enter reason for adjustment (will be audited)"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  maxLength={500}
                  showCount
                />
              </div>

              {adjustmentAmount !== 0 && (
                <div style={{ marginTop: '16px', padding: '12px', background: isDark ? '#0A0E14' : '#F9FAFB', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: textSecondary }}>New Final Amount</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
                    ₹{(selectedItem.amount + selectedItem.adjustments + adjustmentAmount).toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default PayoutsPage;

