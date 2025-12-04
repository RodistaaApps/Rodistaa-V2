/**
 * Overview Tab - Shipper Detail
 * Shows key metrics, stats, trust score, and quick summary
 */

import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Space,
  Tooltip,
  Badge,
} from "antd";
import {
  BookOutlined,
  TruckOutlined,
  StarOutlined,
  WalletOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  MobileOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import type { ShipperDetail } from "../types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface OverviewTabProps {
  shipper: ShipperDetail;
  theme?: "light" | "dark";
}

export function OverviewTab({ shipper, theme = "dark" }: OverviewTabProps) {
  const isDark = theme === "dark";
  const bgCard = isDark ? "#151922" : "#FFFFFF";
  const bgElevated = isDark ? "#1E2430" : "#F3F4F6";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0E14";
  const textSecondary = isDark ? "#B4B9C5" : "#6B7280";
  const border = isDark ? "#2D3748" : "#E5E7EB";

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "#10B981";
    if (score >= 75) return "#3B82F6";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const formatLastActive = (timestamp: string) => {
    return dayjs(timestamp).fromNow();
  };

  return (
    <div style={{ padding: "24px 0" }}>
      {/* Header Card with Key Info */}
      <Card
        style={{
          marginBottom: "24px",
          background: bgCard,
          border: `1px solid ${border}`,
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "16px" }}>
                <Progress
                  type="circle"
                  percent={shipper.trust_score}
                  strokeColor={getTrustScoreColor(shipper.trust_score)}
                  format={(percent) => (
                    <div>
                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: "bold",
                          color: textPrimary,
                        }}
                      >
                        {percent}
                      </div>
                      <div style={{ fontSize: "12px", color: textSecondary }}>
                        Trust Score
                      </div>
                    </div>
                  )}
                  width={120}
                />
              </div>
              <div style={{ color: textSecondary, fontSize: "13px" }}>
                {shipper.trust_score >= 90 && "🌟 Excellent"}
                {shipper.trust_score >= 75 &&
                  shipper.trust_score < 90 &&
                  "✅ Good"}
                {shipper.trust_score >= 60 &&
                  shipper.trust_score < 75 &&
                  "⚠️ Fair"}
                {shipper.trust_score < 60 && "❌ Needs Improvement"}
              </div>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div
                  style={{
                    marginBottom: "8px",
                    color: textSecondary,
                    fontSize: "12px",
                  }}
                >
                  Email
                </div>
                <div style={{ color: textPrimary, fontWeight: 500 }}>
                  {shipper.email || "—"}
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    marginBottom: "8px",
                    color: textSecondary,
                    fontSize: "12px",
                  }}
                >
                  Mobile
                </div>
                <div style={{ color: textPrimary, fontWeight: 500 }}>
                  <MobileOutlined style={{ marginRight: "8px" }} />
                  {shipper.mobile}
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    marginBottom: "8px",
                    color: textSecondary,
                    fontSize: "12px",
                  }}
                >
                  Location
                </div>
                <div style={{ color: textPrimary, fontWeight: 500 }}>
                  <EnvironmentOutlined style={{ marginRight: "8px" }} />
                  {shipper.city}, {shipper.state}
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    marginBottom: "8px",
                    color: textSecondary,
                    fontSize: "12px",
                  }}
                >
                  Franchise
                </div>
                <div>
                  <Tag color="blue">{shipper.franchise}</Tag>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* ACS Flags Alert */}
        {shipper.acs_flags && shipper.acs_flags.length > 0 && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              background: "#EF444420",
              border: "1px solid #EF4444",
              borderRadius: "8px",
            }}
          >
            <Space>
              <WarningOutlined style={{ color: "#EF4444", fontSize: "20px" }} />
              <div>
                <div
                  style={{
                    color: textPrimary,
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  {shipper.acs_flags.length} Active ACS Flag
                  {shipper.acs_flags.length > 1 ? "s" : ""}
                </div>
                <div style={{ color: textSecondary, fontSize: "13px" }}>
                  {shipper.acs_flags[0]?.summary}
                  {shipper.acs_flags.length > 1 &&
                    ` and ${shipper.acs_flags.length - 1} more...`}
                </div>
              </div>
            </Space>
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={12} md={6}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={
                <span style={{ color: textSecondary }}>Active Bookings</span>
              }
              value={shipper.metrics.open_shipments || 0}
              prefix={<BookOutlined style={{ color: "#3B82F6" }} />}
              valueStyle={{ color: textPrimary, fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={
                <span style={{ color: textSecondary }}>Completed (30d)</span>
              }
              value={shipper.metrics.completed_shipments}
              prefix={<TruckOutlined style={{ color: "#10B981" }} />}
              valueStyle={{ color: textPrimary, fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={<span style={{ color: textSecondary }}>Avg Rating</span>}
              value={4.5}
              suffix="/ 5"
              prefix={<StarOutlined style={{ color: "#F59E0B" }} />}
              valueStyle={{ color: textPrimary, fontWeight: "bold" }}
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Statistic
              title={
                <span style={{ color: textSecondary }}>Ledger Balance</span>
              }
              value={shipper.ledger_balance}
              prefix="₹"
              valueStyle={{
                color: shipper.ledger_balance < 0 ? "#EF4444" : "#10B981",
                fontWeight: "bold",
              }}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Activity Summary */}
      <Card
        title={<span style={{ color: textPrimary }}>Recent Activity</span>}
        style={{
          marginBottom: "24px",
          background: bgCard,
          border: `1px solid ${border}`,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div
              style={{
                marginBottom: "8px",
                color: textSecondary,
                fontSize: "12px",
              }}
            >
              Last Active
            </div>
            <div style={{ color: textPrimary, fontWeight: 500 }}>
              <ClockCircleOutlined style={{ marginRight: "8px" }} />
              <Tooltip
                title={dayjs(shipper.last_active).format("DD MMM YYYY, HH:mm")}
              >
                {formatLastActive(shipper.last_active)}
              </Tooltip>
            </div>
          </Col>
          <Col span={12}>
            <div
              style={{
                marginBottom: "8px",
                color: textSecondary,
                fontSize: "12px",
              }}
            >
              Last Login Device
            </div>
            <div style={{ color: textPrimary, fontWeight: 500 }}>
              📱 Android App • IP: 103.x.x.x
            </div>
          </Col>
          <Col span={12}>
            <div
              style={{
                marginBottom: "8px",
                color: textSecondary,
                fontSize: "12px",
              }}
            >
              Total Bookings
            </div>
            <div
              style={{ color: textPrimary, fontWeight: 600, fontSize: "18px" }}
            >
              {shipper.bookings.total}
            </div>
          </Col>
          <Col span={12}>
            <div
              style={{
                marginBottom: "8px",
                color: textSecondary,
                fontSize: "12px",
              }}
            >
              Total Shipments
            </div>
            <div
              style={{ color: textPrimary, fontWeight: 600, fontSize: "18px" }}
            >
              {shipper.shipments.total}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Performance Metrics */}
      <Card
        title={<span style={{ color: textPrimary }}>Performance Metrics</span>}
        style={{ background: bgCard, border: `1px solid ${border}` }}
      >
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <div
              style={{
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: textSecondary }}>On-Time Booking Rate</span>
              <span style={{ color: textPrimary, fontWeight: 600 }}>92%</span>
            </div>
            <Progress percent={92} strokeColor="#10B981" showInfo={false} />
          </Col>
          <Col span={24}>
            <div
              style={{
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: textSecondary }}>Payment Reliability</span>
              <span style={{ color: textPrimary, fontWeight: 600 }}>88%</span>
            </div>
            <Progress percent={88} strokeColor="#3B82F6" showInfo={false} />
          </Col>
          <Col span={24}>
            <div
              style={{
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: textSecondary }}>
                Booking Completion Rate
              </span>
              <span style={{ color: textPrimary, fontWeight: 600 }}>95%</span>
            </div>
            <Progress percent={95} strokeColor="#10B981" showInfo={false} />
          </Col>
        </Row>
      </Card>
    </div>
  );
}
