/**
 * KYC Management - Theme-aware version
 */

import { useState } from "react";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { AdminLayout } from "../../components/Layout/AdminLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { Table, Card, Button, Tag, Space, Modal } from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

function KYCManagementPage() {
  const { theme, toggleTheme } = useTheme();
  const [selectedKyc, setSelectedKyc] = useState<any>(null);

  const isDark = theme === "dark";
  const bgPrimary = isDark ? "#0A0E14" : "#F9FAFB";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0E14";

  const mockKycRecords = [
    {
      id: "KYC-OP-001",
      userId: "OP-001",
      name: "Rajesh Kumar",
      role: "Operator",
      phone: "+919876543210",
      status: "pending",
      submittedAt: "2025-12-02",
      documentCount: 3,
    },
    {
      id: "KYC-DR-002",
      userId: "DR-002",
      name: "Suresh Reddy",
      role: "Driver",
      phone: "+919876543211",
      status: "pending",
      submittedAt: "2025-12-03",
      documentCount: 2,
    },
    {
      id: "KYC-SH-003",
      userId: "SH-003",
      name: "Krishna Enterprises",
      role: "Shipper",
      phone: "+919876543212",
      status: "verified",
      submittedAt: "2025-12-01",
      verifiedAt: "2025-12-02",
      documentCount: 4,
    },
  ];

  const columns = [
    { title: "KYC ID", dataIndex: "id", key: "id" },
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>{name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    { title: "Documents", dataIndex: "documentCount", key: "documentCount" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "verified"
              ? "green"
              : status === "rejected"
                ? "red"
                : "orange"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    { title: "Submitted", dataIndex: "submittedAt", key: "submittedAt" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setSelectedKyc(record)}
          >
            View
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                Verify
              </Button>
              <Button danger size="small" icon={<CloseCircleOutlined />}>
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <div
          style={{ padding: "24px", background: bgPrimary, minHeight: "100vh" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: textPrimary,
                margin: 0,
              }}
            >
              KYC Management
            </h1>
            <Space>
              <Button onClick={() => alert("Bulk approve")}>
                Bulk Approve Pending
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                style={{ background: "#C90D0D", borderColor: "#C90D0D" }}
              >
                Export CSV
              </Button>
            </Space>
          </div>
          <Card>
            <Table
              columns={columns}
              dataSource={mockKycRecords}
              rowKey="id"
              pagination={{ pageSize: 20 }}
            />
          </Card>
          <Modal
            title={`KYC Details: ${selectedKyc?.id || ""}`}
            open={!!selectedKyc}
            onCancel={() => setSelectedKyc(null)}
            footer={null}
            width={800}
          >
            {selectedKyc && (
              <div style={{ color: textPrimary }}>
                KYC details for {selectedKyc.name}
              </div>
            )}
          </Modal>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default KYCManagementPage;
