/**
 * Messages Tab - Shipper Detail
 * Admin to Shipper messaging and notifications
 */

import { useState } from 'react';
import { Button, Input, Modal, Select, Form, message as antMessage, Card, Space } from 'antd';
import { MessageOutlined, SendOutlined, BellOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface MessagesTabProps {
  shipperId: string;
  theme?: 'light' | 'dark';
}

export function MessagesTab({ shipperId, theme = 'dark' }: MessagesTabProps) {
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [form] = Form.useForm();

  const isDark = theme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const handleSendNotification = async (values: any) => {
    try {
      // TODO: API call
      antMessage.success('Notification sent successfully');
      setNotifyModalOpen(false);
      form.resetFields();
    } catch (error) {
      antMessage.error('Failed to send notification');
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Card style={{ background: bgCard, border: `1px solid ${border}`, marginBottom: '16px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button
            type="primary"
            icon={<BellOutlined />}
            onClick={() => setNotifyModalOpen(true)}
            style={{ background: '#C90D0D', borderColor: '#C90D0D' }}
          >
            Send Notification
          </Button>
          <div style={{ color: textSecondary, fontSize: '14px' }}>
            Message thread and history will be displayed here.
          </div>
        </Space>
      </Card>

      <Modal
        title="Send Notification to Shipper"
        open={notifyModalOpen}
        onCancel={() => setNotifyModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSendNotification}>
          <Form.Item
            name="channel"
            label="Channel"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: 'SMS', value: 'sms' },
                { label: 'Push Notification', value: 'push' },
                { label: 'Both', value: 'both' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="template"
            label="Template"
          >
            <Select
              placeholder="Optional: Select template"
              options={[
                { label: 'KYC Approved', value: 'kyc_approved' },
                { label: 'Document Required', value: 'doc_required' },
                { label: 'Payment Reminder', value: 'payment_reminder' },
                { label: 'Custom', value: 'custom' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter message' }]}
          >
            <TextArea rows={4} maxLength={500} showCount />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setNotifyModalOpen(false)} style={{ marginRight: '8px' }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} style={{ background: '#C90D0D', borderColor: '#C90D0D' }}>
              Send
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

