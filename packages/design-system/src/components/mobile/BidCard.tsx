/**
 * BidCard - Rodistaa Mobile Bid Card Component
 * Displays bid information with actions
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { RCard } from './RCard';
import { RTag } from './RTag';
import { RButton } from './RButton';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface BidCardProps {
  id: string;
  bookingId: string;
  amount: number;
  operatorName: string; // Masked for shipper view
  operatorPhone?: string; // Masked
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  submittedAt: string; // ISO date string
  canModify?: boolean;
  canAccept?: boolean;
  canReject?: boolean;
  onPress?: () => void;
  onModify?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onCounterOffer?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const BidCard: React.FC<BidCardProps> = ({
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
  onPress,
  onModify,
  onAccept,
  onReject,
  onCounterOffer,
  style,
  testID,
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

  const CardContent = (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.bidId}>Bid #{id.slice(-6)}</Text>
          <Text style={styles.bookingId}>Booking #{bookingId.slice(-6)}</Text>
        </View>
        <RTag label={formatStatus()} variant={getStatusVariant()} size="small" />
      </View>

      {/* Amount - Prominent */}
      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>Bid Amount</Text>
        <Text style={styles.amountValue}>₹{amount.toLocaleString('en-IN')}</Text>
      </View>

      {/* Operator Info */}
      <View style={styles.operatorInfo}>
        <Text style={styles.operatorLabel}>Operator</Text>
        <Text style={styles.operatorName}>{operatorName}</Text>
        {operatorPhone && (
          <Text style={styles.operatorPhone}>{maskPhone(operatorPhone)}</Text>
        )}
      </View>

      {/* Submitted Info */}
      <View style={styles.metaInfo}>
        <Text style={styles.metaText}>Submitted: {formatDate()}</Text>
      </View>

      {/* Actions */}
      {status === 'PENDING' && (canModify || canAccept || canReject || onCounterOffer) && (
        <View style={styles.actions}>
          {canModify && onModify && (
            <RButton
              title="Modify"
              variant="secondary"
              size="small"
              onPress={onModify}
              style={styles.actionButton}
            />
          )}
          {onCounterOffer && (
            <RButton
              title="Counter Offer"
              variant="secondary"
              size="small"
              onPress={onCounterOffer}
              style={styles.actionButton}
            />
          )}
          {canAccept && onAccept && (
            <RButton
              title="Accept"
              variant="primary"
              size="small"
              onPress={onAccept}
              style={styles.actionButton}
            />
          )}
          {canReject && onReject && (
            <RButton
              title="Reject"
              variant="danger"
              size="small"
              onPress={onReject}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bidId: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    marginBottom: 2,
  },
  bookingId: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
  },
  amountSection: {
    padding: RodistaaSpacing.md,
    backgroundColor: RodistaaColors.primary.light,
    borderRadius: RodistaaSpacing.borderRadius.md,
    alignItems: 'center',
  },
  amountLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.primary.main,
    marginBottom: 4,
  },
  amountValue: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.primary.main,
    fontWeight: '700',
  },
  operatorInfo: {
    gap: RodistaaSpacing.xs,
  },
  operatorLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
  },
  operatorName: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
  },
  operatorPhone: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
  },
  metaInfo: {
    paddingTop: RodistaaSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: RodistaaColors.border.light,
  },
  metaText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
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

export default BidCard;

