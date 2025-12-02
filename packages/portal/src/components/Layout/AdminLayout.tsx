/**
 * Admin Layout Component
 * Sidebar navigation for admin portal
 */

import { Layout, Menu, Typography, Button, Avatar, Dropdown } from 'antd';
import { useRouter } from 'next/router';
import {
  DashboardOutlined,
  IdcardOutlined,
  CarOutlined,
  FileProtectOutlined,
  TeamOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/kyc',
      icon: <IdcardOutlined />,
      label: 'KYC Management',
    },
    {
      key: '/admin/trucks',
      icon: <CarOutlined />,
      label: 'Truck Management',
    },
    {
      key: '/admin/overrides',
      icon: <FileProtectOutlined />,
      label: 'Override Requests',
    },
    {
      key: '/admin/franchises',
      icon: <TeamOutlined />,
      label: 'Franchises',
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
  ];

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'Profile',
        icon: <UserOutlined />,
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={styles.layout}>
      <Header style={styles.header}>
        <div style={styles.headerContent}>
          <Title level={3} style={styles.logo}>Rodistaa Admin</Title>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={styles.userSection}>
              <Avatar icon={<UserOutlined />} />
              <span style={styles.userName}>{user?.name}</span>
            </div>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        <Sider
          width={250}
          style={styles.sider}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            mode="inline"
            selectedKeys={[router.pathname]}
            items={menuItems}
            onClick={({ key }) => router.push(key)}
            style={styles.menu}
          />
        </Sider>

        <Content style={styles.content}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

const styles = {
  layout: {
    minHeight: '100vh',
  } as React.CSSProperties,
  header: {
    backgroundColor: '#C90D0D',
    padding: '0 24px',
  } as React.CSSProperties,
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  logo: {
    color: '#FFFFFF',
    margin: 0,
    fontFamily: 'Times New Roman',
  } as React.CSSProperties,
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    color: '#FFFFFF',
  } as React.CSSProperties,
  userName: {
    fontFamily: 'Times New Roman',
  } as React.CSSProperties,
  sider: {
    backgroundColor: '#FFFFFF',
  } as React.CSSProperties,
  menu: {
    height: '100%',
    borderRight: 0,
  } as React.CSSProperties,
  content: {
    padding: 24,
    backgroundColor: '#F5F5F5',
  } as React.CSSProperties,
};

