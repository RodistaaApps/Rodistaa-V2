/**
 * TruckRowActions Component
 * 
 * Quick action dropdown for truck rows in list view.
 * Provides context menu with common actions based on permissions.
 */

import { useState } from 'react';
import { Dropdown, Button, message } from 'antd';
import { 
  MoreOutlined, 
  EyeOutlined, 
  StopOutlined, 
  CheckCircleOutlined,
  SyncOutlined,
  LinkOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { ConfirmModal } from './ConfirmModal';
import type { MenuProps } from 'antd';

interface TruckRowActionsProps {
  rcNumber: string;
  complianceStatus: 'allowed' | 'blocked' | 'pending';
  onView: () => void;
  onBlock?: (reason: string) => Promise<void>;
  onUnblock?: (reason: string) => Promise<void>;
  onReverify?: () => Promise<void>;
  onLinkTrailer?: () => void;
  onCreateTicket?: () => void;
  onExport?: () => void;
  permissions: {
    canBlock: boolean;
    canUnblock: boolean;
    canReverify: boolean;
    canLinkTrailer: boolean;
    canCreateTicket: boolean;
    canExport: boolean;
  };
  theme?: 'light' | 'dark';
}

export function TruckRowActions({
  rcNumber,
  complianceStatus,
  onView,
  onBlock,
  onUnblock,
  onReverify,
  onLinkTrailer,
  onCreateTicket,
  onExport,
  permissions,
  theme = 'dark',
}: TruckRowActionsProps) {
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBlock = async (reason: string) => {
    if (!onBlock) return;
    
    setLoading(true);
    try {
      await onBlock(reason);
      setBlockModalOpen(false);
      message.success(`${rcNumber} blocked successfully`);
    } catch (error) {
      message.error('Block failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (reason: string) => {
    if (!onUnblock) return;
    
    setLoading(true);
    try {
      await onUnblock(reason);
      setUnblockModalOpen(false);
      message.success(`${rcNumber} unblocked successfully`);
    } catch (error) {
      message.error('Unblock failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReverify = async () => {
    if (!onReverify) return;
    
    setLoading(true);
    try {
      await onReverify();
      message.success(`${rcNumber} enqueued for reverification`);
    } catch (error) {
      message.error('Reverify failed');
    } finally {
      setLoading(false);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <EyeOutlined />,
      onClick: onView,
    },
    { type: 'divider' },
  ];

  if (complianceStatus !== 'blocked' && permissions.canBlock) {
    menuItems.push({
      key: 'block',
      label: 'Block Truck',
      icon: <StopOutlined />,
      danger: true,
      onClick: () => setBlockModalOpen(true),
    });
  }

  if (complianceStatus === 'blocked' && permissions.canUnblock) {
    menuItems.push({
      key: 'unblock',
      label: 'Unblock Truck',
      icon: <CheckCircleOutlined />,
      onClick: () => setUnblockModalOpen(true),
    });
  }

  if (permissions.canReverify) {
    menuItems.push({
      key: 'reverify',
      label: 'Reverify with VAHAN',
      icon: <SyncOutlined />,
      onClick: handleReverify,
    });
  }

  if (permissions.canLinkTrailer) {
    menuItems.push({ type: 'divider' });
    menuItems.push({
      key: 'link-trailer',
      label: 'Link Trailer',
      icon: <LinkOutlined />,
      onClick: onLinkTrailer,
    });
  }

  if (permissions.canCreateTicket) {
    menuItems.push({ type: 'divider' });
    menuItems.push({
      key: 'create-ticket',
      label: 'Create Ticket',
      icon: <FileTextOutlined />,
      onClick: onCreateTicket,
    });
  }

  if (permissions.canExport) {
    menuItems.push({
      key: 'export',
      label: 'Export This Truck',
      icon: <DownloadOutlined />,
      onClick: onExport,
    });
  }

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button icon={<MoreOutlined />} loading={loading} />
      </Dropdown>

      {/* Block Confirmation Modal */}
      <ConfirmModal
        open={blockModalOpen}
        title={`Block ${rcNumber}?`}
        description="This will immediately block the truck from operations. An audit log will be created."
        actionType="block"
        requireReason={true}
        onConfirm={handleBlock}
        onCancel={() => setBlockModalOpen(false)}
        confirmText="Block Truck"
        theme={theme}
      />

      {/* Unblock Confirmation Modal */}
      <ConfirmModal
        open={unblockModalOpen}
        title={`Unblock ${rcNumber}?`}
        description="This will unblock the truck and allow it in operations."
        actionType="unblock"
        requireReason={true}
        onConfirm={handleUnblock}
        onCancel={() => setUnblockModalOpen(false)}
        confirmText="Unblock Truck"
        theme={theme}
      />
    </>
  );
}

