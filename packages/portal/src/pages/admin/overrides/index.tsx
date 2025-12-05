/**
 * Admin Overrides Page
 * 
 * Central hub for all data correction overrides:
 * - Force CTL → STN conversion
 * - Force STN OTP release
 * - Adjust bidding fees
 * - Manual payout release
 * - Wallet credit/debit
 * - POD mismatch overrides
 * - Truck verification overrides
 * - Load reassignment
 * 
 * All overrides require:
 * - Detailed reason (min 20 chars)
 * - High-risk actions require typed "CONFIRM"
 * - Complete audit trail
 */

import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Statistic,
  Modal,
  Input,
  Select,
  Space,
  Alert,
  Table,
  Tag,
  message,
} from 'antd';
import {
  WarningOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  WalletOutlined,
  FileTextOutlined,
  CarOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';

const { TextArea } = Input;

interface OverrideAction {
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  riskLevel: 'high' | 'medium' | 'low';
  requiresConfirmation: boolean;
}

const OverridesPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<OverrideAction | null>(null);
  const [resourceId, setResourceId] = useState('');
  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const overrideActions: OverrideAction[] = [
    {
      type: 'FORCE_CTL_TO_STN',
      name: 'Force CTL → STN',
      description: 'Convert Contract to Load to Spot to Network',
      icon: <SwapOutlined />,
      riskLevel: 'medium',
      requiresConfirmation: false,
    },
    {
      type: 'FORCE_STN_RELEASE',
      name: 'Force STN OTP Release',
      description: 'Emergency release of STN without OTP verification',
      icon: <ThunderboltOutlined />,
      riskLevel: 'high',
      requiresConfirmation: true,
    },
    {
      type: 'ADJUST_BIDDING_FEE',
      name: 'Adjust Bidding Fee',
      description: 'Manual override of bidding fee for a load',
      icon: <DollarOutlined />,
      riskLevel: 'medium',
      requiresConfirmation: false,
    },
    {
      type: 'MANUAL_PAYOUT',
      name: 'Manual Payout Release',
      description: 'Force release payout outside normal cycle',
      icon: <WalletOutlined />,
      riskLevel: 'high',
      requiresConfirmation: true,
    },
    {
      type: 'WALLET_CREDIT',
      name: 'Wallet Credit',
      description: 'Add credits to operator/driver wallet',
      icon: <WalletOutlined />,
      riskLevel: 'medium',
      requiresConfirmation: false,
    },
    {
      type: 'WALLET_DEBIT',
      name: 'Wallet Debit',
      description: 'Deduct amount from wallet (penalty, correction)',
      icon: <WalletOutlined />,
      riskLevel: 'high',
      requiresConfirmation: true,
    },
    {
      type: 'POD_OVERRIDE',
      name: 'POD Mismatch Override',
      description: 'Accept disputed POD despite mismatch',
      icon: <FileTextOutlined />,
      riskLevel: 'medium',
      requiresConfirmation: false,
    },
    {
      type: 'TRUCK_VERIFICATION_OVERRIDE',
      name: 'Truck Verification Override',
      description: 'Override VAHAN verification result',
      icon: <CarOutlined />,
      riskLevel: 'high',
      requiresConfirmation: true,
    },
  ];

  const handleOpenModal = (action: OverrideAction) => {
    setSelectedAction(action);
    setModalOpen(true);
    setResourceId('');
    setOldValue('');
    setNewValue('');
    setReason('');
    setConfirmation('');
  };

  const handleExecuteOverride = async () => {
    if (!selectedAction) return;

    if (reason.length < 20) {
      message.error('Reason must be at least 20 characters');
      return;
    }

    if (selectedAction.requiresConfirmation && confirmation !== 'CONFIRM') {
      message.error('Please type "CONFIRM" to proceed with high-risk action');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call override API
      console.log('Execute override:', {
        type: selectedAction.type,
        resourceId,
        oldValue,
        newValue,
        reason,
      });

      message.success(`Override executed successfully`);
      setModalOpen(false);
    } catch (error) {
      message.error('Override failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout theme={theme} toggleTheme={toggleTheme}>
      <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
            <ThunderboltOutlined style={{ marginRight: '12px', color: '#F59E0B' }} />
            Admin Overrides
          </h1>
          <div style={{ color: textSecondary, fontSize: '14px', marginTop: '4px' }}>
            Data correction and emergency actions - All overrides audited
          </div>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title="Overrides Today"
                value={8}
                valueStyle={{ color: textPrimary }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title="Pending Approval"
                value={3}
                valueStyle={{ color: '#F59E0B' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic
                title="High-Risk Actions"
                value={2}
                valueStyle={{ color: '#EF4444' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Override Actions Grid */}
        <Row gutter={[16, 16]}>
          {overrideActions.map((action) => (
            <Col key={action.type} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                style={{ 
                  background: bgCard, 
                  border: `1px solid ${border}`,
                  borderLeft: `4px solid ${
                    action.riskLevel === 'high' ? '#EF4444' : 
                    action.riskLevel === 'medium' ? '#F59E0B' : '#10B981'
                  }`,
                }}
                onClick={() => handleOpenModal(action)}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ fontSize: '24px', color: textSecondary }}>
                    {action.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>
                      {action.name}
                    </div>
                    <div style={{ fontSize: '12px', color: textSecondary }}>
                      {action.description}
                    </div>
                  </div>
                  {action.riskLevel === 'high' && (
                    <Tag color="red" icon={<WarningOutlined />} style={{ fontSize: '10px' }}>
                      HIGH RISK
                    </Tag>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Override Execution Modal */}
        <Modal
          open={modalOpen}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectedAction?.riskLevel === 'high' && (
                <WarningOutlined style={{ color: '#EF4444' }} />
              )}
              {selectedAction?.name}
            </div>
          }
          width={600}
          onCancel={() => setModalOpen(false)}
          footer={
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                danger={selectedAction?.riskLevel === 'high'}
                onClick={handleExecuteOverride}
                loading={loading}
                disabled={
                  reason.length < 20 ||
                  (selectedAction?.requiresConfirmation && confirmation !== 'CONFIRM')
                }
              >
                Execute Override
              </Button>
            </Space>
          }
        >
          {selectedAction && (
            <div>
              {/* Warning for high-risk actions */}
              {selectedAction.riskLevel === 'high' && (
                <Alert
                  message="High-Risk Action"
                  description="This action cannot be undone. All details will be logged and audited."
                  type="error"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginBottom: '16px' }}
                />
              )}

              {/* Resource ID */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  Resource ID <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <Input
                  placeholder="e.g., LD-001, SHP-123, DL01AB1234"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                />
              </div>

              {/* Old/New Values */}
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Current Value
                  </label>
                  <Input
                    placeholder="Current value"
                    value={oldValue}
                    onChange={(e) => setOldValue(e.target.value)}
                  />
                </Col>
                <Col span={12}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    New Value <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <Input
                    placeholder="New value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </Col>
              </Row>

              {/* Reason */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  Detailed Reason <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <TextArea
                  rows={4}
                  placeholder="Enter detailed reason for this override (minimum 20 characters). This will be audited."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  showCount
                />
                {reason.length > 0 && reason.length < 20 && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                    Reason must be at least 20 characters
                  </div>
                )}
              </div>

              {/* Typed Confirmation for High-Risk */}
              {selectedAction.requiresConfirmation && (
                <div>
                  <Alert
                    message="Confirmation Required"
                    description='Type "CONFIRM" below to proceed with this high-risk action'
                    type="warning"
                    showIcon
                    style={{ marginBottom: '12px' }}
                  />
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>
                      Type CONFIRM <span style={{ color: '#ff4d4f' }}>*</span>
                    </label>
                    <Input
                      placeholder="CONFIRM"
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        borderColor: confirmation === 'CONFIRM' ? '#10B981' : undefined,
                      }}
                    />
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

export default OverridesPage;

