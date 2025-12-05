/**
 * Admin Layout - Theme-aware sidebar and header
 */

import { Layout, Menu, Button, Switch } from "antd";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  DashboardOutlined,
  IdcardOutlined,
  CarOutlined,
  FileProtectOutlined,
  TeamOutlined,
  BarChartOutlined,
  UserOutlined,
  SettingOutlined,
  MenuOutlined,
  BellOutlined,
  SearchOutlined,
  SunOutlined,
  MoonOutlined,
  BookOutlined,
  ShoppingOutlined,
  TruckOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

export function AdminLayout({
  children,
  theme: propTheme,
  toggleTheme: propToggleTheme,
}: AdminLayoutProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (propTheme) {
      setCurrentTheme(propTheme);
    } else {
      const savedTheme = localStorage.getItem("rodistaa-theme") as
        | "light"
        | "dark";
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    }
  }, [propTheme]);

  const handleToggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      const newTheme = currentTheme === "light" ? "dark" : "light";
      setCurrentTheme(newTheme);
      localStorage.setItem("rodistaa-theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  const isDark = currentTheme === "dark";

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "users-group",
      icon: <UserOutlined />,
      label: "User Management",
      children: [
        {
          key: "/admin/shippers",
          icon: <ShoppingOutlined />,
          label: "Shippers",
        },
        {
          key: "/admin/operators",
          icon: <TruckOutlined />,
          label: "Operators",
        },
        {
          key: "/admin/drivers-new",
          icon: <SafetyOutlined />,
          label: "Drivers",
        },
      ],
    },
    { key: "/admin/kyc", icon: <IdcardOutlined />, label: "KYC Management" },
  { key: "/admin/fleet", icon: <CarOutlined />, label: "Fleet Management" },
  { key: "/admin/bookings", icon: <BookOutlined />, label: "Bookings" },
  { key: "/admin/shipments", icon: <TeamOutlined />, label: "Shipments" },
  {
    key: "operations-group",
    icon: <FileProtectOutlined />,
    label: "Operations",
    children: [
      { key: "/admin/tickets", icon: <FileProtectOutlined />, label: "Support Tickets" },
      { key: "/admin/overrides", icon: <FileProtectOutlined />, label: "Override Requests" },
    ],
  },
    {
      key: "/admin/controls",
      icon: <SettingOutlined />,
      label: "Admin Controls",
    },
    { key: "/admin/reports", icon: <BarChartOutlined />, label: "Reports" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        style={{
          background: isDark ? "#0A0E14" : "#FFFFFF",
          borderRight: isDark ? "1px solid #2D3748" : "1px solid #E5E7EB",
        }}
      >
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: isDark ? "1px solid #2D3748" : "1px solid #E5E7EB",
            fontSize: "18px",
            fontWeight: "bold",
            color: isDark ? "#FFFFFF" : "#0A0E14",
            fontFamily: "'Baloo Bhai 2', sans-serif",
          }}
        >
          🚛 Rodistaa Admin
        </div>

        <Menu
          mode="inline"
          selectedKeys={[router.pathname]}
          style={{
            background: "transparent",
            border: "none",
          }}
          theme={isDark ? "dark" : "light"}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: isDark ? "#0A0E14" : "#FFFFFF",
            borderBottom: isDark ? "1px solid #2D3748" : "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Button
              type="text"
              icon={
                <MenuOutlined
                  style={{ color: isDark ? "#FFFFFF" : "#0A0E14" }}
                />
              }
              onClick={() => setCollapsed(!collapsed)}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: isDark ? "#1E2430" : "#F3F4F6",
                padding: "8px 16px",
                borderRadius: "8px",
                width: "300px",
              }}
            >
              <SearchOutlined style={{ color: "#6B7280" }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  color: isDark ? "#FFFFFF" : "#0A0E14",
                  width: "100%",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: isDark ? "#1E2430" : "#F3F4F6",
                borderRadius: "20px",
              }}
            >
              <SunOutlined
                style={{
                  color: !isDark ? "#C90D0D" : "#6B7280",
                  fontSize: "16px",
                }}
              />
              <Switch
                checked={isDark}
                onChange={handleToggleTheme}
                size="small"
                style={{
                  background: isDark ? "#C90D0D" : "#94A3B8",
                }}
              />
              <MoonOutlined
                style={{
                  color: isDark ? "#C90D0D" : "#6B7280",
                  fontSize: "16px",
                }}
              />
            </div>

            <Button
              type="text"
              icon={
                <BellOutlined
                  style={{
                    color: isDark ? "#FFFFFF" : "#0A0E14",
                    fontSize: "20px",
                  }}
                />
              }
            />

            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#C90D0D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              AD
            </div>
          </div>
        </Header>

        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
}
