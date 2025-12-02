/**
 * Login Page for Admin & Franchise Portals
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Login successful!');
      
      // Redirect based on role (will be handled by protected routes)
      router.push('/admin/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <div style={styles.logoContainer}>
          <Title level={1} style={styles.logo}>Rodistaa</Title>
          <Text style={styles.subtitle}>Admin & Franchise Portal</Text>
        </div>

        <Form
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
  } as React.CSSProperties,
  card: {
    width: '100%',
    maxWidth: 400,
    padding: '24px',
  } as React.CSSProperties,
  logoContainer: {
    textAlign: 'center',
    marginBottom: 32,
  } as React.CSSProperties,
  logo: {
    color: '#C90D0D',
    marginBottom: 8,
    fontFamily: 'Times New Roman',
  } as React.CSSProperties,
  subtitle: {
    color: '#666666',
    fontSize: 16,
  } as React.CSSProperties,
};

