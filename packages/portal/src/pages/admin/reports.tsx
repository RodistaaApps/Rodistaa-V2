/**
 * Reports Page - Theme-aware version
 */

import { ProtectedRoute } from "../../components/ProtectedRoute";
import { AdminLayout } from "../../components/Layout/AdminLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, Button, Row, Col } from "antd";
import { DownloadOutlined, FileTextOutlined } from "@ant-design/icons";

function ReportsPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const bgPrimary = isDark ? "#0A0E14" : "#F9FAFB";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0E14";

  const reports = [
    {
      title: "Monthly Payout Report",
      description: "Operator payouts and commission breakdown",
    },
    {
      title: "Fraud Digest",
      description: "Fraud alerts and investigation summary",
    },
    {
      title: "Operator Performance",
      description: "Operator KPIs and reliability scores",
    },
    {
      title: "Fleet Utilization",
      description: "Truck utilization and efficiency metrics",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div
          style={{ padding: "24px", background: bgPrimary, minHeight: "100vh" }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: textPrimary,
              marginBottom: "24px",
            }}
          >
            Reports
          </h1>
          <Row gutter={[16, 16]}>
            {reports.map((report, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card>
                  <div style={{ marginBottom: "16px" }}>
                    <FileTextOutlined
                      style={{ fontSize: "32px", color: "#C90D0D" }}
                    />
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: textPrimary,
                      marginBottom: "8px",
                    }}
                  >
                    {report.title}
                  </h3>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginBottom: "16px",
                    }}
                  >
                    {report.description}
                  </div>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    block
                    style={{ background: "#C90D0D", borderColor: "#C90D0D" }}
                  >
                    Generate
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default ReportsPage;
