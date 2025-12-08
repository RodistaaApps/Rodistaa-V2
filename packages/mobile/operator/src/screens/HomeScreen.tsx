/**
 * Operator Home Screen - Dashboard with Full KPIs
 * Uses Rodistaa Design System
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RCard } from '../components/RCard';
import {
  RodistaaColors,
  MobileTextStyles,
  RodistaaSpacing,
  RNShadowStyles,
} from '../theme/colors';
import { dashboardService, type Alert, type Activity } from '../services/dashboardService';
import { useNavigation } from '@react-navigation/native';

interface HomeScreenProps {
  navigation?: any;
}

export default function HomeScreen({ navigation: navProp }: HomeScreenProps) {
  // Use navigation from props first, fallback to hook
  let navigation;
  try {
    navigation = navProp || useNavigation();
  } catch (error) {
    console.error('Navigation error in HomeScreen:', error);
    // Fallback: create a mock navigation object
    navigation = {
      navigate: (name: string) => console.log('Navigate to:', name),
    };
  }
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: loadingDashboard, refetch: refetchDashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 30000, // 30 seconds
  });

  // Fetch alerts
  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => dashboardService.getAlerts(),
    staleTime: 60000, // 1 minute
  });

  // Fetch recent activity
  const { data: activities = [], isLoading: loadingActivity } = useQuery({
    queryKey: ['activity'],
    queryFn: () => dashboardService.getRecentActivity(),
    staleTime: 60000, // 1 minute
  });

  const onRefresh = async () => {
    await Promise.all([
      refetchDashboard(),
      queryClient.invalidateQueries({ queryKey: ['alerts'] }),
      queryClient.invalidateQueries({ queryKey: ['activity'] }),
    ]);
  };

  const isLoading = loadingDashboard || loadingAlerts || loadingActivity;

  // Always ensure something renders - even if loading or error
  React.useEffect(() => {
    console.log('HomeScreen rendered', {
      dashboardData: !!dashboardData,
      isLoading,
      alerts: alerts.length,
      activities: activities.length,
    });
  }, [dashboardData, isLoading, alerts, activities]);

  if (isLoading && !dashboardData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={RodistaaColors.primary.main} />
        <Text style={{ marginTop: 16, color: RodistaaColors.text.secondary }}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  // Fallback: Always render something
  if (!dashboardData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back, Operator! 👋</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
        </View>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: RodistaaColors.text.secondary }}>
            Initializing dashboard...
          </Text>
        </View>
      </View>
    );
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shipment': return '📦';
      case 'bid': return '💰';
      case 'inspection': return '🔍';
      case 'payment': return '💵';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'shipment': return '#10B981';
      case 'bid': return '#3B82F6';
      case 'inspection': return '#F59E0B';
      case 'payment': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const QuickActionCard = ({ icon, title, onPress }: any) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionText}>{title}</Text>
      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor={RodistaaColors.primary.main}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, Operator! 👋</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Primary KPIs */}
      <View style={styles.statsGrid}>
        <RCard style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={styles.statIcon}>🚛</Text>
          <Text style={styles.statValue}>{dashboardData?.activeTrucks ?? 0}</Text>
          <Text style={styles.statLabel}>Active Trucks</Text>
        </RCard>

        <RCard style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statValue}>{dashboardData?.activeShipments ?? 0}</Text>
          <Text style={styles.statLabel}>Active Shipments</Text>
        </RCard>

        <RCard style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>{dashboardData?.activeBids ?? 0}</Text>
          <Text style={styles.statLabel}>Active Bids</Text>
        </RCard>

        <RCard style={[styles.statCard, { backgroundColor: '#FED7AA' }]}>
          <Text style={styles.statIcon}>🔍</Text>
          <Text style={styles.statValue}>{dashboardData?.pendingInspections ?? 0}</Text>
          <Text style={styles.statLabel}>Pending Inspections</Text>
        </RCard>
      </View>

      {/* Financial KPIs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.financialGrid}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Wins Today</Text>
            <Text style={styles.financialValue}>{dashboardData?.winsToday ?? 0}</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>MTD Earnings</Text>
            <Text style={styles.financialValue}>
              ₹{((dashboardData?.mtdEarnings ?? 0) / 1000).toFixed(1)}K
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Pending Payments</Text>
            <Text style={[styles.financialValue, { color: '#F59E0B' }]}>
              ₹{((dashboardData?.pendingPayments ?? 0) / 1000).toFixed(1)}K
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Completed</Text>
            <Text style={styles.financialValue}>{dashboardData?.completedShipments ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* Alerts */}
      {alerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
          {alerts.map((alert: Alert) => (
            <RCard
              key={alert.id}
              style={[
                styles.alertCard,
                {
                  borderLeftColor:
                    alert.type === 'warning'
                      ? '#EF4444'
                      : alert.type === 'error'
                      ? '#DC2626'
                      : '#F59E0B',
                },
              ]}
            >
              <Text style={styles.alertIcon}>
                {alert.type === 'warning' ? '⚠️' : alert.type === 'error' ? '❌' : 'ℹ️'}
              </Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            </RCard>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <QuickActionCard
          icon="🚛"
          title="Add New Truck"
          onPress={() => {
            // Navigate to Fleet tab, then can add truck
            if (navigation) {
              navigation.navigate('Fleet');
            }
          }}
        />
        <QuickActionCard
          icon="📦"
          title="Browse Bookings"
          onPress={() => {
            if (navigation) {
              navigation.navigate('Bookings');
            }
          }}
        />
        <QuickActionCard
          icon="🔍"
          title="Daily Inspection"
          onPress={() => {
            if (navigation) {
              navigation.navigate('Fleet');
            }
          }}
        />
        <QuickActionCard
          icon="💵"
          title="View Wallet"
          onPress={() => {
            if (navigation) {
              navigation.navigate('Profile');
            }
          }}
        />
      </View>

      {/* Recent Activity */}
      {activities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activities.map((activity: Activity) => (
            <RCard key={activity.id} style={styles.activityCard}>
              <View
                style={[
                  styles.activityDot,
                  { backgroundColor: getActivityColor(activity.type) },
                ]}
              />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</Text>
              </View>
            </RCard>
          ))}
        </View>
      )}

      <View style={{ height: RodistaaSpacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  header: {
    backgroundColor: RodistaaColors.background.default,
    padding: RodistaaSpacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  greeting: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  date: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: RodistaaSpacing.md,
    gap: RodistaaSpacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: RodistaaSpacing.lg,
    alignItems: 'center',
    ...RNShadowStyles.sm,
  },
  statIcon: {
    fontSize: 40,
    marginBottom: RodistaaSpacing.sm,
  },
  statValue: {
    ...MobileTextStyles.h1,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  statLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    textAlign: 'center',
  },
  section: {
    padding: RodistaaSpacing.lg,
  },
  sectionTitle: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: RodistaaSpacing.md,
  },
  financialItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: RodistaaColors.background.paper,
    padding: RodistaaSpacing.lg,
    borderRadius: RodistaaSpacing.borderRadius.md,
    ...RNShadowStyles.sm,
  },
  financialLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  financialValue: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    fontWeight: 'bold',
  },
  alertCard: {
    flexDirection: 'row',
    padding: RodistaaSpacing.lg,
    marginBottom: RodistaaSpacing.md,
    borderLeftWidth: 4,
    ...RNShadowStyles.sm,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: RodistaaSpacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  alertText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.paper,
    padding: RodistaaSpacing.lg,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    marginBottom: RodistaaSpacing.md,
    ...RNShadowStyles.sm,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: RodistaaSpacing.md,
  },
  actionText: {
    flex: 1,
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
  },
  actionArrow: {
    fontSize: 24,
    color: RodistaaColors.text.secondary,
  },
  activityCard: {
    flexDirection: 'row',
    padding: RodistaaSpacing.lg,
    marginBottom: RodistaaSpacing.md,
    ...RNShadowStyles.sm,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: RodistaaSpacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
    marginBottom: RodistaaSpacing.xs,
  },
  activityDescription: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  activityTime: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
  },
});
