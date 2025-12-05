/**
 * KYC Approval Queue
 * 
 * Central KYC approval system where admin approves ALL verifications.
 * Franchises DO NOT perform verification - everything goes through HQ.
 * 
 * Features:
 * - Pending KYC queue with priority sorting
 * - Document viewer with zoom/download
 * - Batch approve/reject with validation report
 * - PII viewing with mandatory reason entry
 * - Duplicate detection warnings
 * - LLM authenticity scores
 * - Revoke and re-trigger KYC
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
  Select,
  Badge,
  Image,
  Tooltip,
  message,
  Alert,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  WarningOutlined,
  FileTextOutlined,
  UserOutlined,
  SafetyOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;

interface KYCItem {
  id: number;
  user_id: string;
  user_name: string;
  user_type: 'operator' | 'driver' | 'shipper';
  kyc_type: 'aadhar' | 'pan' | 'dl' | 'rc' | 'gst' | 'business_proof';
  document_url: string;
  document_hash: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  metadata: {
    ocr_confidence?: number;
    llm_authenticity_score?: number;
    duplicate_count?: number;
  };
  priority: number;
}

const KYCQueuePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [kycItems, setKYCItems] = useState<KYCItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState<KYCItem | null>(null);
  const [piiReason, setPIIReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [filters, setFilters] = useState({
    status: 'pending',
    userType: undefined,
    kycType: undefined,
    page: 1,
    limit: 25,
  });

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  useEffect(() => {
    fetchKYCQueue();
  }, [filters]);

  const fetchKYCQueue = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from /admin/kyc/queue
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockItems: KYCItem[] = [
        {
          id: 1,
          user_id: 'OP-001',
          user_name: 'ABC Transport',
          user_type: 'operator',
          kyc_type: 'gst',
          document_url: '/uploads/kyc/gst-op001.pdf',
          document_hash: 'abc123',
          status: 'pending',
          submitted_at: '2025-12-05T09:00:00Z',
          reviewed_by: null,
          reviewed_at: null,
          rejection_reason: null,
          metadata: {
            ocr_confidence: 95,
            llm_authenticity_score: 92,
            duplicate_count: 0,
          },
          priority: 1,
        },
        {
          id: 2,
          user_id: 'DR-001',
          user_name: 'Ramesh Kumar',
          user_type: 'driver',
          kyc_type: 'dl',
          document_url: '/uploads/kyc/dl-dr001.jpg',
          document_hash: 'def456',
          status: 'pending',
          submitted_at: '2025-12-05T10:30:00Z',
          reviewed_by: null,
          reviewed_at: null,
          rejection_reason: null,
          metadata: {
            ocr_confidence: 88,
            llm_authenticity_score: 76,
            duplicate_count: 1, // Duplicate detected!
          },
          priority: 2,
        },
      ];

      setKYCItems(mockItems);
      setTotal(mockItems.length);
    } catch (error) {
      console.error('Failed to fetch KYC queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (item: KYCItem) => {
    setSelectedKYC(item);
    setViewModalOpen(true);
    setPIIReason('');
  };

  const handleAction = async (type: 'approve' | 'reject') => {
    if (!selectedKYC) return;

    if (type === 'reject' && !rejectionReason.trim()) {
      message.error('Rejection reason is required');
      return;
    }

    try {
      // TODO: Call API
      console.log(`${type} KYC:`, selectedKYC.id, {
        notes: actionNotes,
        rejectionReason: type === 'reject' ? rejectionReason : undefined,
        piiReason,
      });

      message.success(`KYC ${type}d successfully`);
      setViewModalOpen(false);
      setActionType(null);
      setActionNotes('');
      setRejectionReason('');
      setPIIReason('');
      fetchKYCQueue();
    } catch (error) {
      message.error(`Failed to ${type} KYC`);
    }
  };

  const handleBatchAction = async (type: 'approve' | 'reject') => {
    if (selectedRowKeys.length === 0) return;

    if (type === 'reject' && !rejectionReason.trim()) {
      message.error('Rejection reason is required for batch rejection');
      return;
    }

    try {
      // TODO: Call batch API
      console.log(`Batch ${type}:`, selectedRowKeys, {
        notes: actionNotes,
        rejectionReason: type === 'reject' ? rejectionReason : undefined,
      });

      message.success(`${selectedRowKeys.length} KYC items ${type}d successfully`);
      setSelectedRowKeys([]);
      setActionNotes('');
      setRejectionReason('');
      fetchKYCQueue();
    } catch (error) {
      message.error(`Batch ${type} failed`);
    }
  };

  const getUserTypeColor = (type: string) => {
    return { operator: 'green', driver: 'orange', shipper: 'blue' }[type] || 'default';
  };

  const getKYCTypeIcon = (type: string) => {
    const icons = {
      aadhar: <SafetyOutlined />,
      pan: <FileTextOutlined />,
      dl: <CarOutlined />,
      rc: <CarOutlined />,
      gst: <FileTextOutlined />,
      business_proof: <FileTextOutlined />,
    };
    return icons[type as keyof typeof icons] || <FileTextOutlined />;
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_: any, record: KYCItem) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <UserOutlined style={{ color: textSecondary }} />
            <span style={{ fontWeight: 600, color: textPrimary }}>{record.user_name}</span>
          </div>
          <div style={{ fontSize: '11px', color: textSecondary }}>
            <Tag color={getUserTypeColor(record.user_type)} style={{ fontSize: '10px' }}>
              {record.user_type.toUpperCase()}
            </Tag>
            <span style={{ fontFamily: 'monospace', marginLeft: '4px' }}>{record.user_id}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'KYC Type',
      dataIndex: 'kyc_type',
      key: 'kyc_type',
      width: 120,
      render: (type: string) => (
        <Tag icon={getKYCTypeIcon(type)} color="blue">
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      width: 140,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format('DD MMM YYYY, HH:mm')}>
          <span style={{ color: textSecondary }}>{dayjs(timestamp).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Authenticity',
      key: 'authenticity',
      width: 140,
      render: (_: any, record: KYCItem) => {
        const score = record.metadata.llm_authenticity_score;
        if (!score) return <span style={{ color: textSecondary }}>—</span>;

        const color = score >= 90 ? '#10B981' : score >= 75 ? '#F59E0B' : '#EF4444';
        return (
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color }}>{score}</div>
            <div style={{ fontSize: '11px', color: textSecondary }}>
              {score >= 90 ? 'High' : score >= 75 ? 'Medium' : 'Low'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Alerts',
      key: 'alerts',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: KYCItem) => {
        const duplicates = record.metadata.duplicate_count || 0;
        return duplicates > 0 ? (
          <Tooltip title={`${duplicates} duplicate document(s) found`}>
            <Badge count={duplicates} style={{ backgroundColor: '#EF4444' }}>
              <WarningOutlined style={{ color: '#EF4444', fontSize: '18px' }} />
            </Badge>
          </Tooltip>
        ) : (
          <span style={{ color: textSecondary }}>—</span>
        );
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 90,
      align: 'center' as const,
      render: (priority: number) => (
        <Tag color={priority === 1 ? 'red' : priority <= 3 ? 'orange' : 'default'}>
          P{priority}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      fixed: 'right' as const,
      render: (_: any, record: KYCItem) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDocument(record)}
          >
            View
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              setSelectedKYC(record);
              setActionType('approve');
            }}
          >
            Approve
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => {
              setSelectedKYC(record);
              setActionType('reject');
            }}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout theme={theme} toggleTheme={toggleTheme}>
      <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
            <SafetyOutlined style={{ marginRight: '12px' }} />
            KYC Approval Queue
          </h1>
          <div style={{ color: textSecondary, fontSize: '14px', marginTop: '4px' }}>
            Central verification - Admin approves ALL KYC documents
          </div>
        </div>

        {/* Stats */}
        <Card style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}>
          <Space size="large">
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>{total}</div>
              <div style={{ fontSize: '12px', color: textSecondary }}>Pending Review</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>156</div>
              <div style={{ fontSize: '12px', color: textSecondary }}>Approved Today</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>8</div>
              <div style={{ fontSize: '12px', color: textSecondary }}>Rejected Today</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: textPrimary }}>4.5h</div>
              <div style={{ fontSize: '12px', color: textSecondary }}>Avg Review Time</div>
            </div>
          </Space>
        </Card>

        {/* Filters */}
        <Card style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}>
          <Space wrap>
            <Select
              placeholder="Status"
              style={{ width: 140 }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
              ]}
            />
            <Select
              placeholder="User Type"
              style={{ width: 140 }}
              allowClear
              value={filters.userType}
              onChange={(value) => setFilters(prev => ({ ...prev, userType: value, page: 1 }))}
              options={[
                { label: 'Operator', value: 'operator' },
                { label: 'Driver', value: 'driver' },
                { label: 'Shipper', value: 'shipper' },
              ]}
            />
            <Select
              placeholder="KYC Type"
              style={{ width: 160 }}
              allowClear
              value={filters.kycType}
              onChange={(value) => setFilters(prev => ({ ...prev, kycType: value, page: 1 }))}
              options={[
                { label: 'Aadhar', value: 'aadhar' },
                { label: 'PAN', value: 'pan' },
                { label: 'Driving License', value: 'dl' },
                { label: 'GST Certificate', value: 'gst' },
                { label: 'Business Proof', value: 'business_proof' },
              ]}
            />
          </Space>
        </Card>

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <Card style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge count={selectedRowKeys.length} style={{ backgroundColor: '#3B82F6' }}>
                <span style={{ color: textPrimary, fontWeight: 600, paddingRight: '20px' }}>
                  Selected
                </span>
              </Badge>
              <Space>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleBatchAction('approve')}
                >
                  Batch Approve ({selectedRowKeys.length})
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleBatchAction('reject')}
                >
                  Batch Reject ({selectedRowKeys.length})
                </Button>
                <Button onClick={() => setSelectedRowKeys([])}>
                  Clear Selection
                </Button>
              </Space>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Table
            columns={columns}
            dataSource={kycItems}
            rowKey="id"
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys as number[]),
            }}
            pagination={{
              current: filters.page,
              pageSize: filters.limit,
              total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100'],
              showTotal: (total) => `Total ${total} KYC items`,
            }}
            onChange={(pagination) => {
              setFilters(prev => ({
                ...prev,
                page: pagination.current || 1,
                limit: pagination.pageSize || 25,
              }));
            }}
          />
        </Card>

        {/* Document Viewer Modal */}
        <Modal
          open={viewModalOpen}
          title={`${selectedKYC?.kyc_type.toUpperCase()} - ${selectedKYC?.user_name}`}
          width={800}
          onCancel={() => {
            setViewModalOpen(false);
            setPIIReason('');
          }}
          footer={null}
        >
          {selectedKYC && (
            <div>
              {/* PII Access Warning */}
              {!piiReason && (
                <Alert
                  message="PII Access Required"
                  description="You must provide a reason to view this document (contains PII)"
                  type="warning"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              {/* Reason Input */}
              {!piiReason ? (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Reason for viewing PII <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <Input
                    placeholder="Enter reason for accessing PII (will be audited)"
                    value={piiReason}
                    onChange={(e) => setPIIReason(e.target.value)}
                    onPressEnter={() => {
                      if (piiReason.length >= 10) {
                        // Log PII access
                        console.log('PII Access:', {
                          kycId: selectedKYC.id,
                          userId: selectedKYC.user_id,
                          reason: piiReason,
                        });
                      }
                    }}
                  />
                  <Button
                    type="primary"
                    style={{ marginTop: '12px' }}
                    disabled={piiReason.length < 10}
                    onClick={() => {
                      // TODO: Log PII access
                      message.success('Access logged. Document viewable.');
                    }}
                  >
                    Access Document
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Metadata */}
                  <Card size="small" style={{ marginBottom: '16px' }}>
                    <Space wrap>
                      {selectedKYC.metadata.llm_authenticity_score && (
                        <div>
                          <span style={{ color: textSecondary, fontSize: '12px' }}>LLM Score: </span>
                          <span style={{ fontWeight: 600, color: selectedKYC.metadata.llm_authenticity_score >= 90 ? '#10B981' : '#F59E0B' }}>
                            {selectedKYC.metadata.llm_authenticity_score}%
                          </span>
                        </div>
                      )}
                      {selectedKYC.metadata.duplicate_count && selectedKYC.metadata.duplicate_count > 0 && (
                        <Tag color="red" icon={<WarningOutlined />}>
                          {selectedKYC.metadata.duplicate_count} Duplicate(s)
                        </Tag>
                      )}
                    </Space>
                  </Card>

                  {/* Document Image/PDF */}
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <Image
                      src={selectedKYC.document_url}
                      alt={selectedKYC.kyc_type}
                      style={{ maxWidth: '100%', maxHeight: '500px' }}
                      fallback="/placeholder-document.png"
                    />
                  </div>

                  {/* Actions */}
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button icon={<DownloadOutlined />}>
                      Download
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => setActionType('approve')}
                    >
                      Approve
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => setActionType('reject')}
                    >
                      Reject
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Approve/Reject Confirmation Modal */}
        <Modal
          open={actionType !== null}
          title={actionType === 'approve' ? 'Approve KYC' : 'Reject KYC'}
          onCancel={() => {
            setActionType(null);
            setActionNotes('');
            setRejectionReason('');
          }}
          footer={
            <Space>
              <Button onClick={() => setActionType(null)}>Cancel</Button>
              <Button
                type={actionType === 'approve' ? 'primary' : 'default'}
                danger={actionType === 'reject'}
                onClick={() => actionType && handleAction(actionType)}
                disabled={actionType === 'reject' && rejectionReason.length < 20}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </Space>
          }
        >
          {actionType === 'reject' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                Rejection Reason <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <TextArea
                rows={3}
                placeholder="Enter detailed reason for rejection (minimum 20 characters)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                maxLength={500}
                showCount
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Review Notes (optional)
            </label>
            <TextArea
              rows={2}
              placeholder="Additional notes for internal record"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              maxLength={500}
            />
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default KYCQueuePage;

