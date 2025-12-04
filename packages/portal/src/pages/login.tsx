/**
 * Login Page for Admin & Franchise Portals
 * Uses Phone/OTP authentication
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, sendOTP } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [form] = Form.useForm();

  const handleSendOtp = async (values: { phone: string }) => {
    setLoading(true);
    try {
      const mobile = values.phone.startsWith('+') ? values.phone : `+91${values.phone}`;
      
      // DEV MODE: Skip OTP sending if backend is not available
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        try {
          await sendOTP(mobile);
          message.success('OTP sent successfully!');
        } catch (error: any) {
          // In dev mode, if backend is not available, show test OTP message
          message.warning('Backend not available. Use test OTP: 123456');
        }
      } else {
        await sendOTP(mobile);
        message.success('OTP sent successfully!');
      }
      
      setPhone(mobile);
      setStep('otp');
    } catch (error: any) {
      message.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values: { otp: string }) => {
    setLoading(true);
    try {
      const isDev = process.env.NODE_ENV === 'development';
      
      // DEV MODE: Allow test OTP or bypass if backend unavailable
      if (isDev && (values.otp === '123456' || values.otp === '000000')) {
        // Mock successful login in dev mode
        const mockUser = {
          id: 'dev-user-1',
          name: 'Dev Admin',
          role: 'SUPER_ADMIN' as const,
          phone: phone,
        };
        const mockToken = 'dev-token-' + Date.now();
        
        // Set auth state directly using the store
        const authStore = useAuth.getState();
        try {
          await authStore.login(phone, values.otp);
        } catch {
          // If API fails, set mock auth state
          useAuth.setState({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', mockToken);
            localStorage.setItem('userData', JSON.stringify(mockUser));
          }
        }
        
        message.success('Login successful! (Dev Mode)');
        router.push('/admin/dashboard');
        return;
      }
      
      // Normal login flow
      await login(phone, values.otp);
      message.success('Login successful!');
      router.push('/admin/dashboard');
    } catch (error: any) {
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev && (error.response?.status >= 500 || error.code === 'ECONNREFUSED')) {
        message.warning('Backend unavailable. Try test OTP: 123456');
      } else {
        message.error(error.response?.data?.message || 'Login failed. Please check your OTP.');
      }
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

        {step === 'phone' ? (
          <Form
            form={form}
            name="phone"
            onFinish={handleSendOtp}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: 'Please enter your phone number' },
                { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Phone Number (10 digits)"
                maxLength={10}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                Send OTP
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form
            name="otp"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <div style={styles.otpInfo}>
              <Text>Enter OTP sent to {phone}</Text>
              {process.env.NODE_ENV === 'development' && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                  <Text type="secondary">Dev Mode: Use test OTP <strong>123456</strong> or <strong>000000</strong></Text>
                </div>
              )}
            </div>

            <Form.Item
              name="otp"
              rules={[
                { required: true, message: 'Please enter OTP' },
                { pattern: /^[0-9]{6}$/, message: 'OTP must be 6 digits' },
              ]}
            >
              <Input
                prefix={<SafetyOutlined />}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ marginBottom: 12 }}
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  setStep('phone');
                  form.resetFields();
                }}
                block
              >
                Change Phone Number
              </Button>
            </Form.Item>
          </Form>
        )}
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
  otpInfo: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666666',
  } as React.CSSProperties,
};

