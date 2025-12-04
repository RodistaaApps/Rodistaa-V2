/**
 * RStatusTagWeb - Rodistaa Web Status Tag Component
 * For displaying statuses in portals
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { RodistaaSpacing } from '../../tokens/spacing';

export type RStatusWeb =
  | 'draft'
  | 'published'
  | 'confirmed'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'inTransit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'blocked';

export interface RStatusTagWebProps {
  status: RStatusWeb;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export const RStatusTagWeb: React.FC<RStatusTagWebProps> = ({
  status,
  label,
  className = '',
  style,
}) => {
  const tagStyles: CSSProperties = {
    display: 'inline-block',
    padding: `${RodistaaSpacing.xxs}px ${RodistaaSpacing.sm}px`,
    borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
    fontSize: '12px',
    fontWeight: '600',
    ...getStatusStyles(status),
    ...style,
  };

  const displayLabel = label || formatStatus(status);

  return (
    <span className={className} style={tagStyles}>
      {displayLabel}
    </span>
  );
};

const formatStatus = (status: RStatusWeb): string => {
  const statusLabels: Record<RStatusWeb, string> = {
    draft: 'Draft',
    published: 'Published',
    confirmed: 'Confirmed',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    inTransit: 'In Transit',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
    blocked: 'Blocked',
  };
  return statusLabels[status] || status;
};

const getStatusStyles = (status: RStatusWeb): CSSProperties => {
  const statusColors: Record<RStatusWeb, string> = {
    draft: RodistaaColors.status.draft,
    published: RodistaaColors.status.published,
    confirmed: RodistaaColors.status.confirmed,
    pending: RodistaaColors.status.pending,
    accepted: RodistaaColors.status.accepted,
    rejected: RodistaaColors.status.rejected,
    inTransit: RodistaaColors.status.inTransit,
    delivered: RodistaaColors.status.delivered,
    completed: RodistaaColors.status.completed,
    cancelled: RodistaaColors.status.cancelled,
    blocked: RodistaaColors.status.blocked,
  };

  const backgroundColor = statusColors[status] || RodistaaColors.status.pending;
  const useWhiteText = !['draft', 'pending', 'onHold'].includes(status);

  return {
    backgroundColor,
    color: useWhiteText
      ? RodistaaColors.text.inverse
      : RodistaaColors.text.primary,
  };
};

export default RStatusTagWeb;

