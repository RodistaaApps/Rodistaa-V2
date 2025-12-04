/**
 * TruckCard - Rodistaa Mobile Truck Card Component
 * Displays truck information with status and actions
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Image } from 'react-native';
import { RCard } from './RCard';
import { RTag } from './RTag';
import { RButton } from './RButton';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface TruckCardProps {
  id: string;
  registrationNumber: string;
  vehicleType: string;
  capacityTons: number;
  bodyType: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_INSPECTION';
  inspectionDue?: string; // ISO date string
  photoUrl?: string;
  onPress?: () => void;
  onViewDetails?: () => void;
  onManage?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const TruckCard: React.FC<TruckCardProps> = ({
  id,
  registrationNumber,
  vehicleType,
  capacityTons,
  bodyType,
  status,
  inspectionDue,
  photoUrl,
  onPress,
  onViewDetails,
  onManage,
  style,
  testID,
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

  const CardContent = (
    <View style={styles.content}>
      {/* Header with Photo */}
      <View style={styles.header}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>No Photo</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <View style={styles.headerTop}>
            <Text style={styles.registrationNumber}>{registrationNumber}</Text>
            <RTag label={formatStatus()} variant={getStatusVariant()} size="small" />
          </View>
          <Text style={styles.vehicleType}>{vehicleType}</Text>
          {inspectionDue && (
            <Text style={styles.inspectionDue}>
              Inspection: {formatInspectionDue()}
            </Text>
          )}
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Capacity</Text>
          <Text style={styles.detailValue}>{capacityTons} tons</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Body Type</Text>
          <Text style={styles.detailValue}>{bodyType}</Text>
        </View>
      </View>

      {/* Actions */}
      {(onViewDetails || onManage) && (
        <View style={styles.actions}>
          {onViewDetails && (
            <RButton
              title="View Details"
              variant="secondary"
              size="small"
              onPress={onViewDetails}
              style={styles.actionButton}
            />
          )}
          {onManage && (
            <RButton
              title="Manage"
              variant="primary"
              size="small"
              onPress={onManage}
              style={styles.actionButton}
            />
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        <RCard style={styles.card}>{CardContent}</RCard>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      <RCard style={styles.card}>{CardContent}</RCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: RodistaaSpacing.md,
  },
  card: {
    padding: RodistaaSpacing.lg,
  },
  content: {
    gap: RodistaaSpacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: RodistaaSpacing.md,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: RodistaaSpacing.borderRadius.md,
    backgroundColor: RodistaaColors.background.paper,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: RodistaaSpacing.borderRadius.md,
    backgroundColor: RodistaaColors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
  },
  headerInfo: {
    flex: 1,
    gap: RodistaaSpacing.xs,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registrationNumber: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
  },
  vehicleType: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  inspectionDue: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.warning.main,
    fontWeight: '600',
  },
  details: {
    paddingTop: RodistaaSpacing.md,
    borderTopWidth: 1,
    borderTopColor: RodistaaColors.border.light,
    gap: RodistaaSpacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
  },
  detailValue: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: RodistaaSpacing.sm,
    paddingTop: RodistaaSpacing.md,
    borderTopWidth: 1,
    borderTopColor: RodistaaColors.border.light,
  },
  actionButton: {
    flex: 1,
  },
});

export default TruckCard;

