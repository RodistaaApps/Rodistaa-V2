/**
 * Truck Detail Page
 * 
 * Comprehensive deep-inspector UI for truck management:
 * - Summary card with compliance status and quick actions
 * - VAHAN Snapshot tab (raw JSON viewer)
 * - Inference & Confidence tab (rules, candidates, scores)
 * - Compliance History tab (timeline of decisions)
 * - Tickets tab (create, view, resolve tickets)
 * - Linked Vehicles tab (tractor-trailer relationships)
 * - Operator Details tab (quick link to operator)
 * - Audit Trail tab (all admin actions)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Card,
  Tabs,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Tag,
  Breadcrumb,
  Switch,
  Badge,
  Table,
  Progress,
} from 'antd';
import {
  ArrowLeftOutlined,
  CarOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  LinkOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UserOutlined,
  HistoryOutlined,
  CodeOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '@/components/Layout/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { ComplianceBadge } from '@/modules/fleet/components/ComplianceBadge';
import { TxnViewer } from '@/modules/fleet/components/TxnViewer';
import { AuditTimeline } from '@/modules/fleet/components/AuditTimeline';
import { ConfirmModal } from '@/modules/fleet/components/ConfirmModal';
import type { TruckDetail } from '@/modules/fleet/types';
import dayjs from 'dayjs';

const TruckDetailPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { rc } = router.query;
  const [loading, setLoading] = useState(false);
  const [truck, setTruck] = useState<TruckDetail | null>(null);
  const [activeTab, setActiveTab] = useState('snapshot');
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0A0E14' : '#F9FAFB';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  useEffect(() => {
    if (rc) {
      fetchTruckDetails();
    }
  }, [rc]);

  const fetchTruckDetails = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from /admin/trucks/:rc
      await new Promise(resolve => setTimeout(resolve, 600));

      const mockTruck: TruckDetail = {
        truckMaster: {
          rc_number: rc as string,
          operator_id: 'OP-001',
          operator_name: 'ABC Transport',
          owner_name: 'John Doe',
          owner_mobile: '+911234567890',
          tyres: 10,
          label: 'DXL',
          body_type: 'Container',
          gvw: 25000,
          model: 'Tata LPT 2518',
          manufacture_year: 2020,
          fitness_upto: '2026-12-31',
          status: 'active',
        },
        complianceDecision: {
          status: 'allowed',
          reason: null,
          blocked_by: null,
          blocked_at: null,
          last_verified_at: '2025-12-05T10:00:00Z',
          confidence_score: 95,
        },
        inferenceResult: {
          inferred_length: 32.5,
          inferred_body_type: 'Container',
          candidate_lengths: [32, 32.5, 33],
          confidence: 95,
          rules_applied: ['TYRES_TO_LENGTH', 'GVW_VALIDATION', 'BODY_TYPE_MATCH'],
          fit_score: 95,
        },
        snapshots: [
          {
            id: 1,
            provider: 'VAHAN',
            txn_id: 'VH-20251205-ABC123',
            raw_data: {
              rc_number: rc,
              owner_name: 'John Doe',
              vehicle_class: 'GOODS VEHICLE',
              maker_model: 'TATA LPT 2518',
              // ... full VAHAN response
            },
            fetched_at: '2025-12-05T10:00:00Z',
          },
        ],
        complianceHistory: [
          {
            timestamp: '2025-12-05T10:00:00Z',
            action: 'ALLOWED',
            admin_id: 'SYSTEM',
            reason: 'Auto-verification passed',
            confidence: 95,
          },
        ],
        tickets: [],
        auditLogs: [],
        linkedTrailer: null,
      };

      setTruck(mockTruck);
    } catch (error) {
      console.error('Failed to fetch truck details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !truck) {
    return (
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
          <div style={{ color: textPrimary }}>Loading truck details...</div>
        </div>
      </AdminLayout>
    );
  }

  const isBlocked = truck.complianceDecision.status === 'blocked';

  return (
    <>
      <Head>
        <title>{rc} - Truck Details - Rodistaa Admin</title>
      </Head>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div style={{ padding: '24px', background: bgPrimary, minHeight: '100vh' }}>
          {/* Breadcrumb */}
          <Breadcrumb
            style={{ marginBottom: '16px' }}
            items={[
              { title: 'Fleet Management' },
              { title: <a onClick={() => router.push('/admin/fleet/trucks')}>Trucks</a> },
              { title: rc },
            ]}
          />

          {/* Header Card */}
          <Card style={{ marginBottom: '24px', background: bgCard, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: textPrimary, margin: 0, fontFamily: 'monospace' }}>
                    {rc}
                  </h1>
                  <ComplianceBadge
                    status={truck.complianceDecision.status}
                    reason={truck.complianceDecision.reason}
                    confidence={truck.complianceDecision.confidence_score}
                  />
                  <Tag>{truck.truckMaster.label}</Tag>
                  {truck.linkedTrailer && (
                    <Badge count="Linked" style={{ backgroundColor: '#8B5CF6' }} />
                  )}
                </div>

                <div style={{ color: textSecondary, fontSize: '14px', marginBottom: '16px' }}>
                  {truck.truckMaster.model} • {truck.truckMaster.manufacture_year} • {truck.truckMaster.tyres}T
                  {' • '}
                  Operator: <a onClick={() => router.push(`/admin/operators/${truck.truckMaster.operator_id}`)}>{truck.truckMaster.operator_name}</a>
                </div>

                <Row gutter={16}>
                  <Col>
                    <Statistic
                      title="GVW"
                      value={(truck.truckMaster.gvw / 1000).toFixed(1)}
                      suffix="T"
                      valueStyle={{ fontSize: '18px', color: textPrimary }}
                    />
                  </Col>
                  <Col>
                    <Statistic
                      title="Inferred Length"
                      value={truck.inferenceResult.inferred_length}
                      suffix="ft"
                      valueStyle={{ fontSize: '18px', color: textPrimary }}
                    />
                  </Col>
                  <Col>
                    <Statistic
                      title="Fit Score"
                      value={truck.inferenceResult.fit_score}
                      valueStyle={{ 
                        fontSize: '18px', 
                        color: truck.inferenceResult.fit_score >= 90 ? '#10B981' : '#F59E0B',
                      }}
                    />
                  </Col>
                  <Col>
                    <Statistic
                      title="Last Verified"
                      value={dayjs(truck.complianceDecision.last_verified_at).fromNow()}
                      valueStyle={{ fontSize: '18px', color: textSecondary }}
                    />
                  </Col>
                </Row>
              </div>

              {/* Action Buttons */}
              <Space direction="vertical">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push('/admin/fleet/trucks')}
                >
                  Back to List
                </Button>
                {!isBlocked ? (
                  <Button
                    danger
                    icon={<StopOutlined />}
                    onClick={() => setBlockModalOpen(true)}
                  >
                    Block Truck
                  </Button>
                ) : (
                  <Button
                    icon={<CheckCircleOutlined />}
                    style={{ borderColor: '#10B981', color: '#10B981' }}
                    onClick={() => setUnblockModalOpen(true)}
                  >
                    Unblock Truck
                  </Button>
                )}
                <Button icon={<SyncOutlined />}>
                  Reverify
                </Button>
                <Button icon={<FileTextOutlined />}>
                  Create Ticket
                </Button>
                <Button icon={<DownloadOutlined />}>
                  Export Snapshot
                </Button>
              </Space>
            </div>
          </Card>

          {/* Tabs */}
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              {/* VAHAN Snapshot */}
              <Tabs.TabPane 
                tab={<span><CodeOutlined /> VAHAN Snapshot</span>} 
                key="snapshot"
              >
                {truck.snapshots.length > 0 ? (
                  <TxnViewer
                    txnId={truck.snapshots[0].txn_id}
                    provider={truck.snapshots[0].provider}
                    rawData={truck.snapshots[0].raw_data}
                    fetchedAt={truck.snapshots[0].fetched_at}
                    theme={theme}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: textSecondary }}>
                    No snapshots available
                  </div>
                )}
              </Tabs.TabPane>

              {/* Inference & Confidence */}
              <Tabs.TabPane 
                tab={<span><BarChartOutlined /> Inference & Confidence</span>} 
                key="inference"
              >
                <Card size="small" style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="Inferred Length"
                        value={truck.inferenceResult.inferred_length}
                        suffix="ft"
                        valueStyle={{ color: textPrimary }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Inferred Body Type"
                        value={truck.inferenceResult.inferred_body_type}
                        valueStyle={{ color: textPrimary }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Confidence"
                        value={truck.inferenceResult.confidence}
                        suffix="%"
                        valueStyle={{ color: truck.inferenceResult.confidence >= 90 ? '#10B981' : '#F59E0B' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Fit Score"
                        value={truck.inferenceResult.fit_score}
                        valueStyle={{ color: truck.inferenceResult.fit_score >= 90 ? '#10B981' : '#F59E0B' }}
                      />
                    </Col>
                  </Row>
                </Card>

                <Card title="Rules Applied" size="small" style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}>
                  <Space wrap>
                    {truck.inferenceResult.rules_applied.map(rule => (
                      <Tag key={rule} color="blue">{rule}</Tag>
                    ))}
                  </Space>
                </Card>

                <Card title="Candidate Lengths" size="small" style={{ background: bgCard, border: `1px solid ${border}` }}>
                  <Space>
                    {truck.inferenceResult.candidate_lengths.map((length, idx) => (
                      <Tag 
                        key={idx}
                        color={length === truck.inferenceResult.inferred_length ? 'green' : 'default'}
                      >
                        {length}ft
                      </Tag>
                    ))}
                  </Space>
                </Card>
              </Tabs.TabPane>

              {/* Compliance History */}
              <Tabs.TabPane 
                tab={<span><HistoryOutlined /> Compliance History</span>} 
                key="compliance"
              >
                <AuditTimeline
                  logs={truck.auditLogs}
                  theme={theme}
                />
              </Tabs.TabPane>

              {/* Tickets */}
              <Tabs.TabPane 
                tab={
                  <span>
                    <FileTextOutlined /> Tickets
                    {truck.tickets.length > 0 && (
                      <Badge count={truck.tickets.length} style={{ marginLeft: '8px' }} />
                    )}
                  </span>
                } 
                key="tickets"
              >
                {truck.tickets.length === 0 ? (
                  <Card style={{ background: bgCard, border: `1px solid ${border}`, textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: textSecondary }}>
                      <FileTextOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
                      <div>No tickets for this truck</div>
                      <Button 
                        type="primary" 
                        icon={<FileTextOutlined />}
                        style={{ marginTop: '16px' }}
                      >
                        Create Ticket
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div>TODO: Tickets list</div>
                )}
              </Tabs.TabPane>

              {/* Linked Vehicles */}
              <Tabs.TabPane 
                tab={<span><LinkOutlined /> Linked Vehicles</span>} 
                key="linked"
              >
                {truck.linkedTrailer ? (
                  <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
                    <div style={{ marginBottom: '16px' }}>
                      <Tag color="purple">Trailer Linked</Tag>
                    </div>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ color: textSecondary, marginBottom: '4px' }}>Tractor RC</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600, color: textPrimary }}>
                          {truck.linkedTrailer.tractor_rc}
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ color: textSecondary, marginBottom: '4px' }}>Trailer RC</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600, color: textPrimary }}>
                          {truck.linkedTrailer.trailer_rc}
                        </div>
                      </Col>
                    </Row>
                    <Button danger style={{ marginTop: '16px' }}>
                      Unlink Trailer
                    </Button>
                  </Card>
                ) : (
                  <Card style={{ background: bgCard, border: `1px solid ${border}`, textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: textSecondary }}>
                      <LinkOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
                      <div>No trailer linked</div>
                      <Button 
                        type="primary" 
                        icon={<LinkOutlined />}
                        style={{ marginTop: '16px' }}
                      >
                        Link Trailer
                      </Button>
                    </div>
                  </Card>
                )}
              </Tabs.TabPane>

              {/* Operator Details */}
              <Tabs.TabPane 
                tab={<span><UserOutlined /> Operator</span>} 
                key="operator"
              >
                <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div style={{ color: textSecondary, marginBottom: '4px' }}>Operator ID</div>
                      <div style={{ fontFamily: 'monospace', color: textPrimary }}>{truck.truckMaster.operator_id}</div>
                    </Col>
                    <Col span={12}>
                      <div style={{ color: textSecondary, marginBottom: '4px' }}>Operator Name</div>
                      <div style={{ color: textPrimary, fontWeight: 600 }}>{truck.truckMaster.operator_name}</div>
                    </Col>
                    <Col span={24}>
                      <Button 
                        type="primary"
                        icon={<UserOutlined />}
                        onClick={() => router.push(`/admin/operators/${truck.truckMaster.operator_id}`)}
                      >
                        View Operator Profile
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Tabs.TabPane>

              {/* Audit Trail */}
              <Tabs.TabPane 
                tab={<span><HistoryOutlined /> Audit Trail</span>} 
                key="audit"
              >
                <AuditTimeline
                  logs={truck.auditLogs}
                  theme={theme}
                />
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </div>

        {/* Block Modal */}
        <ConfirmModal
          open={blockModalOpen}
          title={`Block ${rc}?`}
          description="This will immediately block the truck from operations. An audit log will be created and the operator will be notified."
          actionType="block"
          requireReason={true}
          onConfirm={async (reason) => {
            // TODO: Call block API
            console.log('Block truck:', rc, reason);
            setBlockModalOpen(false);
          }}
          onCancel={() => setBlockModalOpen(false)}
          confirmText="Block Truck"
          theme={theme}
        />

        {/* Unblock Modal */}
        <ConfirmModal
          open={unblockModalOpen}
          title={`Unblock ${rc}?`}
          description="This will unblock the truck and allow it in operations."
          actionType="unblock"
          requireReason={true}
          onConfirm={async (reason) => {
            // TODO: Call unblock API
            console.log('Unblock truck:', rc, reason);
            setUnblockModalOpen(false);
          }}
          onCancel={() => setUnblockModalOpen(false)}
          confirmText="Unblock Truck"
          theme={theme}
        />
      </AdminLayout>
    </>
  );
};

export default TruckDetailPage;

