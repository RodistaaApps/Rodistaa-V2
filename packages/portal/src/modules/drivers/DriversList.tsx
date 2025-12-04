/**
 * Drivers List Component
 * Production-grade table with filters, sorting, pagination
 */

import { useState, useEffect } from "react";
import { Table, Input, Select, Button, Tag, Badge, Tooltip } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  WarningOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { Driver, DriversListParams } from "./types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface DriversListProps {
  theme?: "light" | "dark";
  onViewDriver?: (driverId: string) => void;
}

export function DriversList({
  theme = "dark",
  onViewDriver,
}: DriversListProps) {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<DriversListParams>({
    limit: 25,
    offset: 0,
    sort: "last_ping",
    order: "desc",
  });

  const isDark = theme === "dark";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0E14";
  const textSecondary = isDark ? "#B4B9C5" : "#6B7280";
  const bgCard = isDark ? "#151922" : "#FFFFFF";

  // Mock data
  const mockDrivers: Driver[] = [
    {
      id: "USR-50421",
      role: "driver",
      name: "Prakash Kumar",
      mobile: "+911234561234",
      operators: [{ id: "OP-1", name: "Suresh Logistics", is_primary: true }],
      assigned_truck: "TN 01 AB 1234",
      dl_number: "DL1234567890",
      dl_expiry: "2026-05-12",
      availability: "on_trip",
      last_ping: "2025-12-04T09:10:00Z",
      last_location: {
        city: "Hyderabad",
        lat: 17.385,
        lng: 78.4867,
        timestamp: "2025-12-04T09:10:00Z",
      },
      trips_30d: 42,
      behaviour_score: 82,
      acs_flags_count: 0,
      trust_score: 82,
    },
    {
      id: "USR-50422",
      role: "driver",
      name: "Ramesh Reddy",
      mobile: "+919876543210",
      operators: [{ id: "OP-2", name: "Rajesh Transport", is_primary: true }],
      assigned_truck: null,
      dl_number: "DL9876543210",
      dl_expiry: "2025-12-15", // Expiring soon
      availability: "available",
      last_ping: "2025-12-04T08:45:00Z",
      last_location: {
        city: "Vijayawada",
        lat: 16.5062,
        lng: 80.648,
        timestamp: "2025-12-04T08:45:00Z",
      },
      trips_30d: 28,
      behaviour_score: 95,
      acs_flags_count: 0,
      trust_score: 95,
    },
    {
      id: "USR-50423",
      role: "driver",
      name: "Kumar Singh",
      mobile: "+919123456789",
      operators: [
        { id: "OP-1", name: "Suresh Logistics", is_primary: true },
        { id: "OP-3", name: "Krishna Fleet", is_primary: false },
      ],
      assigned_truck: "KA 03 CD 5678",
      dl_number: "DL1122334455",
      dl_expiry: "2027-08-20",
      availability: "offline",
      last_ping: "2025-12-03T18:30:00Z",
      last_location: {
        city: "Guntur",
        lat: 16.3067,
        lng: 80.4365,
        timestamp: "2025-12-03T18:30:00Z",
      },
      trips_30d: 15,
      behaviour_score: 68,
      acs_flags_count: 2,
      trust_score: 68,
    },
  ];

  useEffect(() => {
    fetchDrivers();
  }, [params]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDrivers(mockDrivers);
      setTotal(mockDrivers.length);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    return dayjs(timestamp).fromNow();
  };

  const getAvailabilityColor = (availability: string) => {
    const colors: Record<string, string> = {
      available: "green",
      on_trip: "blue",
      offline: "default",
    };
    return colors[availability] || "default";
  };

  const isDLExpiring = (expiryDate: string) => {
    return dayjs(expiryDate).diff(dayjs(), "days") < 30;
  };

  const isDLExpired = (expiryDate: string) => {
    return dayjs(expiryDate).isBefore(dayjs());
  };

  const columns = [
    {
      title: "User ID / Role",
      dataIndex: "id",
      key: "id",
      width: 140,
      render: (id: string, record: Driver) => (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => onViewDriver?.(record.id)}
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
          <Tag color="orange" style={{ fontSize: "11px", marginTop: "4px" }}>
            Driver
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
      render: (name: string, record: Driver) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>{name}</div>
          <div style={{ fontSize: "12px", color: textSecondary }}>
            {record.mobile}
          </div>
        </div>
      ),
    },
    {
      title: "Assigned Operator(s)",
      key: "operators",
      width: 180,
      render: (_: any, record: Driver) => (
        <div>
          {record.operators.length > 0 ? (
            <Tooltip title={record.operators.map((o) => o.name).join(", ")}>
              <div>
                <Tag color="blue">{record.operators[0].name}</Tag>
                {record.operators.length > 1 && (
                  <Tag style={{ fontSize: "11px" }}>
                    +{record.operators.length - 1}
                  </Tag>
                )}
              </div>
            </Tooltip>
          ) : (
            <span style={{ color: textSecondary }}>Unassigned</span>
          )}
        </div>
      ),
    },
    {
      title: "Assigned Truck",
      dataIndex: "assigned_truck",
      key: "assigned_truck",
      width: 130,
      render: (truck: string | null) => (
        <span
          style={{
            fontFamily: "monospace",
            color: truck ? textPrimary : textSecondary,
            cursor: truck ? "pointer" : "default",
          }}
        >
          {truck || "—"}
        </span>
      ),
    },
    {
      title: "DL Expiry",
      dataIndex: "dl_expiry",
      key: "dl_expiry",
      width: 130,
      sorter: true,
      render: (expiry: string) => (
        <div>
          {isDLExpired(expiry) ? (
            <Tag color="red">EXPIRED</Tag>
          ) : isDLExpiring(expiry) ? (
            <Tooltip
              title={`Expires on ${dayjs(expiry).format("DD MMM YYYY")}`}
            >
              <Tag color="orange">Expiring Soon</Tag>
            </Tooltip>
          ) : (
            <span style={{ color: textSecondary }}>
              {dayjs(expiry).format("DD MMM YYYY")}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Availability",
      dataIndex: "availability",
      key: "availability",
      width: 110,
      render: (availability: string) => (
        <Tag color={getAvailabilityColor(availability)}>
          {availability.replace("_", " ").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Last Ping",
      key: "last_ping",
      width: 140,
      sorter: true,
      render: (_: any, record: Driver) => (
        <div>
          <div style={{ fontSize: "13px", color: textPrimary }}>
            <EnvironmentOutlined style={{ marginRight: "4px" }} />
            {record.last_location.city}
          </div>
          <Tooltip title={dayjs(record.last_ping).format("DD MMM YYYY, HH:mm")}>
            <div style={{ fontSize: "11px", color: textSecondary }}>
              <ClockCircleOutlined style={{ marginRight: "4px" }} />
              {formatRelativeTime(record.last_ping)}
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Trips (30d)",
      dataIndex: "trips_30d",
      key: "trips_30d",
      width: 100,
      align: "center" as const,
      sorter: true,
      render: (trips: number) => (
        <span style={{ fontWeight: 600, color: textPrimary }}>T:{trips}</span>
      ),
    },
    {
      title: "Behaviour",
      dataIndex: "behaviour_score",
      key: "behaviour_score",
      width: 110,
      align: "center" as const,
      sorter: true,
      render: (score: number, record: Driver) => (
        <div>
          <div
            style={{
              fontWeight: 600,
              color:
                score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444",
            }}
          >
            {score}
          </div>
          {record.acs_flags_count > 0 && (
            <Badge
              count={record.acs_flags_count}
              style={{ backgroundColor: "#EF4444" }}
            />
          )}
        </div>
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
          placeholder="Search by ID, Name, Mobile, DL, or Truck Reg"
          prefix={<SearchOutlined style={{ color: textSecondary }} />}
          style={{ width: 350 }}
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
          placeholder="Operator"
          style={{ width: 180 }}
          allowClear
          value={params.operator_id}
          onChange={(value) =>
            setParams((prev) => ({ ...prev, operator_id: value, offset: 0 }))
          }
          options={[
            { label: "Suresh Logistics", value: "OP-1" },
            { label: "Rajesh Transport", value: "OP-2" },
            { label: "Krishna Fleet", value: "OP-3" },
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
            { label: "Hyderabad", value: "hyderabad" },
            { label: "Vijayawada", value: "vijayawada" },
            { label: "Guntur", value: "guntur" },
          ]}
        />
        <Select
          placeholder="Availability"
          style={{ width: 140 }}
          allowClear
          value={params.availability}
          onChange={(value) =>
            setParams((prev) => ({ ...prev, availability: value, offset: 0 }))
          }
          options={[
            { label: "Available", value: "available" },
            { label: "On Trip", value: "on_trip" },
            { label: "Offline", value: "offline" },
          ]}
        />
        <Select
          placeholder="Has Flags"
          style={{ width: 130 }}
          allowClear
          value={params.has_flags}
          onChange={(value) =>
            setParams((prev) => ({ ...prev, has_flags: value, offset: 0 }))
          }
          options={[
            { label: "With Flags", value: true },
            { label: "No Flags", value: false },
          ]}
        />
        <Button
          icon={<FilterOutlined />}
          onClick={() =>
            setParams({
              limit: 25,
              offset: 0,
              sort: "last_ping",
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
        dataSource={drivers}
        rowKey="id"
        loading={loading}
        pagination={{
          current: (params.offset || 0) / (params.limit || 25) + 1,
          pageSize: params.limit || 25,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "25", "50", "100"],
          showTotal: (total) => `Total ${total} drivers`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
      />
    </div>
  );
}
