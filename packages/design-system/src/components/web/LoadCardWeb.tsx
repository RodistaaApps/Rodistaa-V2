/**
 * LoadCardWeb - Rodistaa Web Load/Booking Card Component
 * Displays booking information in a card format for portals
 */

import React, { CSSProperties } from 'react';
import { RCardWeb } from './RCardWeb';
import { RTagWeb } from './RTagWeb';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface LoadCardWebProps {
  id: string;
  pickup: {
    address: string;
    city: string;
    state: string;
  };
  drop: {
    address: string;
    city: string;
    state: string;
  };
  tonnage: number;
  priceRange: {
    min: number;
    max: number;
  };
  status: 'OPEN_FOR_BIDDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  bidCount?: number;
  shipperName?: string;
  createdAt?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const LoadCardWeb: React.FC<LoadCardWebProps> = ({
  id,
  pickup,
  drop,
  tonnage,
  priceRange,
  status,
  bidCount,
  shipperName,
  createdAt,
  onClick,
  className = '',
  style,
}) => {
  const getStatusVariant = (): 'primary' | 'success' | 'warning' | 'error' | 'neutral' => {
    switch (status) {
      case 'OPEN_FOR_BIDDING':
        return 'primary';
      case 'CONFIRMED':
        return 'success';
      case 'IN_TRANSIT':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const formatStatus = (): string => {
    switch (status) {
      case 'OPEN_FOR_BIDDING':
        return 'Open for Bidding';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const cardContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.md}px` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ ...WebTextStyles.h4, marginBottom: '4px' }}>
            Load #{id.slice(-8)}
          </div>
          {shipperName && (
            <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>
              Shipper: {shipperName}
            </div>
          )}
        </div>
        <RTagWeb label={formatStatus()} variant={getStatusVariant()} size="small" />
      </div>

      {/* Route */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.sm}px`, paddingLeft: `${RodistaaSpacing.md}px` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: `${RodistaaSpacing.sm}px` }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '6px',
              backgroundColor: RodistaaColors.success.main,
              marginTop: '4px',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, fontWeight: '600', marginBottom: '2px' }}>
              Pickup
            </div>
            <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.primary }}>
              {pickup.address}, {pickup.city}, {pickup.state}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: `${RodistaaSpacing.sm}px` }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '6px',
              backgroundColor: RodistaaColors.error.main,
              marginTop: '4px',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, fontWeight: '600', marginBottom: '2px' }}>
              Drop
            </div>
            <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.primary }}>
              {drop.address}, {drop.city}, {drop.state}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: `${RodistaaSpacing.md}px`,
          paddingTop: `${RodistaaSpacing.md}px`,
          borderTop: `1px solid ${RodistaaColors.border.light}`,
        }}
      >
        <div>
          <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, marginBottom: '4px' }}>
            Tonnage
          </div>
          <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.primary, fontWeight: '600' }}>
            {tonnage} tons
          </div>
        </div>
        <div>
          <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, marginBottom: '4px' }}>
            Price Range
          </div>
          <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.primary, fontWeight: '600' }}>
            ₹{priceRange.min.toLocaleString('en-IN')} - ₹{priceRange.max.toLocaleString('en-IN')}
          </div>
        </div>
        {bidCount !== undefined && (
          <div>
            <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, marginBottom: '4px' }}>
              Bids
            </div>
            <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.primary, fontWeight: '600' }}>
              {bidCount}
            </div>
          </div>
        )}
      </div>

      {/* Meta Info */}
      {createdAt && (
        <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>
          Created: {formatDate(createdAt)}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={className}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 120ms ease',
        ...(onClick && {
          ':hover': {
            transform: 'translateY(-2px)',
          },
        }),
        ...style,
      }}
      onClick={onClick}
    >
      <RCardWeb elevated hoverable={!!onClick}>
        {cardContent}
      </RCardWeb>
    </div>
  );
};

export default LoadCardWeb;

