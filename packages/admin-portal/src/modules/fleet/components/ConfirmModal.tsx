/**
 * ConfirmModal Component
 * 
 * Standardized confirmation modal for destructive actions.
 * Includes reason input and optional evidence upload.
 */

import { useState } from 'react';
import { Modal, Input, Button, Space, Alert, Upload } from 'antd';
import { WarningOutlined, FileOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  actionType: 'block' | 'unblock' | 'delete' | 'escalate' | 'custom';
  requireReason?: boolean;
  onConfirm: (reason?: string, evidenceIds?: string[]) => Promise<void>;
  onCancel: () => void;
  confirmText?: string;
  theme?: 'light' | 'dark';
}

export function ConfirmModal({
  open,
  title,
  description,
  actionType,
  requireReason = true,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  theme = 'dark',
}: ConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);

  const isDark = theme === 'dark';
  const bgModal = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';

  const isDangerous = ['block', 'delete', 'escalate'].includes(actionType);

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason, evidenceIds);
      setReason('');
      setEvidenceIds([]);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    setEvidenceIds([]);
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textPrimary }}>
          {isDangerous && <WarningOutlined style={{ color: '#ff4d4f' }} />}
          {title}
        </div>
      }
      onCancel={handleCancel}
      footer={
        <Space>
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            danger={isDangerous}
            onClick={handleConfirm}
            loading={loading}
            disabled={requireReason && !reason.trim()}
          >
            {confirmText}
          </Button>
        </Space>
      }
      styles={{
        body: { background: bgModal, color: textPrimary },
        header: { background: bgModal, borderBottom: `1px solid ${isDark ? '#2D3748' : '#E5E7EB'}` },
      }}
    >
      {description && (
        <Alert
          message={description}
          type={isDangerous ? 'warning' : 'info'}
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {requireReason && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: textSecondary }}>
            Reason <span style={{ color: '#ff4d4f' }}>*</span>
          </label>
          <TextArea
            rows={4}
            placeholder="Enter detailed reason for this action (minimum 10 characters)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            showCount
          />
          {reason.length > 0 && reason.length < 10 && (
            <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
              Reason must be at least 10 characters
            </div>
          )}
        </div>
      )}

      {actionType === 'block' && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: textSecondary }}>
            Evidence (optional)
          </label>
          <Upload
            multiple
            onChange={(info) => {
              // TODO: Handle file upload
              console.log('Files:', info.fileList);
            }}
          >
            <Button icon={<FileOutlined />}>Upload Evidence</Button>
          </Upload>
          <div style={{ color: textSecondary, fontSize: '12px', marginTop: '4px' }}>
            Screenshots, reports, or other supporting documents
          </div>
        </div>
      )}
    </Modal>
  );
}

