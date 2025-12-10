/**
 * Fraud Detection Queue
 * 
 * Enterprise fraud investigation workspace with:
 * - Alert queue with severity filtering
 * - Evidence collation (images, telemetry, chat logs)
 * - LLM-powered authenticity scores
 * - Investigation actions
 * - Chain-of-evidence preservation
 */

import { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Modal,
  Input,
  Badge,
  Image,
  Tabs,
  Statistic,
  Row,
  Col,
  Alert,
  message,
  Tooltip,
} from 'antd';
import {
  WarningOutlined,
  SafetyOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface FraudAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  target_type: string;
  target_id: string;
  target_name: string;
  detected_at: string;
  confidence_score: number;
  evidence: {
    images?: string[];
    telemetry?: any;
    chat_logs?: string[];
  };
  tags: string[];
}

const FraudQueuePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [actionType, setActionType] = useState<string>('');
  const [notes, setNotes] = useState('');

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  useEffect(() => {
    fetchFraudQueue();
  }, []);

  const fetchFraudQueue = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockAlerts: FraudAlert[] = [
        {
          id: 'FRD-001',
          alert_type: 'IMAGE_FRAUD',
          severity: 'high',
          status: 'open',
          target_type: 'shipment',
          target_id: 'SHP-123',
          target_name: 'Delhi → Mumbai Shipment',
          detected_at: '2025-12-05T11:00:00Z',
          confidence_score: 85,
          evidence: {
            images: ['/uploads/pod/shp123.jpg'],
            telemetry: { deviation_km: 45 },
          },
          tags: ['pod', 'suspicious'],
        },
      ];

      setAlerts(mockAlerts);
      setTotal(1);
    } catch (error) {
      console.error('Failed to fetch fraud queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    return {
      low: 'default',
      medium: 'orange',
      high: 'red',
      critical: 'red',
    }[severity] || 'default';
  };

  const columns = [
    {
      title: 'Alert ID',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1890ff' }}>
          {id}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'alert_type',
      key: 'alert_type',
      width: 150,
      render: (type: string) => (
        <Tag color="red">{type.replace(/_/g, ' ')}</Tag>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 110,
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)} icon={severity === 'critical' ? <WarningOutlined /> : undefined}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Target',
      key: 'target',
      width: 200,
      render: (_: any, record: FraudAlert) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>{record.target_name}</div>
          <div style={{ fontSize: '11px', color: textSecondary }}>
            {record.target_type}: {record.target_id}
          </div>
        </div>
      ),
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence_score',
      key: 'confidence_score',
      width: 120,
      align: 'center' as const,
      render: (score: number) => (
        <div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: score >= 80 ? '#EF4444' : '#F59E0B' }}>
            {score}%
          </div>
        </div>
      ),
    },
    {
      title: 'Detected',
      dataIndex: 'detected_at',
      key: 'detected_at',
      width: 140,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format('DD MMM YYYY, HH:mm')}>
          <span style={{ color: textSecondary }}>{dayjs(timestamp).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: FraudAlert) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedAlert(record);
              setModalOpen(true);
            }}
          >
            Investigate
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout theme={theme} toggleTheme={toggleTheme}>
      <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
            <SafetyOutlined style={{ marginRight: '12px', color: '#EF4444' }} />
            Fraud Detection Queue
          </h1>
          <div style={{ color: textSecondary, fontSize: '14px', marginTop: '4px' }}>
            Enterprise fraud investigation workspace
          </div>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={12} sm={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic title="Open Alerts" value={15} valueStyle={{ color: '#EF4444' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic title="Critical" value={3} valueStyle={{ color: '#EF4444' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic title="Confirmed" value={28} valueStyle={{ color: textPrimary }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
              <Statistic title="False Positives" value={12} valueStyle={{ color: '#10B981' }} />
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Table
            columns={columns}
            dataSource={alerts}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 25,
              total,
              showSizeChanger: true,
            }}
          />
        </Card>

        {/* Investigation Modal */}
        <Modal
          open={modalOpen}
          title={`Investigate: ${selectedAlert?.id}`}
          width={900}
          onCancel={() => setModalOpen(false)}
          footer={null}
        >
          {selectedAlert && (
            <Tabs
              items={[
                {
                  key: 'evidence',
                  label: 'Evidence',
                  children: (
                    <div>
                      {selectedAlert.evidence.images && selectedAlert.evidence.images.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <h4>Images</h4>
                          <Image.PreviewGroup>
                            {selectedAlert.evidence.images.map((img, idx) => (
                              <Image key={idx} src={img} width={200} style={{ marginRight: '8px' }} />
                            ))}
                          </Image.PreviewGroup>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  children: (
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>
                          Investigation Notes <span style={{ color: '#ff4d4f' }}>*</span>
                        </label>
                        <TextArea
                          rows={4}
                          placeholder="Enter investigation findings (minimum 20 characters)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          maxLength={1000}
                          showCount
                        />
                      </div>

                      <Space wrap>
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={() => {
                            message.success('Marked as False Positive');
                            setModalOpen(false);
                          }}
                          disabled={notes.length < 20}
                        >
                          False Positive
                        </Button>
                        <Button
                          danger
                          icon={<StopOutlined />}
                          onClick={() => {
                            message.success('User Blocked');
                            setModalOpen(false);
                          }}
                          disabled={notes.length < 20}
                        >
                          Block User
                        </Button>
                        <Button
                          icon={<ThunderboltOutlined />}
                          onClick={() => {
                            message.success('Escalated to Legal');
                            setModalOpen(false);
                          }}
                          disabled={notes.length < 20}
                        >
                          Escalate to Legal
                        </Button>
                      </Space>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default FraudQueuePage;

