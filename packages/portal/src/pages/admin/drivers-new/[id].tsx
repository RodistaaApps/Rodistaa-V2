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
  EnvironmentOutlined,
  CarOutlined,
  FileTextOutlined,
  WarningOutlined,
  SafetyOutlined,
  WalletOutlined,
  HistoryOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { DriverDetail } from "@/modules/drivers/types";
import { OverviewTab } from "@/modules/drivers/tabs/OverviewTab";
import { LiveTrackingTab } from "@/modules/drivers/tabs/LiveTrackingTab";
import { TripsTab } from "@/modules/drivers/tabs/TripsTab";
import { AssignmentsTab } from "@/modules/drivers/tabs/AssignmentsTab";
import { DocumentsTab } from "@/modules/drivers/tabs/DocumentsTab";
import { IncidentsTab } from "@/modules/drivers/tabs/IncidentsTab";
import { LocationLogsTab } from "@/modules/drivers/tabs/LocationLogsTab";
import { InspectionsTab } from "@/modules/drivers/tabs/InspectionsTab";
import { LedgerTab } from "@/modules/drivers/tabs/LedgerTab";
import { ActivityTab } from "@/modules/drivers/tabs/ActivityTab";

const DriverDetailPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState<DriverDetail | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const isDark = theme === "dark";
  const bgPrimary = isDark ? "#0A0E14" : "#F9FAFB";
  const bgCard = isDark ? "#151922" : "#FFFFFF";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0E14";
  const textSecondary = isDark ? "#B4B9C5" : "#6B7280";
  const border = isDark ? "#2D3748" : "#E5E7EB";

  useEffect(() => {
    if (id) {
      fetchDriverDetails();
    }
  }, [id]);

  const fetchDriverDetails = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockDriver: DriverDetail = {
        id: id as string,
        role: "driver",
        name: "Ramesh Kumar",
        mobile: "+919876543213",
        email: "ramesh.driver@example.com",
        city: "Vijayawada",
        state: "Andhra Pradesh",
        operators: [
          { id: "OP-1", name: "Rajesh Transport Co.", is_primary: true },
        ],
        assigned_truck: "AP 09 AB 1234",
        dl_number: "AP-0920210012345",
        dl_expiry: "2027-08-15",
        availability: "on_trip",
        last_ping: "2025-12-04T11:45:00Z",
        last_location: {
          city: "Vijayawada",
          lat: 16.5062,
          lng: 80.648,
          timestamp: "2025-12-04T11:45:00Z",
        },
        trips_30d: 42,
        behaviour_score: 88,
        acs_flags_count: 0,
        trust_score: 88,
        last_active: "2025-12-04T11:45:00Z",
        metrics: {
          completed_trips_30d: 42,
          avg_onroad_time: 8.5,
          last_trip_start: "2025-12-04T06:00:00Z",
          total_driving_hours_30d: 356,
        },
        active_trip: null,
        trips: {
          total: 234,
          items: [],
        },
        assignments: {
          total: 1,
          items: [],
        },
        documents: [],
        incidents: {
          total: 0,
          items: [],
        },
        location_logs: {
          total: 1248,
          items: [],
        },
        ledger: {
          balance: 5600.0,
        },
        recent_activities: [],
        acs_flags: [],
      };

      setDriver(mockDriver);
    } catch (error) {
      console.error("Failed to fetch driver:", error);
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

  const getAvailabilityColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "green",
      on_trip: "blue",
      offline: "default",
      blocked: "red",
    };
    return colors[status] || "default";
  };

  if (loading || !driver) {
    return (
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div
          style={{ padding: "24px", background: bgPrimary, minHeight: "100vh" }}
        >
          <div style={{ color: textPrimary }}>Loading driver details...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{driver.name} - Driver Details - Rodistaa Admin</title>
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
                  <a onClick={() => router.push("/admin/drivers-new")}>
                    Drivers
                  </a>
                ),
              },
              { title: driver.name },
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
                    background: "#F59E0B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {driver.name.charAt(0).toUpperCase()}
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
                      {driver.name}
                    </h1>
                    <Tag color="orange">Driver</Tag>
                    <Tag color={getKYCStatusColor(driver.kyc_status)}>
                      {driver.kyc_status.toUpperCase()}
                    </Tag>
                    <Tag
                      color={getAvailabilityColor(driver.availability_status)}
                    >
                      {driver.availability_status
                        .replace(/_/g, " ")
                        .toUpperCase()}
                    </Tag>
                  </div>

                  <div style={{ color: textSecondary, fontSize: "14px" }}>
                    <span style={{ fontFamily: "monospace" }}>{driver.id}</span>
                    {" • "}
                    <span>{driver.mobile}</span>
                    {" • "}
                    <span>DL: {driver.dl_number}</span>
                  </div>

                  <Row gutter={16} style={{ marginTop: "16px" }}>
                    <Col>
                      <Statistic
                        title="Total Trips"
                        value={driver.metrics.total_trips}
                        valueStyle={{ fontSize: "20px", color: textPrimary }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Active Trips"
                        value={driver.metrics.active_trips}
                        valueStyle={{ fontSize: "20px", color: "#F59E0B" }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Behaviour Score"
                        value={driver.behaviour_score}
                        suffix="/100"
                        valueStyle={{ fontSize: "20px", color: "#10B981" }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title="Avg Rating"
                        value={driver.metrics.avg_rating}
                        suffix="/5"
                        valueStyle={{ fontSize: "20px", color: "#F59E0B" }}
                      />
                    </Col>
                  </Row>
                </div>
              </div>

              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push("/admin/drivers-new")}
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
                <OverviewTab driver={driver} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <EnvironmentOutlined /> Live Tracking
                  </span>
                }
                key="live-tracking"
              >
                <LiveTrackingTab driverId={driver.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <CarOutlined /> Trips
                  </span>
                }
                key="trips"
              >
                <TripsTab driverId={driver.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <TeamOutlined /> Assignments
                  </span>
                }
                key="assignments"
              >
                <AssignmentsTab driverId={driver.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <FileTextOutlined /> Documents
                  </span>
                }
                key="documents"
              >
                <DocumentsTab driverId={driver.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <WarningOutlined /> Incidents
                  </span>
                }
                key="incidents"
              >
                <IncidentsTab driverId={driver.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <EnvironmentOutlined /> Location Logs
                  </span>
                }
                key="location-logs"
              >
                <LocationLogsTab driverId={driver.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <SafetyOutlined /> Inspections
                  </span>
                }
                key="inspections"
              >
                <InspectionsTab driverId={driver.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <WalletOutlined /> Payments / Ledger
                  </span>
                }
                key="ledger"
              >
                <LedgerTab driverId={driver.id} theme={theme} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <HistoryOutlined /> Activity & Audit
                  </span>
                }
                key="activity"
              >
                <ActivityTab driverId={driver.id} theme={theme} />
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

export default DriverDetailPage;
