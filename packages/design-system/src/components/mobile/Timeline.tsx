/**
 * Timeline - Rodistaa Mobile Timeline Component
 * Displays shipment progress timeline
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string; // ISO date string
  status: 'completed' | 'active' | 'pending';
  icon?: React.ReactNode;
}

export interface TimelineProps {
  events: TimelineEvent[];
  style?: ViewStyle;
  testID?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  style,
  testID,
}) => {
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEvent = (event: TimelineEvent, index: number) => {
    const isLast = index === events.length - 1;
    const isCompleted = event.status === 'completed';
    const isActive = event.status === 'active';
    const isPending = event.status === 'pending';

    return (
      <View key={event.id} style={styles.eventContainer}>
        {/* Timeline Line and Dot */}
        <View style={styles.timelineColumn}>
          <View
            style={[
              styles.dot,
              isCompleted && styles.dotCompleted,
              isActive && styles.dotActive,
              isPending && styles.dotPending,
            ]}
          >
            {isCompleted && <View style={styles.dotInner} />}
            {event.icon && <View style={styles.iconContainer}>{event.icon}</View>}
          </View>
          {!isLast && (
            <View
              style={[
                styles.line,
                isCompleted && styles.lineCompleted,
                !isCompleted && styles.linePending,
              ]}
            />
          )}
        </View>

        {/* Event Content */}
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text
              style={[
                styles.eventTitle,
                isActive && styles.eventTitleActive,
                isPending && styles.eventTitlePending,
              ]}
            >
              {event.title}
            </Text>
            <Text style={styles.eventTimestamp}>{formatTimestamp(event.timestamp)}</Text>
          </View>
          {event.description && (
            <Text
              style={[
                styles.eventDescription,
                isPending && styles.eventDescriptionPending,
              ]}
            >
              {event.description}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {events.map((event, index) => renderEvent(event, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: RodistaaSpacing.md,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: RodistaaSpacing.lg,
  },
  timelineColumn: {
    width: 24,
    alignItems: 'center',
    marginRight: RodistaaSpacing.md,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: RodistaaColors.border.default,
    backgroundColor: RodistaaColors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotCompleted: {
    borderColor: RodistaaColors.success.main,
    backgroundColor: RodistaaColors.success.main,
  },
  dotActive: {
    borderColor: RodistaaColors.primary.main,
    backgroundColor: RodistaaColors.primary.main,
  },
  dotPending: {
    borderColor: RodistaaColors.border.default,
    backgroundColor: RodistaaColors.background.default,
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RodistaaColors.background.default,
  },
  iconContainer: {
    position: 'absolute',
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  lineCompleted: {
    backgroundColor: RodistaaColors.success.main,
  },
  linePending: {
    backgroundColor: RodistaaColors.border.light,
  },
  eventContent: {
    flex: 1,
    gap: RodistaaSpacing.xs,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  eventTitleActive: {
    color: RodistaaColors.primary.main,
  },
  eventTitlePending: {
    color: RodistaaColors.text.secondary,
  },
  eventTimestamp: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    marginLeft: RodistaaSpacing.sm,
  },
  eventDescription: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  eventDescriptionPending: {
    color: RodistaaColors.text.disabled,
  },
});

export default Timeline;

