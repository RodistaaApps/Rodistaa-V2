/**
 * TimelineWeb - Rodistaa Web Timeline Component
 * Displays shipment progress timeline for portals
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface TimelineEventWeb {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: 'completed' | 'active' | 'pending';
  icon?: React.ReactNode;
}

export interface TimelineWebProps {
  events: TimelineEventWeb[];
  className?: string;
  style?: CSSProperties;
}

export const TimelineWeb: React.FC<TimelineWebProps> = ({
  events,
  className = '',
  style,
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

  const renderEvent = (event: TimelineEventWeb, index: number) => {
    const isLast = index === events.length - 1;
    const isCompleted = event.status === 'completed';
    const isActive = event.status === 'active';
    const isPending = event.status === 'pending';

    const dotStyles: CSSProperties = {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      borderWidth: '2px',
      borderStyle: 'solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 120ms ease',
      ...(isCompleted && {
        borderColor: RodistaaColors.success.main,
        backgroundColor: RodistaaColors.success.main,
      }),
      ...(isActive && {
        borderColor: RodistaaColors.primary.main,
        backgroundColor: RodistaaColors.primary.main,
      }),
      ...(isPending && {
        borderColor: RodistaaColors.border.default,
        backgroundColor: RodistaaColors.background.default,
      }),
    };

    const lineStyles: CSSProperties = {
      width: '2px',
      flex: 1,
      marginTop: '4px',
      transition: 'background-color 120ms ease',
      ...(isCompleted && {
        backgroundColor: RodistaaColors.success.main,
      }),
      ...(!isCompleted && {
        backgroundColor: RodistaaColors.border.light,
      }),
    };

    return (
      <div
        key={event.id}
        style={{
          display: 'flex',
          marginBottom: `${RodistaaSpacing.lg}px`,
        }}
      >
        {/* Timeline Column */}
        <div
          style={{
            width: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginRight: `${RodistaaSpacing.md}px`,
          }}
        >
          <div style={dotStyles}>
            {isCompleted && (
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: RodistaaColors.background.default,
                }}
              />
            )}
            {event.icon && <div style={{ position: 'absolute' }}>{event.icon}</div>}
          </div>
          {!isLast && <div style={lineStyles} />}
        </div>

        {/* Event Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.xs}px` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div
              style={{
                ...WebTextStyles.body,
                color: isActive
                  ? RodistaaColors.primary.main
                  : isPending
                  ? RodistaaColors.text.secondary
                  : RodistaaColors.text.primary,
                fontWeight: '600',
                flex: 1,
              }}
            >
              {event.title}
            </div>
            <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, marginLeft: `${RodistaaSpacing.sm}px` }}>
              {formatTimestamp(event.timestamp)}
            </div>
          </div>
          {event.description && (
            <div
              style={{
                ...WebTextStyles.bodySmall,
                color: isPending ? RodistaaColors.text.disabled : RodistaaColors.text.secondary,
              }}
            >
              {event.description}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={className}
      style={{
        padding: `${RodistaaSpacing.md}px 0`,
        ...style,
      }}
    >
      {events.map((event, index) => renderEvent(event, index))}
    </div>
  );
};

export default TimelineWeb;

