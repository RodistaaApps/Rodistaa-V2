/**
 * BulkActionToolbar Component
 * 
 * Toolbar for bulk operations on selected trucks.
 * Appears when trucks are selected in the list view.
 */

import { useState } from 'react';
import { Space, Button, Dropdown, Badge, message } from 'antd';
import { 
  StopOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  DownloadOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { ConfirmModal } from './ConfirmModal';
import type { MenuProps } from 'antd';

interface BulkActionToolbarProps {
  selectedCount: number;
  selectedRCs: string[];
  onBlock: (reason: string) => Promise<void>;
  onUnblock: (reason: string) => Promise<void>;
  onReverify: () => Promise<void>;
  onExport: (format: 'csv' | 'pdf') => Promise<void>;
  onClearSelection: () => void;
  theme?: 'light' | 'dark';
  canBlock?: boolean;
  canUnblock?: boolean;
  canReverify?: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  selectedRCs,
  onBlock,
  onUnblock,
  onReverify,
  onExport,
  onClearSelection,
  theme = 'dark',
  canBlock = true,
  canUnblock = true,
  canReverify = true,
}: BulkActionToolbarProps) {
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const handleBlock = async (reason: string) => {
    setLoading(true);
    try {
      await onBlock(reason);
      setBlockModalOpen(false);
      message.success(`${selectedCount} trucks blocked successfully`);
      onClearSelection();
    } catch (error) {
      message.error('Bulk block failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (reason: string) => {
    setLoading(true);
    try {
      await onUnblock(reason);
      setUnblockModalOpen(false);
      message.success(`${selectedCount} trucks unblocked successfully`);
      onClearSelection();
    } catch (error) {
      message.error('Bulk unblock failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReverify = async () => {
    setLoading(true);
    try {
      await onReverify();
      message.success(`${selectedCount} trucks enqueued for reverification`);
      onClearSelection();
    } catch (error) {
      message.error('Bulk reverify failed');
    } finally {
      setLoading(false);
    }
  };

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: 'Export as CSV',
      icon: <DownloadOutlined />,
      onClick: () => onExport('csv'),
    },
    {
      key: 'pdf',
      label: 'Export as PDF',
      icon: <DownloadOutlined />,
      onClick: () => onExport('pdf'),
    },
  ];

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div style={{ 
        padding: '12px 16px',
        background: bgCard,
        border: `1px solid ${border}`,
        borderRadius: '8px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge count={selectedCount} style={{ backgroundColor: '#3B82F6' }}>
            <div style={{ 
              color: textPrimary, 
              fontWeight: 600,
              paddingRight: '20px',
            }}>
              Selected
            </div>
          </Badge>
          <Button size="small" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>

        <Space>
          {canBlock && (
            <Button
              icon={<StopOutlined />}
              danger
              onClick={() => setBlockModalOpen(true)}
              disabled={loading}
            >
              Block ({selectedCount})
            </Button>
          )}
          
          {canUnblock && (
            <Button
              icon={<CheckCircleOutlined />}
              style={{ borderColor: '#10B981', color: '#10B981' }}
              onClick={() => setUnblockModalOpen(true)}
              disabled={loading}
            >
              Unblock ({selectedCount})
            </Button>
          )}

          {canReverify && (
            <Button
              icon={<SyncOutlined />}
              type="primary"
              onClick={handleReverify}
              loading={loading}
            >
              Reverify ({selectedCount})
            </Button>
          )}

          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <Button icon={<MoreOutlined />}>
              Export
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* Block Confirmation Modal */}
      <ConfirmModal
        open={blockModalOpen}
        title={`Block ${selectedCount} Truck${selectedCount > 1 ? 's' : ''}?`}
        description={`This will immediately block ${selectedCount} selected truck(s) from operations. An audit log will be created.`}
        actionType="block"
        requireReason={true}
        onConfirm={handleBlock}
        onCancel={() => setBlockModalOpen(false)}
        confirmText={`Block ${selectedCount} Truck${selectedCount > 1 ? 's' : ''}`}
        theme={theme}
      />

      {/* Unblock Confirmation Modal */}
      <ConfirmModal
        open={unblockModalOpen}
        title={`Unblock ${selectedCount} Truck${selectedCount > 1 ? 's' : ''}?`}
        description={`This will unblock ${selectedCount} selected truck(s) and allow them in operations.`}
        actionType="unblock"
        requireReason={true}
        onConfirm={handleUnblock}
        onCancel={() => setUnblockModalOpen(false)}
        confirmText={`Unblock ${selectedCount} Truck${selectedCount > 1 ? 's' : ''}`}
        theme={theme}
      />
    </>
  );
}

