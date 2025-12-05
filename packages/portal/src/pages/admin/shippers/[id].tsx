import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Button,
  Tabs,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Card,
  Badge,
  Breadcrumb,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  BookOutlined,
  TruckOutlined,
  WalletOutlined,
  FileTextOutlined,
  MessageOutlined,
  HistoryOutlined,
  WarningOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { ShipperDetail } from "@/modules/shippers/types";
import { OverviewTab } from "@/modules/shippers/tabs/OverviewTab";
import { BookingsTab } from "@/modules/shippers/tabs/BookingsTab";
import { ShipmentsTab } from "@/modules/shippers/tabs/ShipmentsTab";
import { LedgerTab } from "@/modules/shippers/tabs/LedgerTab";
import { DocumentsTab } from "@/modules/shippers/tabs/DocumentsTab";
import { MessagesTab } from "@/modules/shippers/tabs/MessagesTab";
import { ActivityTab } from "@/modules/shippers/tabs/ActivityTab";
import { ACSTab } from "@/modules/shippers/tabs/ACSTab";
import { AdminActionsTab } from "@/modules/shippers/tabs/AdminActionsTab";

const ShipperDetailPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [shipper, setShipper] = useState<ShipperDetail | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const isDark = theme === "dark";
  const bgPrimary = isDark ? "#0A0E14" : "#F9FAFB";
  const bgCard = isDark ? "#151922" : "#FFFFFF";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0E14";
  const textSecondary = isDark ? "#B4B9C5" : "#6B7280";
  const border = isDark ? "#2D3748" : "#E5E7EB";

  useEffect(() => {
    if (id) {
      fetchShipperDetails();
    }
  }, [id]);

  const fetchShipperDetails = async () => {
    setLoading(true);
    try {
      // Mock data for development
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockShipper: ShipperDetail = {
        id: id as string,
        role: "shipper",
        name: "Rohit Sharma",
        mobile: "+911234561234",
        email: "rohit.sharma@example.com",
        aadhar_name: "Rohit Kumar Sharma",
        aadhar_number: "1234-5678-9012",
        address: {
          line1: "Plot 45, Sector 12",
          line2: "MG Road",
          city: "Vijayawada",
          state: "Andhra Pradesh",
          pincode: "520001",
        },
        franchise: "Vijayawada – Unit 2",
        city: "Vijayawada",
        state: "Andhra Pradesh",
        kyc_status: "verified",
        trust_score: 86,
        ledger_balance: 12500.5,
        credit_limit: 50000,
        last_active: "2025-12-04T09:34:00Z",
        metrics: {
          bookings: 12,
          completed_shipments: 10,
          open_shipments: 3,
        },
        bookings: {
          total: 12,
          items: [],
        },
        shipments: {
          total: 13,
          items: [],
        },
        ledger: {
          balance: 12500.5,
        },
        acs_flags: [],
        recent_activities: [],
        documents: [],
        acs_flags_count: 0,
        created_at: "2024-06-15T10:00:00Z",
      };

      setShipper(mockShipper);
    } catch (error) {
      console.error("Failed to fetch shipper:", error);
    } finally {
      setLoading(false);
    }
  };

  const getKYCStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      verified: "green",
      pending: "orange",
      rejected: "red",
      incomplete: "default",
    };
    return colors[status] || "default";
  };

  if (loading || !shipper) {
    return (
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div
          style={{ padding: "24px", background: bgPrimary, minHeight: "100vh" }}
        >
          <div style={{ color: textPrimary }}>Loading shipper details...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{shipper.name} - Shipper Details - Rodistaa Admin</title>
      </Head>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div
          style={{ padding: "24px", background: bgPrimary, minHeight: "100vh" }}
        >
          {/* Breadcrumb */}
          <Breadcrumb
            style={{ marginBottom: "16px" }}
            items={[
              { title: "User Management" },
              {
                title: (
                  <a onClick={() => router.push("/admin/shippers")}>Shippers</a>
                ),
              },
              { title: shipper.name },
            ]}
          />

          {/* Header */}
          <Card
            style={{
              marginBottom: "24px",
              background: bgCard,
              border: `1px solid ${border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "#C90D0D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {shipper.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <h1
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: textPrimary,
                        margin: 0,
                      }}
                    >
                      {shipper.name}
                    </h1>
                    <Tag color="blue">Shipper</Tag>
                    <Tag color={getKYCStatusColor(shipper.kyc_status)}>
                      {shipper.kyc_status.toUpperCase()}
                    </Tag>
                    {shipper.acs_flags_count > 0 && (
                      <Badge
                        count={shipper.acs_flags_count}
                        style={{ backgroundColor: "#EF4444" }}
                      >
                        <WarningOutlined
                          style={{ color: "#EF4444", fontSize: "18px" }}
                        />
                      </Badge>
                    )}
                  </div>

                  <div style={{ color: textSecondary, fontSize: "14px" }}>
                    <span style={{ fontFamily: "monospace" }}>
                      {shipper.id}
                    </span>
                    {" • "}
                    <span>{shipper.mobile}</span>
                    {" • "}
                    <span>{shipper.email}</span>
                  </div>

                  <Row gutter={16} style={{ marginTop: "16px" }}>
                    <Col>
                      <Statistic
                        title="Total Bookings"
                        value={shipper.metrics.total_bookings}
                        valueStyle={{ fontSize: "20px", color: textPrimary }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Active Bookings"
                        value={shipper.metrics.active_bookings}
                        valueStyle={{ fontSize: "20px", color: "#F59E0B" }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Completed Shipments"
                        value={shipper.metrics.completed_shipments}
                        valueStyle={{ fontSize: "20px", color: "#10B981" }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Ledger Balance"
                        value={`₹${shipper.ledger_balance.toLocaleString("en-IN")}`}
                        valueStyle={{
                          fontSize: "20px",
                          color:
                            shipper.ledger_balance < 0 ? "#EF4444" : "#10B981",
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              </div>

              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push("/admin/shippers")}
                size="large"
              >
                Back to List
              </Button>
            </div>
          </Card>

          {/* Tabs */}
          <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <Tabs.TabPane
                tab={
                  <span>
                    <UserOutlined /> Overview
                  </span>
                }
                key="overview"
              >
                <OverviewTab shipper={shipper} theme={theme} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span>
                    <BookOutlined /> Bookings
                  </span>
                }
                key="bookings"
              >
                <BookingsTab shipperId={shipper.id} theme={theme} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span>
                    <TruckOutlined /> Shipments
                  </span>
                }
                key="shipments"
              >
                <ShipmentsTab shipperId={shipper.id} theme={theme} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span>
                    <WalletOutlined /> Ledger / Finance
                  </span>
                }
                key="ledger"
              >
                <LedgerTab shipperId={shipper.id} theme={theme} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span>
                    <FileTextOutlined /> Documents
                  </span>
                }
                key="documents"
              >
                <DocumentsTab shipperId={shipper.id} theme={theme} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span>
                    <MessageOutlined /> Messages
                  </span>
                }
                key="messages"
              >
                <MessagesTab shipperId={shipper.id} theme={theme} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span>
                    <HistoryOutlined /> Activity & Audit
                  </span>
                }
                key="activity"
              >
                <ActivityTab shipperId={shipper.id} theme={theme} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span>
                    <WarningOutlined /> ACS / Risk
                  </span>
                }
                key="acs"
              >
                <ACSTab shipperId={shipper.id} theme={theme} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span>
                    <SettingOutlined /> Admin Actions
                  </span>
                }
                key="admin-actions"
              >
                <AdminActionsTab shipperId={shipper.id} theme={theme} />
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  };
};

export default ShipperDetailPage;
