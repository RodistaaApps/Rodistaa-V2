/**
 * Notifications Screen - Notifications Center
 * Pure React Native CLI component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export interface NotificationsScreenProps {
  navigation: any;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'bid' | 'shipment' | 'payment' | 'alert' | 'info';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  const { data: notifications = [], isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // return await apiClient.get(`/notifications?filter=${filter}`);
      
      // Mock data
      return [
        {
          id: '1',
          title: 'Bid Accepted',
          message: 'Your bid of ₹48,000 for BKG-002 was accepted',
          type: 'bid',
          read: false,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/bookings/BKG-002',
        },
        {
          id: '2',
          title: 'Shipment Started',
          message: 'Shipment SHP-001 has started. Driver: Ramesh Kumar',
          type: 'shipment',
          read: false,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/shipments/SHP-001',
        },
        {
          id: '3',
          title: 'Payment Received',
          message: 'Payment of ₹45,000 received for SHP-001',
          type: 'payment',
          read: true,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          title: 'Inspection Due',
          message: 'Truck DL 01 AB 1234 inspection due in 3 days',
          type: 'alert',
          read: false,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ].filter(n => filter === 'all' || !n.read);
    },
  });

  const handleNotificationPress = (notification: Notification) => {
    if (notification.actionUrl) {
      // TODO: Navigate to action URL
      console.log('Navigate to:', notification.actionUrl);
    }
    
    // Mark as read
    // TODO: Call API to mark as read
  };

  const markAllAsRead = () => {
    // TODO: Call API to mark all as read
    refetch();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid': return '💰';
      case 'shipment': return '🚚';
      case 'payment': return '💵';
      case 'alert': return '⚠️';
      default: return '📋';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
      accessibilityLabel={`Notification: ${item.title}`}
    >
      <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{formatTime(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} accessibilityLabel="Mark all as read">
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}
          accessibilityLabel="Unread filter"
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
          accessibilityLabel="All notifications filter"
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={RodistaaColors.primary.main}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: RodistaaSpacing.xl,
    backgroundColor: RodistaaColors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  headerTitle: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
  },
  markAllText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.primary.main,
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: RodistaaColors.background.paper,
    paddingHorizontal: RodistaaSpacing.sm,
    paddingVertical: RodistaaSpacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: RodistaaSpacing.md,
    alignItems: 'center',
    borderRadius: RodistaaSpacing.borderRadius.md,
    marginHorizontal: RodistaaSpacing.xs,
  },
  filterTabActive: {
    backgroundColor: RodistaaColors.primary.main,
  },
  filterText: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.text.secondary,
  },
  filterTextActive: {
    color: RodistaaColors.primary.contrast,
  },
  list: {
    padding: RodistaaSpacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
    padding: RodistaaSpacing.lg,
    marginBottom: RodistaaSpacing.md,
    borderLeftWidth: 4,
    borderLeftColor: RodistaaColors.border.light,
  },
  unreadCard: {
    borderLeftColor: RodistaaColors.primary.main,
    backgroundColor: RodistaaColors.primary.light,
  },
  notificationIcon: {
    fontSize: 32,
    marginRight: RodistaaSpacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.xs,
  },
  notificationTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RodistaaColors.primary.main,
    marginLeft: RodistaaSpacing.xs,
  },
  notificationMessage: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  notificationTime: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
  },
  empty: {
    alignItems: 'center',
    padding: RodistaaSpacing.xxxl,
  },
  emptyText: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.sm,
  },
  emptySubtext: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.disabled,
  },
});

