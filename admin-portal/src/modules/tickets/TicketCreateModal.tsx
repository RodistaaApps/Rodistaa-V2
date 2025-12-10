/**
 * Ticket Create Modal
 * 
 * Modal for creating new tickets:
 * - Title, description, priority
 * - Link to entity (search booking/shipment/user/truck)
 * - Tags, franchise assignment
 * - Attachments upload
 */

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Button,
  Upload,
  message,
  AutoComplete,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

interface TicketCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  theme?: 'light' | 'dark';
}

export const TicketCreateModal: React.FC<TicketCreateModalProps> = ({
  visible,
  onClose,
  onSuccess,
  theme = 'light',
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [linkedEntitySearch, setLinkedEntitySearch] = useState('');
  const [linkedEntityOptions, setLinkedEntityOptions] = useState<any[]>([]);

  const isDark = theme === 'dark';

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // TODO: Call API to create ticket
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('Ticket created successfully');
      form.resetFields();
      setTags([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      message.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (removedTag: string) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const searchLinkedEntity = (searchText: string) => {
    setLinkedEntitySearch(searchText);
    
    // TODO: Call API to search entities
    if (searchText.length >= 3) {
      const mockResults = [
        { value: 'booking:BKG-001', label: 'Booking BKG-001 - Mumbai → Delhi' },
        { value: 'shipment:SHP-001', label: 'Shipment SHP-001 - In Transit' },
        { value: 'user:USR-20241', label: 'User USR-20241 - Rohit Sharma' },
        { value: 'truck:DL01AB1234', label: 'Truck DL01AB1234' },
      ].filter(item => 
        item.label.toLowerCase().includes(searchText.toLowerCase())
      );
      
      setLinkedEntityOptions(mockResults);
    } else {
      setLinkedEntityOptions([]);
    }
  };

  return (
    <Modal
      title="Create Support Ticket"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={720}
      okText="Create Ticket"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: 'MEDIUM',
        }}
      >
        <Form.Item
          name="title"
          label="Ticket Title"
          rules={[
            { required: true, message: 'Please enter a title' },
            { min: 10, message: 'Title must be at least 10 characters' },
          ]}
        >
          <Input
            placeholder="Brief description of the issue..."
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: 'Please enter a description' },
            { min: 20, message: 'Description must be at least 20 characters' },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Detailed description of the issue, steps to reproduce, expected outcome..."
            maxLength={2000}
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
              { label: 'Critical', value: 'CRITICAL' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="linked_entity"
          label="Link to Entity (Optional)"
        >
          <AutoComplete
            options={linkedEntityOptions}
            onSearch={searchLinkedEntity}
            placeholder="Search booking, shipment, user, truck..."
            prefix={<SearchOutlined />}
          />
        </Form.Item>

        <Form.Item label="Tags (Optional)">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onPressEnter={handleAddTag}
              />
              <Button icon={<PlusOutlined />} onClick={handleAddTag}>
                Add
              </Button>
            </Space.Compact>
          </Space>
        </Form.Item>

        <Form.Item
          name="assigned_franchise_id"
          label="Assign to Franchise (Optional)"
        >
          <Select
            allowClear
            placeholder="Select franchise..."
            options={[
              { label: 'Vijayawada - Unit 2', value: 'FR-001' },
              { label: 'Guntur - HQ', value: 'FR-002' },
              { label: 'Delhi - Central', value: 'FR-003' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="attachments"
          label="Attachments (Optional)"
        >
          <Upload
            beforeUpload={() => false}
            maxCount={5}
          >
            <Button icon={<UploadOutlined />}>
              Upload Files
            </Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

