/**
 * Admin Layout - Redesigned to match reference UI with theme toggle
 */

import { Layout, Menu, Button, Switch } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
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
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.setAttribute('data-theme', isDarkTheme ? 'light' : 'dark');
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: '/admin/kyc',
      icon: <IdcardOutlined />,
      label: 'KYC Management',
    },
    {
      key: '/admin/fleet',
      icon: <CarOutlined />,
      label: 'Fleet Management',
    },
    {
      key: '/admin/bookings',
      icon: <FileProtectOutlined />,
      label: 'Bookings',
    },
    {
      key: '/admin/shipments',
      icon: <TeamOutlined />,
      label: 'Shipments',
    },
    {
      key: '/admin/overrides',
      icon: <FileProtectOutlined />,
      label: 'Override Requests',
    },
    {
      key: '/admin/controls',
      icon: <SettingOutlined />,
      label: 'Admin Controls',
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
  ];

  const headerStyle = isDarkTheme ? {
    background: '#0A0E14',
    borderBottom: '1px solid #2D3748',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
  } : {
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
  };

  const siderStyle = isDarkTheme ? {
    background: '#0A0E14',
    borderRight: '1px solid #2D3748',
  } : {
    background: '#FFFFFF',
    borderRight: '1px solid #E5E7EB',
  };

  const contentStyle = isDarkTheme ? {
    background: '#0A0E14',
    minHeight: '100vh',
  } : {
    background: '#F9FAFB',
    minHeight: '100vh',
  };

  const logoStyle = isDarkTheme ? {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: "'Baloo Bhai 2', sans-serif",
  } : {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#0A0E14',
    fontFamily: "'Baloo Bhai 2', sans-serif",
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        style={siderStyle}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: isDarkTheme ? '1px solid #2D3748' : '1px solid #E5E7EB',
        }}>
          <div style={logoStyle}>
            🚛 Rodistaa Admin
          </div>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[router.pathname]}
          style={{
            background: 'transparent',
            border: 'none',
            color: isDarkTheme ? '#FFFFFF' : '#0A0E14',
          }}
          theme={isDarkTheme ? 'dark' : 'light'}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: isDarkTheme ? '#FFFFFF' : '#0A0E14' }} />}
              onClick={() => setCollapsed(!collapsed)}
            />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isDarkTheme ? '#1E2430' : '#F3F4F6',
              padding: '8px 16px',
              borderRadius: '8px',
              width: '300px',
            }}>
              <SearchOutlined style={{ color: '#6B7280' }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: isDarkTheme ? '#FFFFFF' : '#0A0E14',
                  width: '100%',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Theme Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              background: isDarkTheme ? '#1E2430' : '#F3F4F6',
              borderRadius: '8px',
            }}>
              <SunOutlined style={{ color: isDarkTheme ? '#6B7280' : '#C90D0D', fontSize: '16px' }} />
              <Switch
                checked={isDarkTheme}
                onChange={toggleTheme}
                size="small"
              />
              <MoonOutlined style={{ color: isDarkTheme ? '#C90D0D' : '#6B7280', fontSize: '16px' }} />
            </div>

            <Button
              type="text"
              icon={<BellOutlined style={{ color: isDarkTheme ? '#FFFFFF' : '#0A0E14', fontSize: '20px' }} />}
            />
            
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#C90D0D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: '14px',
            }}>
              AD
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content style={contentStyle}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
