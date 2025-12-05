/**
 * Shippers List Component
 * Production-grade table with filters, sorting, pagination
 */

import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Badge,
  Tooltip,
  DatePicker,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { Shipper, ShippersListParams } from "./types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;

interface ShippersListProps {
  theme?: "light" | "dark";
  onViewShipper?: (shipperId: string) => void;
}

export function ShippersList({
  theme = "dark",
  onViewShipper,
}: ShippersListProps) {
  const [loading, setLoading] = useState(false);
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<ShippersListParams>({
    limit: 25,
    offset: 0,
    sort: "last_active",
    order: "desc",
  });

  const isDark = theme === "dark";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0E14";
  const textSecondary = isDark ? "#B4B9C5" : "#6B7280";
  const bgCard = isDark ? "#151922" : "#FFFFFF";

  // Mock data for initial development
  const mockShippers: Shipper[] = [
    {
      id: "USR-20241",
      role: "shipper",
      name: "Rohit Sharma",
      mobile: "+911234561234",
      franchise: "Vijayawada – Unit 2",
      city: "Vijayawada",
      state: "Andhra Pradesh",
      last_active: "2025-12-04T09:34:00Z",
      metrics: { bookings: 12, completed_shipments: 10 },
      ledger_balance: 12500.5,
      acs_flags_count: 1,
      trust_score: 86,
    },
    {
      id: "USR-20242",
      role: "shipper",
      name: "Priya Reddy",
      mobile: "+919876543210",
      franchise: "Kurnool – Unit 1",
      city: "Kurnool",
      state: "Andhra Pradesh",
      last_active: "2025-12-03T14:22:00Z",
      metrics: { bookings: 8, completed_shipments: 7 },
      ledger_balance: -2500.0,
      acs_flags_count: 0,
      trust_score: 92,
    },
    {
      id: "USR-20243",
      role: "shipper",
      name: "Kumar Industries",
      mobile: "+919123456789",
      franchise: "Guntur – HQ",
      city: "Guntur",
      state: "Andhra Pradesh",
      last_active: "2025-12-04T11:15:00Z",
      metrics: { bookings: 45, completed_shipments: 42 },
      ledger_balance: 85000.25,
      acs_flags_count: 0,
      trust_score: 95,
    },
  ];

  useEffect(() => {
    fetchShippers();
  }, [params]);

  const fetchShippers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/users?role=shipper&${new URLSearchParams(params as any)}`);
      // const data = await response.json();

      // Mock delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setShippers(mockShippers);
      setTotal(mockShippers.length);
    } catch (error) {
      console.error("Failed to fetch shippers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    return dayjs(timestamp).fromNow();
  };

  const columns = [
    {
      title: "User ID / Role",
      dataIndex: "id",
      key: "id",
      width: 140,
      render: (id: string, record: Shipper) => (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => onViewShipper?.(record.id)}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontWeight: 600,
              color: "#1890ff",
              textDecoration: "underline",
            }}
          >
            {id}
          </div>
          <Tag color="blue" style={{ fontSize: "11px", marginTop: "4px" }}>
            Shipper
          </Tag>
        </div>
      ),
    },
    {
      title: "Name & Mobile",
      dataIndex: "name",
      key: "name",
      width: 200,
      sorter: true,
      render: (name: string, record: Shipper) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>{name}</div>
          <div style={{ fontSize: "12px", color: textSecondary }}>
            {record.mobile}
          </div>
        </div>
      ),
    },
    {
      title: "Franchise",
      dataIndex: "franchise",
      key: "franchise",
      width: 180,
      render: (franchise: string) => (
        <span style={{ color: textPrimary }}>{franchise}</span>
      ),
    },
    {
      title: "City, State",
      key: "location",
      width: 160,
      render: (_: any, record: Shipper) => (
        <span style={{ color: textPrimary }}>
          {record.city}, {record.state}
        </span>
      ),
    },
    {
      title: "Last Active",
      dataIndex: "last_active",
      key: "last_active",
      width: 120,
      sorter: true,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format("DD MMM YYYY, HH:mm")}>
          <span style={{ color: textSecondary }}>
            {formatRelativeTime(timestamp)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Activity",
      key: "metrics",
      width: 120,
      sorter: true,
      render: (_: any, record: Shipper) => (
        <span style={{ fontSize: "13px", color: textSecondary }}>
          <span style={{ color: textPrimary, fontWeight: 600 }}>
            B:{record.metrics.bookings}
          </span>
          {" • "}
          <span style={{ color: "#10B981" }}>
            C:{record.metrics.completed_shipments}
          </span>
        </span>
      ),
    },
    {
      title: "Ledger Balance",
      dataIndex: "ledger_balance",
      key: "ledger_balance",
      width: 140,
      align: "right" as const,
      sorter: true,
      render: (balance: number) => (
        <span
          style={{
            fontWeight: 600,
            color: balance < 0 ? "#EF4444" : "#10B981",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open ledger modal
          }}
        >
          ₹
          {balance.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      title: "ACS",
      dataIndex: "acs_flags_count",
      key: "acs_flags_count",
      width: 80,
      align: "center" as const,
      render: (count: number, record: Shipper) =>
        count > 0 ? (
          <Tooltip title="Click User ID to view full details including ACS flags">
            <Badge count={count} style={{ backgroundColor: "#EF4444" }}>
              <WarningOutlined style={{ color: "#EF4444", fontSize: "18px" }} />
            </Badge>
          </Tooltip>
        ) : (
          <span style={{ color: textSecondary }}>—</span>
        ),
    },
  ];

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setParams((prev) => ({
      ...prev,
      offset: (pagination.current - 1) * pagination.pageSize,
      limit: pagination.pageSize,
      sort: sorter.field || prev.sort,
      order: sorter.order === "ascend" ? "asc" : "desc",
    }));
  };

  return (
    <div>
      {/* Filters Bar */}
      <div
        style={{
          marginBottom: "16px",
          padding: "16px",
          background: bgCard,
          borderRadius: "8px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Input
          placeholder="Search by ID, Name, or Mobile"
          prefix={<SearchOutlined style={{ color: textSecondary }} />}
          style={{ width: 280 }}
          value={params.search}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              search: e.target.value,
              offset: 0,
            }))
          }
        />
        <Select
          placeholder="Franchise"
          style={{ width: 180 }}
          allowClear
          value={params.franchise}
          onChange={(value) =>
            setParams((prev) => ({ ...prev, franchise: value, offset: 0 }))
          }
          options={[
            { label: "Vijayawada – Unit 2", value: "vij-u2" },
            { label: "Kurnool – Unit 1", value: "kur-u1" },
            { label: "Guntur – HQ", value: "gun-hq" },
          ]}
        />
        <Select
          placeholder="City"
          style={{ width: 140 }}
          allowClear
          value={params.city}
          onChange={(value) =>
            setParams((prev) => ({ ...prev, city: value, offset: 0 }))
          }
          options={[
            { label: "Vijayawada", value: "vijayawada" },
            { label: "Kurnool", value: "kurnool" },
            { label: "Guntur", value: "guntur" },
          ]}
        />
        <Select
          placeholder="Has ACS Flags"
          style={{ width: 140 }}
          allowClear
          value={params.has_acs}
          onChange={(value) =>
            setParams((prev) => ({ ...prev, has_acs: value, offset: 0 }))
          }
          options={[
            { label: "With Flags", value: true },
            { label: "Without Flags", value: false },
          ]}
        />
        <InputNumber
          placeholder="Min Balance"
          prefix="₹"
          style={{ width: 140 }}
          value={params.min_balance}
          onChange={(value) =>
            setParams((prev) => ({
              ...prev,
              min_balance: value || undefined,
              offset: 0,
            }))
          }
        />
        <Button
          icon={<FilterOutlined />}
          onClick={() =>
            setParams({
              limit: 25,
              offset: 0,
              sort: "last_active",
              order: "desc",
            })
          }
        >
          Clear Filters
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={shippers}
        rowKey="id"
        loading={loading}
        pagination={{
          current: (params.offset || 0) / (params.limit || 25) + 1,
          pageSize: params.limit || 25,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "25", "50", "100"],
          showTotal: (total) => `Total ${total} shippers`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
