/**
 * TruckCardWeb - Rodistaa Web Truck Card Component
 * Displays truck information with status for portals
 */

import React, { CSSProperties } from 'react';
import { RCardWeb } from './RCardWeb';
import { RTagWeb } from './RTagWeb';
import { RButtonWeb } from './RButtonWeb';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface TruckCardWebProps {
  id: string;
  registrationNumber: string;
  vehicleType: string;
  capacityTons: number;
  bodyType: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_INSPECTION';
  inspectionDue?: string;
  operatorName?: string;
  photoUrl?: string;
  onViewDetails?: () => void;
  onManage?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const TruckCardWeb: React.FC<TruckCardWebProps> = ({
  id,
  registrationNumber,
  vehicleType,
  capacityTons,
  bodyType,
  status,
  inspectionDue,
  operatorName,
  photoUrl,
  onViewDetails,
  onManage,
  className = '',
  style,
}) => {
  const getStatusVariant = (): 'primary' | 'success' | 'warning' | 'error' | 'neutral' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'neutral';
      case 'BLOCKED':
        return 'error';
      case 'PENDING_INSPECTION':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const formatStatus = (): string => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'INACTIVE':
        return 'Inactive';
      case 'BLOCKED':
        return 'Blocked';
      case 'PENDING_INSPECTION':
        return 'Inspection Due';
      default:
        return status;
    }
  };

  const formatInspectionDue = (): string => {
    if (!inspectionDue) return '';
    const date = new Date(inspectionDue);
    const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return 'Overdue';
    if (daysUntil === 0) return 'Due Today';
    if (daysUntil <= 7) return `Due in ${daysUntil} days`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const cardContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.md}px` }}>
      {/* Header with Photo */}
      <div style={{ display: 'flex', gap: `${RodistaaSpacing.md}px` }}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={registrationNumber}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
              objectFit: 'cover',
              backgroundColor: RodistaaColors.background.paper,
            }}
          />
        ) : (
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
              backgroundColor: RodistaaColors.background.paper,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...WebTextStyles.caption,
              color: RodistaaColors.text.disabled,
            }}
          >
            No Photo
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.xs}px` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ ...WebTextStyles.h4, color: RodistaaColors.text.primary }}>
              {registrationNumber}
            </div>
            <RTagWeb label={formatStatus()} variant={getStatusVariant()} size="small" />
          </div>
          <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.secondary }}>
            {vehicleType}
          </div>
          {operatorName && (
            <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>
              Operator: {operatorName}
            </div>
          )}
          {inspectionDue && (
            <div style={{ ...WebTextStyles.caption, color: RodistaaColors.warning.main, fontWeight: '600' }}>
              Inspection: {formatInspectionDue()}
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: `${RodistaaSpacing.md}px`,
          paddingTop: `${RodistaaSpacing.md}px`,
          borderTop: `1px solid ${RodistaaColors.border.light}`,
        }}
      >
        <div>
          <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, marginBottom: '4px' }}>
            Capacity
          </div>
          <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.primary, fontWeight: '600' }}>
            {capacityTons} tons
          </div>
        </div>
        <div>
          <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, marginBottom: '4px' }}>
            Body Type
          </div>
          <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.primary, fontWeight: '600' }}>
            {bodyType}
          </div>
        </div>
      </div>

      {/* Actions */}
      {(onViewDetails || onManage) && (
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
              label="View Details"
              variant="secondary"
              size="small"
              onClick={onViewDetails}
              style={{ flex: 1 }}
            />
          )}
          {onManage && (
            <RButtonWeb
              label="Manage"
              variant="primary"
              size="small"
              onClick={onManage}
              style={{ flex: 1 }}
            />
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

export default TruckCardWeb;

