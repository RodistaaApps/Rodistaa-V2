/**
 * Shipments List Page
 *
 * Admin view of all active shipments:
 * - Live tracking status
 * - POD verification status
 * - Payment settlement status
 * - Dispute indicators
 * - Force close, mark settled actions
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
  Progress,
  message,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { ShipmentDetailPanel } from "@/modules/shipments/ShipmentDetailPanel";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Shipment {
  id: string;
  booking_id: string;
  operator_id: string;
  operator_name: string;
  truck_id: string;
  driver_id: string;
  driver_name: string;
  pickup_city: string;
  drop_city: string;
  distance_km: number;
  start_at: string;
  estimated_arrival: string;
  status: string;
  pod_uploaded: boolean;
  payment_state: string;
  freight_amount: number;
  advance_paid: number;
  has_dispute: boolean;
  last_ping_at: string;
}

const ShipmentsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(
    null,
  );
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    status: undefined as string | undefined,
    search: "",
  });

  const isDark = theme === "dark";
  const bgPrimary = isDark ? "#0A0E14" : "#F9FAFB";
  const bgCard = isDark ? "#151922" : "#FFFFFF";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0E14";
  const textSecondary = isDark ? "#B4B9C5" : "#6B7280";
  const border = isDark ? "#2D3748" : "#E5E7EB";

  useEffect(() => {
    fetchShipments();
  }, [filters]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockShipments: Shipment[] = [
        {
          id: "SHP-001",
          booking_id: "BKG-002",
          operator_id: "OP-001",
          operator_name: "ABC Transport",
          truck_id: "DL01AB1234",
          driver_id: "DR-001",
          driver_name: "Ramesh Kumar",
          pickup_city: "Delhi",
          drop_city: "Bangalore",
          distance_km: 2150,
          start_at: "2025-12-04T19:00:00Z",
          estimated_arrival: "2025-12-06T10:00:00Z",
          status: "in_transit",
          pod_uploaded: false,
          payment_state: "advance_paid",
          freight_amount: 87500,
          advance_paid: 40000,
          has_dispute: false,
          last_ping_at: "2025-12-05T14:30:00Z",
        },
      ];

      setShipments(mockShipments);
      setTotal(28);
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
      message.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: "blue",
      started: "cyan",
      in_transit: "orange",
      delivered: "green",
      delayed: "red",
      exception: "red",
      closed: "default",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getPaymentColor = (state: string) => {
    const colors = {
      pending: "default",
      advance_paid: "orange",
      balance_pending: "orange",
      settled: "green",
    };
    return colors[state as keyof typeof colors] || "default";
  };

  const columns = [
    {
      title: "Shipment ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <a
          style={{
            fontFamily: "monospace",
            fontWeight: 600,
            color: "#1890ff",
            fontSize: "13px",
            display: "inline-block",
            whiteSpace: "nowrap",
          }}
          onClick={() => setSelectedShipmentId(id)}
        >
          {id}
        </a>
      ),
    },
    {
      title: "Booking",
      dataIndex: "booking_id",
      key: "booking_id",
      render: (bookingId: string) => (
        <a
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            whiteSpace: "nowrap",
          }}
        >
          {bookingId}
        </a>
      ),
    },
    {
      title: "Operator",
      key: "operator",
      render: (_: any, record: Shipment) => (
        <div>
          <div style={{ color: textPrimary }}>{record.operator_name}</div>
          <div
            style={{
              fontSize: "11px",
              color: textSecondary,
              fontFamily: "monospace",
            }}
          >
            {record.operator_id}
          </div>
        </div>
      ),
    },
    {
      title: "Truck",
      dataIndex: "truck_id",
      key: "truck_id",
      render: (truckId: string) => (
        <span style={{ fontFamily: "monospace", color: textPrimary }}>
          {truckId}
        </span>
      ),
    },
    {
      title: "Driver",
      dataIndex: "driver_name",
      key: "driver_name",
      render: (name: string) => (
        <span style={{ color: textPrimary }}>{name}</span>
      ),
    },
    {
      title: "Route",
      key: "route",
      render: (_: any, record: Shipment) => (
        <div>
          <div style={{ fontWeight: 600, color: textPrimary }}>
            {record.pickup_city} → {record.drop_city}
          </div>
          <div style={{ fontSize: "12px", color: textSecondary }}>
            {record.distance_km} km
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace("_", " ").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "POD",
      dataIndex: "pod_uploaded",
      key: "pod_uploaded",
      align: "center" as const,
      render: (uploaded: boolean) =>
        uploaded ? (
          <CheckCircleOutlined style={{ color: "#10B981", fontSize: "18px" }} />
        ) : (
          <CloseCircleOutlined
            style={{ color: textSecondary, fontSize: "18px" }}
          />
        ),
    },
    {
      title: "Payment",
      dataIndex: "payment_state",
      key: "payment_state",
      render: (state: string, record: Shipment) => (
        <div>
          <Tag color={getPaymentColor(state)}>
            {state.replace("_", " ").toUpperCase()}
          </Tag>
          <div
            style={{ fontSize: "11px", color: textSecondary, marginTop: "4px" }}
          >
            ₹{record.advance_paid.toLocaleString()} / ₹
            {record.freight_amount.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: "Last Ping",
      dataIndex: "last_ping_at",
      key: "last_ping_at",
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
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: textPrimary,
              margin: 0,
            }}
          >
            <TruckOutlined style={{ marginRight: "12px" }} />
            Shipments
          </h1>
          <div
            style={{ color: textSecondary, fontSize: "14px", marginTop: "4px" }}
          >
            Active shipments with live tracking and settlement
          </div>
        </div>

        <Card
          style={{
            marginBottom: "16px",
            background: bgCard,
            border: `1px solid ${border}`,
          }}
        >
          <Space wrap>
            <Input
              placeholder="Search shipment ID, operator, truck..."
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
                { label: "In Transit", value: "in_transit" },
                { label: "Delivered", value: "delivered" },
                { label: "Delayed", value: "delayed" },
                { label: "Exception", value: "exception" },
              ]}
            />
            <Button
              icon={<FilterOutlined />}
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 25,
                  status: undefined,
                  search: "",
                })
              }
            >
              Clear
            </Button>
          </Space>
        </Card>

        <Card style={{ background: bgCard, border: `1px solid ${border}` }}>
          <Table
            columns={columns}
            dataSource={shipments}
            rowKey="id"
            loading={loading}
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
                `Showing ${range[0]}-${range[1]} of ${total} shipments`,
            }}
            onChange={(pagination) => {
              setFilters((prev) => ({
                ...prev,
                page: pagination.current || 1,
                limit: pagination.pageSize || 100,
              }));
            }}
            scroll={{ y: 600 }}
            tableLayout="auto"
          />
        </Card>

        {/* Shipment Detail Panel */}
        <ShipmentDetailPanel
          shipmentId={selectedShipmentId}
          open={!!selectedShipmentId}
          onClose={() => setSelectedShipmentId(null)}
          theme={theme}
        />
      </div>
    </AdminLayout>
  );
};

export default ShipmentsPage;
