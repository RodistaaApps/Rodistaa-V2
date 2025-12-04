/**
 * BidCardWeb - Rodistaa Web Bid Card Component
 * Displays bid information with actions for portals
 */

import React, { CSSProperties } from 'react';
import { RCardWeb } from './RCardWeb';
import { RTagWeb } from './RTagWeb';
import { RButtonWeb } from './RButtonWeb';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface BidCardWebProps {
  id: string;
  bookingId: string;
  amount: number;
  operatorName: string;
  operatorPhone?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  submittedAt: string;
  canModify?: boolean;
  canAccept?: boolean;
  canReject?: boolean;
  onViewDetails?: () => void;
  onModify?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const BidCardWeb: React.FC<BidCardWebProps> = ({
  id,
  bookingId,
  amount,
  operatorName,
  operatorPhone,
  status,
  submittedAt,
  canModify = false,
  canAccept = false,
  canReject = false,
  onViewDetails,
  onModify,
  onAccept,
  onReject,
  className = '',
  style,
}) => {
  const getStatusVariant = (): 'primary' | 'success' | 'warning' | 'error' | 'neutral' => {
    switch (status) {
      case 'PENDING':
        return 'primary';
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'WITHDRAWN':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const formatStatus = (): string => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      case 'WITHDRAWN':
        return 'Withdrawn';
      default:
        return status;
    }
  };

  const formatDate = (): string => {
    const date = new Date(submittedAt);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const maskPhone = (phone?: string): string => {
    if (!phone) return '';
    return phone.replace(/(\d{5})(\d{5})/, 'XXXXX-$2');
  };

  const cardContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.md}px` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...WebTextStyles.h4, color: RodistaaColors.text.primary, marginBottom: '2px' }}>
            Bid #{id.slice(-8)}
          </div>
          <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>
            Booking #{bookingId.slice(-8)}
          </div>
        </div>
        <RTagWeb label={formatStatus()} variant={getStatusVariant()} size="small" />
      </div>

      {/* Amount - Prominent */}
      <div
        style={{
          padding: `${RodistaaSpacing.md}px`,
          backgroundColor: RodistaaColors.primary.light,
          borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
          textAlign: 'center',
        }}
      >
        <div style={{ ...WebTextStyles.caption, color: RodistaaColors.primary.main, marginBottom: '4px' }}>
          Bid Amount
        </div>
        <div style={{ ...WebTextStyles.h2, color: RodistaaColors.primary.main, fontWeight: '700' }}>
          ₹{amount.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Operator Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.xs}px` }}>
        <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>
          Operator
        </div>
        <div style={{ ...WebTextStyles.body, color: RodistaaColors.text.primary, fontWeight: '600' }}>
          {operatorName}
        </div>
        {operatorPhone && (
          <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>
            {maskPhone(operatorPhone)}
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div
        style={{
          paddingTop: `${RodistaaSpacing.sm}px`,
          borderTop: `1px solid ${RodistaaColors.border.light}`,
          ...WebTextStyles.caption,
          color: RodistaaColors.text.secondary,
        }}
      >
        Submitted: {formatDate()}
      </div>

      {/* Actions */}
      {status === 'PENDING' && (canModify || canAccept || canReject || onViewDetails) && (
        <div
          style={{
            display: 'flex',
            gap: `${RodistaaSpacing.sm}px`,
            paddingTop: `${RodistaaSpacing.md}px`,
            borderTop: `1px solid ${RodistaaColors.border.light}`,
          }}
        >
          {onViewDetails && (
            <RButtonWeb
              variant="secondary"
              size="small"
              onClick={onViewDetails}
              style={{ flex: 1 }}
            >
              View Details
            </RButtonWeb>
          )}
          {canModify && onModify && (
            <RButtonWeb
              variant="secondary"
              size="small"
              onClick={onModify}
              style={{ flex: 1 }}
            >
              Modify
            </RButtonWeb>
          )}
          {canAccept && onAccept && (
            <RButtonWeb
              variant="primary"
              size="small"
              onClick={onAccept}
              style={{ flex: 1 }}
            >
              Accept
            </RButtonWeb>
          )}
          {canReject && onReject && (
            <RButtonWeb
              variant="danger"
              size="small"
              onClick={onReject}
              style={{ flex: 1 }}
            >
              Reject
            </RButtonWeb>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={className} style={style}>
      <RCardWeb elevated>{cardContent}</RCardWeb>
    </div>
  );
};

export default BidCardWeb;

