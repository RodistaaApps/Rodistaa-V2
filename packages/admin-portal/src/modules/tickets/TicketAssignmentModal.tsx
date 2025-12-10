/**
 * Ticket Assignment Modal
 * 
 * Modal for assigning tickets to owners:
 * - Pick owner role (ops_agent, finance, compliance, etc.)
 * - Pick specific owner (suggests based on workload)
 * - Reason field (audit)
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  message,
  Card,
  Statistic,
  Row,
  Col,
  Badge,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface TicketAssignmentModalProps {
  visible: boolean;
  ticketId: string | null;
  currentOwner: { id: string | null; role: string | null; name: string | null } | null;
  onClose: () => void;
  onSuccess: () => void;
  theme?: 'light' | 'dark';
}

interface Owner {
  id: string;
  name: string;
  role: string;
  open_tickets: number;
  avg_resolution_time_hours: number;
}

export const TicketAssignmentModal: React.FC<TicketAssignmentModalProps> = ({
  visible,
  ticketId,
  currentOwner,
  onClose,
  onSuccess,
  theme = 'light',
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [availableOwners, setAvailableOwners] = useState<Owner[]>([]);

  const isDark = theme === 'dark';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  useEffect(() => {
    if (selectedRole) {
      fetchAvailableOwners(selectedRole);
    }
  }, [selectedRole]);

  const fetchAvailableOwners = async (role: string) => {
    try {
      // TODO: Call API to get owners for role
      await new Promise(resolve => setTimeout(resolve, 300));

      const mockOwners: Owner[] = [
        {
          id: 'ADM-001',
          name: 'Rajesh Kumar',
          role,
          open_tickets: 5,
          avg_resolution_time_hours: 12,
        },
        {
          id: 'ADM-002',
          name: 'Priya Sharma',
          role,
          open_tickets: 3,
          avg_resolution_time_hours: 8,
        },
        {
          id: 'ADM-003',
          name: 'Amit Patel',
          role,
          open_tickets: 8,
          avg_resolution_time_hours: 15,
        },
      ];

      // Sort by open tickets (fewest first - least loaded)
      mockOwners.sort((a, b) => a.open_tickets - b.open_tickets);

      setAvailableOwners(mockOwners);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // TODO: Call API to assign ticket
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('Ticket assigned successfully');
      form.resetFields();
      setSelectedRole(null);
      setAvailableOwners([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      message.error('Failed to assign ticket');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { label: 'Operations Agent', value: 'ops_agent' },
    { label: 'Operations Manager', value: 'ops_manager' },
    { label: 'Regional Manager', value: 'regional_manager' },
    { label: 'Finance Team', value: 'finance' },
    { label: 'Compliance Officer', value: 'compliance_officer' },
    { label: 'HQ Support', value: 'hq_support' },
    { label: 'Franchise Agent', value: 'franchise_agent' },
  ];

  return (
    <Modal
      title="Assign Ticket"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={720}
      okText="Assign Ticket"
    >
      <Form
        form={form}
        layout="vertical"
      >
        {currentOwner?.id && (
          <Card size="small" style={{ marginBottom: '16px', background: '#FEF3C7', border: '1px solid #FCD34D' }}>
            <div style={{ fontSize: '13px', color: '#78350F' }}>
              Currently assigned to: <strong>{currentOwner.name}</strong> ({currentOwner.role})
            </div>
          </Card>
        )}

        <Form.Item
          name="owner_role"
          label="Assign to Role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select
            placeholder="Select role..."
            options={roleOptions}
            onChange={(value) => setSelectedRole(value)}
          />
        </Form.Item>

        {selectedRole && availableOwners.length > 0 && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, marginBottom: '12px' }}>
                Available {selectedRole.replace(/_/g, ' ')}s (sorted by workload):
              </div>
              <Row gutter={[12, 12]}>
                {availableOwners.map((owner) => (
                  <Col span={8} key={owner.id}>
                    <Card
                      size="small"
                      hoverable
                      onClick={() => form.setFieldValue('owner_id', owner.id)}
                      style={{
                        border: form.getFieldValue('owner_id') === owner.id ? '2px solid #1890ff' : '1px solid #E5E7EB',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                          {owner.name}
                        </div>
                        <Badge count={owner.open_tickets} style={{ backgroundColor: '#3B82F6' }}>
                          <span style={{ fontSize: '11px', color: textSecondary, paddingRight: '12px' }}>
                            Open Tickets
                          </span>
                        </Badge>
                        <div style={{ fontSize: '10px', color: textSecondary, marginTop: '4px' }}>
                          Avg: {owner.avg_resolution_time_hours}h
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <Form.Item
              name="owner_id"
              label="Specific Owner (Optional)"
            >
              <Select
                allowClear
                placeholder="Auto-assign to least loaded, or select specific person..."
                options={availableOwners.map(o => ({
                  label: `${o.name} (${o.open_tickets} open tickets)`,
                  value: o.id,
                }))}
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="reason"
          label="Assignment Reason"
          rules={[
            { required: true, message: 'Please enter a reason' },
            { min: 20, message: 'Reason must be at least 20 characters' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Why are you assigning this ticket to this role/person..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

