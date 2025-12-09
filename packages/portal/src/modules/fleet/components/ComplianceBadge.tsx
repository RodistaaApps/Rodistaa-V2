/**
 * ComplianceBadge Component
 * 
 * Displays compliance status with color-coded badge and tooltip.
 * Clickable to show full compliance history and reasons.
 */

import { Tag, Tooltip, Badge } from 'antd';
import { CheckCircleOutlined, StopOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';

interface ComplianceBadgeProps {
  status: 'allowed' | 'blocked' | 'pending';
  reason?: string | null;
  confidence?: number;
  onClick?: () => void;
  showIcon?: boolean;
}

export function ComplianceBadge({ 
  status, 
  reason, 
  confidence, 
  onClick, 
  showIcon = true 
}: ComplianceBadgeProps) {
  const config = {
    allowed: {
      color: 'success',
      icon: <CheckCircleOutlined />,
      text: 'ALLOWED',
    },
    blocked: {
      color: 'error',
      icon: <StopOutlined />,
      text: 'BLOCKED',
    },
    pending: {
      color: 'warning',
      icon: <ClockCircleOutlined />,
      text: 'PENDING',
    },
  }[status];

  const tooltipContent = (
    <div>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
        Status: {config.text}
      </div>
      {reason && (
        <div style={{ marginBottom: '4px' }}>
          Reason: {reason}
        </div>
      )}
      {confidence !== undefined && (
        <div>
          Confidence: {confidence}%
        </div>
      )}
      {onClick && (
        <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8 }}>
          Click for compliance history
        </div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent}>
      <Tag
        color={config.color}
        icon={showIcon ? config.icon : null}
        style={{ 
          cursor: onClick ? 'pointer' : 'default',
          fontWeight: 600,
        }}
        onClick={onClick}
      >
        {config.text}
        {status === 'blocked' && reason && (
          <Badge count="!" style={{ backgroundColor: '#ff4d4f', marginLeft: '4px' }} />
        )}
      </Tag>
    </Tooltip>
  );
}

