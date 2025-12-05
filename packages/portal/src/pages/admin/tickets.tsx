/**
 * Tickets List Page
 *
 * Admin view of all support tickets:
 * - Comprehensive filters (status, priority, owner, franchise, linked entity)
 * - Full-text search
 * - SLA status indicators
 * - Bulk actions (assign, close, export)
 * - Create ticket CTA
 */

import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Badge,
  Tooltip,
  message,
  Dropdown,
  MenuProps,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { useTheme } from "@/contexts/ThemeContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Ticket {
  id: string;
  title: string;
  created_by_id: string;
  created_by_role: string;
  owner_id: string | null;
  owner_role: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  linked_type: string | null;
  linked_id: string | null;
  sla_due_at: string;
  sla_status: "on_track" | "near_breach" | "breached";
  tags: string[];
  created_at: string;
}

const TicketsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    status: undefined as string | undefined,
    priority: undefined as string | undefined,
    search: "",
  });

  const isDark = theme === "dark";
  const bgPrimary = isDark ? "#0A0E14" : "#F9FAFB";
  const bgCard = isDark ? "#151922" : "#FFFFFF";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0E14";
  const textSecondary = isDark ? "#B4B9C5" : "#6B7280";
  const border = isDark ? "#2D3748" : "#E5E7EB";

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockTickets: Ticket[] = [
        {
          id: "TKT-001",
          title: "Payment not received for shipment SHP-001",
          created_by_id: "USR-20241",
          created_by_role: "driver",
          owner_id: "ADM-001",
          owner_role: "finance",
          priority: "HIGH",
          status: "IN_PROGRESS",
          linked_type: "shipment",
          linked_id: "SHP-001",
          sla_due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          sla_status: "on_track",
          tags: ["payment", "urgent"],
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "TKT-002",
          title: "Truck KYC documents expired",
          created_by_id: "SYSTEM",
          created_by_role: "system",
          owner_id: "ADM-002",
          owner_role: "compliance_officer",
          priority: "MEDIUM",
          status: "OPEN",
          linked_type: "truck",
          linked_id: "DL01AB1234",
          sla_due_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          sla_status: "on_track",
          tags: ["kyc", "compliance"],
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "TKT-003",
          title: "POD mismatch reported by shipper",
          created_by_id: "USR-20242",
          created_by_role: "shipper",
          owner_id: null,
          owner_role: "ops_manager",
          priority: "CRITICAL",
          status: "ESCALATED",
          linked_type: "shipment",
          linked_id: "SHP-002",
          sla_due_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          sla_status: "breached",
          tags: ["pod", "dispute"],
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setTickets(mockTickets);
      setTotal(45);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      message.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "default",
      MEDIUM: "blue",
      HIGH: "orange",
      CRITICAL: "red",
    };
    return colors[priority as keyof typeof colors] || "default";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      NEW: "blue",
      OPEN: "cyan",
      IN_PROGRESS: "orange",
      AWAITING_SHIPPER: "purple",
      AWAITING_OPERATOR: "purple",
      AWAITING_FINANCE: "purple",
      RESOLVED: "green",
      CLOSED: "default",
      ESCALATED: "red",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getSLAIndicator = (sla_status: string, sla_due_at: string) => {
    const timeLeft = dayjs(sla_due_at).diff(dayjs(), "minute");

    if (sla_status === "breached") {
      return (
        <Tooltip title={`SLA breached ${dayjs(sla_due_at).fromNow()}`}>
          <Tag color="red" icon={<WarningOutlined />}>
            BREACHED
          </Tag>
        </Tooltip>
      );
    }

    if (sla_status === "near_breach") {
      return (
        <Tooltip title={`${timeLeft} minutes remaining`}>
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            {timeLeft}m left
          </Tag>
        </Tooltip>
      );
    }

    return (
      <Tooltip title={`${timeLeft} minutes remaining`}>
        <Tag color="green" icon={<CheckCircleOutlined />}>
          On Track
        </Tag>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: "Ticket ID",
      dataIndex: "id",
      key: "id",
      width: 110,
      fixed: "left" as const,
      render: (id: string, record: Ticket) => (
        <div style={{ paddingLeft: "4px" }}>
          <div>
            <a
              style={{
                fontFamily: "monospace",
                fontWeight: 600,
                color: "#1890ff",
                fontSize: "13px",
              }}
              onClick={() => setSelectedTicketId(id)}
            >
              {id}
            </a>
          </div>
          <Tag
            color={getPriorityColor(record.priority)}
            style={{ fontSize: "10px", marginTop: "4px" }}
          >
            {record.priority}
          </Tag>
        </div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 300,
      ellipsis: true,
      render: (title: string) => (
        <span style={{ color: textPrimary, fontWeight: 500 }}>{title}</span>
      ),
    },
    {
      title: "Linked To",
      key: "linked",
      width: 140,
      render: (_: any, record: Ticket) =>
        record.linked_type && record.linked_id ? (
          <div>
            <div style={{ fontSize: "11px", color: textSecondary }}>
              {record.linked_type}
            </div>
            <a style={{ fontFamily: "monospace", fontSize: "13px" }}>
              {record.linked_id}
            </a>
          </div>
        ) : (
          <span style={{ color: textSecondary }}>—</span>
        ),
    },
    {
      title: "Owner",
      key: "owner",
      width: 150,
      render: (_: any, record: Ticket) =>
        record.owner_role ? (
          <div>
            <div style={{ fontSize: "12px", color: textPrimary }}>
              {record.owner_role.replace(/_/g, " ")}
            </div>
            {record.owner_id && (
              <div
                style={{
                  fontSize: "11px",
                  color: textSecondary,
                  fontFamily: "monospace",
                }}
              >
                {record.owner_id}
              </div>
            )}
          </div>
        ) : (
          <Tag color="default">Unassigned</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.replace(/_/g, " ")}</Tag>
      ),
    },
    {
      title: "SLA",
      key: "sla",
      width: 140,
      render: (_: any, record: Ticket) =>
        getSLAIndicator(record.sla_status, record.sla_due_at),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 150,
      render: (tags: string[]) => (
        <Space wrap>
          {tags.slice(0, 2).map((tag) => (
            <Tag key={tag} style={{ fontSize: "11px" }}>
              {tag}
            </Tag>
          ))}
          {tags.length > 2 && (
            <Tag style={{ fontSize: "11px" }}>+{tags.length - 2}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format("DD MMM YYYY, HH:mm")}>
          <span style={{ color: textSecondary }}>
            {dayjs(timestamp).fromNow()}
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <AdminLayout theme={theme} toggleTheme={toggleTheme}>
      <div
        style={{ padding: "24px", background: bgPrimary, minHeight: "100vh" }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: textPrimary,
                margin: 0,
              }}
            >
              <FileTextOutlined style={{ marginRight: "12px" }} />
              Support Tickets
            </h1>
            <div
              style={{
                color: textSecondary,
                fontSize: "14px",
                marginTop: "4px",
              }}
            >
              Ticketing system for support, operations, and compliance
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Ticket
          </Button>
        </div>

        {/* Filters */}
        <Card
          style={{
            marginBottom: "16px",
            background: bgCard,
            border: `1px solid ${border}`,
          }}
        >
          <Space wrap>
            <Input
              placeholder="Search ticket ID, title, linked entity..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1,
                }))
              }
              allowClear
            />
            <Select
              placeholder="Status"
              style={{ width: 140 }}
              allowClear
              value={filters.status}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value, page: 1 }))
              }
              options={[
                { label: "New", value: "NEW" },
                { label: "Open", value: "OPEN" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Escalated", value: "ESCALATED" },
                { label: "Resolved", value: "RESOLVED" },
              ]}
            />
            <Select
              placeholder="Priority"
              style={{ width: 120 }}
              allowClear
              value={filters.priority}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, priority: value, page: 1 }))
              }
              options={[
                { label: "Critical", value: "CRITICAL" },
                { label: "High", value: "HIGH" },
                { label: "Medium", value: "MEDIUM" },
                { label: "Low", value: "LOW" },
              ]}
            />
            <Button
              icon={<FilterOutlined />}
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 25,
                  status: undefined,
                  priority: undefined,
                  search: "",
                })
              }
            >
              Clear
            </Button>
          </Space>
        </Card>

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <Card
            style={{
              marginBottom: "16px",
              background: bgCard,
              border: `1px solid ${border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Badge
                count={selectedRowKeys.length}
                style={{ backgroundColor: "#3B82F6" }}
              >
                <span
                  style={{
                    color: textPrimary,
                    fontWeight: 600,
                    paddingRight: "20px",
                  }}
                >
                  Selected
                </span>
              </Badge>
              <Space>
                <Button icon={<DownloadOutlined />}>Export Selected</Button>
                <Button onClick={() => setSelectedRowKeys([])}>Clear</Button>
              </Space>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <style jsx global>{`
            .tickets-table .ant-table-selection-column {
              padding-right: 4px !important;
            }
            .tickets-table .ant-table-cell:first-child + .ant-table-cell {
              padding-left: 4px !important;
            }
            .tickets-table .ant-table-tbody > tr > td:nth-child(2) {
              padding-left: 4px !important;
            }
          `}</style>
          <Table
            className="tickets-table"
            columns={columns}
            dataSource={tickets}
            rowKey="id"
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys as string[]),
            }}
            virtual
            sticky
            pagination={{
              current: filters.page,
              pageSize: filters.limit,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["50", "100", "200", "500"],
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} tickets`,
            }}
            onChange={(pagination) => {
              setFilters((prev) => ({
                ...prev,
                page: pagination.current || 1,
                limit: pagination.pageSize || 100,
              }));
            }}
            scroll={{ y: 600, x: 1400 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default TicketsPage;
