/**
 * RStatusChip - Rodistaa Mobile Status Chip Component
 * For booking, bid, and shipment statuses
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export type RStatus =
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

export interface RStatusChipProps {
  status: RStatus;
  label?: string;
  small?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const RStatusChip: React.FC<RStatusChipProps> = ({
  status,
  label,
  small = false,
  style,
  testID,
}) => {
  const chipStyle: ViewStyle = {
    ...styles.base,
    ...(small && styles.small),
    ...getStatusStyle(status),
  };

  const textStyle: TextStyle = {
    ...styles.text,
    ...(small && styles.textSmall),
    ...getStatusTextStyle(status),
  };

  const displayLabel = label || formatStatus(status);

  return (
    <View style={[chipStyle, style]} testID={testID}>
      <Text style={textStyle}>{displayLabel}</Text>
    </View>
  );
};

const formatStatus = (status: RStatus): string => {
  const statusLabels: Record<RStatus, string> = {
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

const getStatusStyle = (status: RStatus): ViewStyle => {
  const statusColors: Record<RStatus, string> = {
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
  return { backgroundColor };
};

const getStatusTextStyle = (status: RStatus): TextStyle => {
  // Warning status uses dark text, others use white
  const useWhiteText = !['draft', 'pending'].includes(status);
  return {
    color: useWhiteText
      ? RodistaaColors.text.inverse
      : RodistaaColors.text.primary,
  };
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: RodistaaSpacing.sm,
    paddingVertical: RodistaaSpacing.xxs,
    borderRadius: RodistaaSpacing.borderRadius.md,
    alignSelf: 'flex-start',
  },

  small: {
    paddingHorizontal: RodistaaSpacing.xs,
    paddingVertical: 2,
  },

  text: {
    ...MobileTextStyles.caption,
    fontWeight: '600',
  },

  textSmall: {
    fontSize: 10,
  },
});

export default RStatusChip;

