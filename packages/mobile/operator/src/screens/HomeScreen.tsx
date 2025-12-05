/**
 * Operator Home Screen - Dashboard with Full KPIs
 * Uses Rodistaa Design System
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { RCard } from '../components/RCard';
import {
  RodistaaColors,
  MobileTextStyles,
  RodistaaSpacing,
  RNShadowStyles,
} from '../theme/colors';

interface HomeScreenProps {
  navigation?: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    activeTrucks: 5,
    activeShipments: 8,
    activeBids: 12,
    pendingInspections: 3,
    winsToday: 2,
    mtdEarnings: 145000,
    pendingPayments: 45000,
    completedShipments: 234,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // TODO: Call GET /operator/dashboard API
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock refresh
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setRefreshing(false);
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
          refreshing={refreshing}
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
          <Text style={styles.statValue}>{dashboardData.activeTrucks}</Text>
          <Text style={styles.statLabel}>Active Trucks</Text>
        </RCard>

        <RCard style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statValue}>{dashboardData.activeShipments}</Text>
          <Text style={styles.statLabel}>Active Shipments</Text>
        </RCard>

        <RCard style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>{dashboardData.activeBids}</Text>
          <Text style={styles.statLabel}>Active Bids</Text>
        </RCard>

        <RCard style={[styles.statCard, { backgroundColor: '#FED7AA' }]}>
          <Text style={styles.statIcon}>🔍</Text>
          <Text style={styles.statValue}>{dashboardData.pendingInspections}</Text>
          <Text style={styles.statLabel}>Pending Inspections</Text>
        </RCard>
      </View>

      {/* Financial KPIs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.financialGrid}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Wins Today</Text>
            <Text style={styles.financialValue}>{dashboardData.winsToday}</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>MTD Earnings</Text>
            <Text style={styles.financialValue}>
              ₹{(dashboardData.mtdEarnings / 1000).toFixed(1)}K
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Pending Payments</Text>
            <Text style={[styles.financialValue, { color: '#F59E0B' }]}>
              ₹{(dashboardData.pendingPayments / 1000).toFixed(1)}K
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Completed</Text>
            <Text style={styles.financialValue}>{dashboardData.completedShipments}</Text>
          </View>
        </View>
      </View>

      {/* Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
        <RCard style={[styles.alertCard, { borderLeftColor: '#EF4444' }]}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Document Expiring Soon</Text>
            <Text style={styles.alertText}>RC for DL 01 AB 1234 expires in 15 days</Text>
          </View>
        </RCard>
        <RCard style={[styles.alertCard, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.alertIcon}>🔍</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Inspection Pending</Text>
            <Text style={styles.alertText}>2 trucks need inspection this week</Text>
          </View>
        </RCard>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <QuickActionCard
          icon="🚛"
          title="Add New Truck"
          onPress={() => navigation?.navigate('AddTruck')}
        />
        <QuickActionCard
          icon="📦"
          title="Browse Bookings"
          onPress={() => navigation?.navigate('Bookings')}
        />
        <QuickActionCard
          icon="🔍"
          title="Daily Inspection"
          onPress={() => navigation?.navigate('Inspection')}
        />
        <QuickActionCard
          icon="💵"
          title="View Wallet"
          onPress={() => navigation?.navigate('Wallet')}
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <RCard style={styles.activityCard}>
          <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Shipment SHP-001 Delivered</Text>
            <Text style={styles.activityDescription}>
              DL 01 AB 1234 completed delivery to Mumbai
            </Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </RCard>

        <RCard style={styles.activityCard}>
          <View style={[styles.activityDot, { backgroundColor: '#3B82F6' }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Bid Accepted</Text>
            <Text style={styles.activityDescription}>
              Your bid of ₹48,000 for BKG-002 was accepted
            </Text>
            <Text style={styles.activityTime}>5 hours ago</Text>
          </View>
        </RCard>

        <RCard style={styles.activityCard}>
          <View style={[styles.activityDot, { backgroundColor: '#F59E0B' }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Inspection Completed</Text>
            <Text style={styles.activityDescription}>
              Daily inspection for HR 26 BX 5678 marked as passed
            </Text>
            <Text style={styles.activityTime}>1 day ago</Text>
          </View>
        </RCard>
      </View>

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
