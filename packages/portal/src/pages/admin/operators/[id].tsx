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
  CarOutlined,
  DollarOutlined,
  TruckOutlined,
  TeamOutlined,
  SafetyOutlined,
  WalletOutlined,
  FileTextOutlined,
  HistoryOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { OperatorDetail } from "@/modules/operators/types";
import { OverviewTab } from "@/modules/operators/tabs/OverviewTab";
import { TrucksTab } from "@/modules/operators/tabs/TrucksTab";
import { BidsTab } from "@/modules/operators/tabs/BidsTab";
import { ShipmentsTab } from "@/modules/operators/tabs/ShipmentsTab";
import { DriversTab } from "@/modules/operators/tabs/DriversTab";
import { InspectionsTab } from "@/modules/operators/tabs/InspectionsTab";
import { LedgerTab } from "@/modules/operators/tabs/LedgerTab";
import { DocumentsTab } from "@/modules/operators/tabs/DocumentsTab";
import { ActivityTab } from "@/modules/operators/tabs/ActivityTab";
import { ACSTab } from "@/modules/operators/tabs/ACSTab";

const OperatorDetailPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [operator, setOperator] = useState<OperatorDetail | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const isDark = theme === "dark";
  const bgPrimary = isDark ? "#0A0E14" : "#F9FAFB";
  const bgCard = isDark ? "#151922" : "#FFFFFF";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0E14";
  const textSecondary = isDark ? "#B4B9C5" : "#6B7280";
  const border = isDark ? "#2D3748" : "#E5E7EB";

  useEffect(() => {
    if (id) {
      fetchOperatorDetails();
    }
  }, [id]);

  const fetchOperatorDetails = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockOperator: OperatorDetail = {
        id: id as string,
        role: "operator",
        name: "Rajesh Transport Co.",
        mobile: "+919876543210",
        email: "rajesh.transport@example.com",
        aadhar_name: "Rajesh Kumar",
        aadhar_number: "9876-5432-1098",
        address: {
          line1: "Transport Nagar, Bay 12",
          line2: "NH-16 Highway",
          city: "Guntur",
          state: "Andhra Pradesh",
          pincode: "522001",
        },
        franchise: "Guntur – HQ",
        city: "Guntur",
        state: "Andhra Pradesh",
        kyc_status: "verified",
        trust_score: 92,
        ledger_balance: 45000.0,
        credit_limit: 100000,
        last_active: "2025-12-04T10:15:00Z",
        trucks: { total: 15, active: 12, blocked: 0 },
        active_bids: 4,
        pending_inspections: 2,
        metrics: {
          trucks: { total: 15, active: 12, blocked: 0 },
          active_bids: 4,
          completed_shipments: 156,
        },
        trucks_list: {
          total: 15,
          items: [],
        },
        bids: {
          total: 45,
          items: [],
        },
        shipments: {
          total: 164,
          items: [],
        },
        drivers: {
          total: 18,
          items: [],
        },
        inspections: {
          pending: 2,
          items: [],
        },
        ledger: {
          balance: 45000.0,
        },
        acs_flags: [],
        recent_activities: [],
        documents: [],
        acs_flags_count: 0,
        created_at: "2023-03-20T08:00:00Z",
      };

      setOperator(mockOperator);
    } catch (error) {
      console.error("Failed to fetch operator:", error);
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

  if (loading || !operator) {
    return (
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div
          style={{ padding: "24px", background: bgPrimary, minHeight: "100vh" }}
        >
          <div style={{ color: textPrimary }}>Loading operator details...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{operator.name} - Operator Details - Rodistaa Admin</title>
      </Head>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div
          style={{ padding: "24px", background: bgPrimary, minHeight: "100vh" }}
        >
          <Breadcrumb
            style={{ marginBottom: "16px" }}
            items={[
              { title: "User Management" },
              {
                title: (
                  <a onClick={() => router.push("/admin/operators")}>
                    Operators
                  </a>
                ),
              },
              { title: operator.name },
            ]}
          />

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
                    background: "#10B981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {operator.name.charAt(0).toUpperCase()}
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
                      {operator.name}
                    </h1>
                    <Tag color="green">Operator</Tag>
                    <Tag color={getKYCStatusColor(operator.kyc_status)}>
                      {operator.kyc_status.toUpperCase()}
                    </Tag>
                  </div>

                  <div style={{ color: textSecondary, fontSize: "14px" }}>
                    <span style={{ fontFamily: "monospace" }}>
                      {operator.id}
                    </span>
                    {" • "}
                    <span>{operator.mobile}</span>
                    {" • "}
                    <span>{operator.email}</span>
                  </div>

                  <Row gutter={16} style={{ marginTop: "16px" }}>
                    <Col>
                      <Statistic
                        title="Total Trucks"
                        value={operator.metrics.total_trucks}
                        valueStyle={{ fontSize: "20px", color: textPrimary }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Active Shipments"
                        value={operator.metrics.active_shipments}
                        valueStyle={{ fontSize: "20px", color: "#F59E0B" }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Won Bids"
                        value={operator.metrics.won_bids}
                        valueStyle={{ fontSize: "20px", color: "#10B981" }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Ledger Balance"
                        value={`₹${operator.ledger_balance.toLocaleString("en-IN")}`}
                        valueStyle={{
                          fontSize: "20px",
                          color:
                            operator.ledger_balance < 0 ? "#EF4444" : "#10B981",
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              </div>

              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push("/admin/operators")}
                size="large"
              >
                Back to List
              </Button>
            </div>
          </Card>

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
                <OverviewTab operator={operator} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <CarOutlined /> Trucks
                  </span>
                }
                key="trucks"
              >
                <TrucksTab operatorId={operator.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <DollarOutlined /> Bids
                  </span>
                }
                key="bids"
              >
                <BidsTab operatorId={operator.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <TruckOutlined /> Shipments
                  </span>
                }
                key="shipments"
              >
                <ShipmentsTab operatorId={operator.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <TeamOutlined /> Drivers
                  </span>
                }
                key="drivers"
              >
                <DriversTab operatorId={operator.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <SafetyOutlined /> Inspections
                  </span>
                }
                key="inspections"
              >
                <InspectionsTab operatorId={operator.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <WalletOutlined /> Ledger / Finance
                  </span>
                }
                key="ledger"
              >
                <LedgerTab operatorId={operator.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <FileTextOutlined /> Documents
                  </span>
                }
                key="documents"
              >
                <DocumentsTab operatorId={operator.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <HistoryOutlined /> Activity & Audit
                  </span>
                }
                key="activity"
              >
                <ActivityTab operatorId={operator.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <WarningOutlined /> ACS / Risk
                  </span>
                }
                key="acs"
              >
                <ACSTab operatorId={operator.id} theme={theme} />
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

export default OperatorDetailPage;
