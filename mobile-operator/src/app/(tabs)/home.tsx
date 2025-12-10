/**
 * Operator Home Screen
 * Dashboard with stats and quick actions - Uses design system
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RCard, RLoader } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

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
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, Operator!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-IN')}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <RCard style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="car" size={32} color={RodistaaColors.primary.main} />
          </View>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Active Trucks</Text>
        </RCard>

        <RCard style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="cube" size={32} color={RodistaaColors.primary.main} />
          </View>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Active Shipments</Text>
        </RCard>

        <RCard style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="list" size={32} color={RodistaaColors.primary.main} />
          </View>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Active Bids</Text>
        </RCard>

        <RCard style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle" size={32} color={RodistaaColors.success.main} />
          </View>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Pending Inspections</Text>
        </RCard>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/fleet/add')}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={24} color={RodistaaColors.primary.main} />
          <Text style={styles.actionText}>Add New Truck</Text>
          <Ionicons name="chevron-forward" size={24} color={RodistaaColors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/bookings')}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={24} color={RodistaaColors.primary.main} />
          <Text style={styles.actionText}>Browse Bookings</Text>
          <Ionicons name="chevron-forward" size={24} color={RodistaaColors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/inspection/daily')}
          activeOpacity={0.7}
        >
          <Ionicons name="camera" size={24} color={RodistaaColors.primary.main} />
          <Text style={styles.actionText}>Daily Inspection</Text>
          <Ionicons name="chevron-forward" size={24} color={RodistaaColors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <RCard style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Ionicons name="cube" size={20} color={RodistaaColors.success.main} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Shipment Started</Text>
            <Text style={styles.activityDescription}>
              TN-12-AB-1234 started shipment to Chennai
            </Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </RCard>

        <RCard style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Ionicons name="checkmark-circle" size={20} color={RodistaaColors.info.main} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Bid Accepted</Text>
            <Text style={styles.activityDescription}>
              Your bid for BKG-2024-001 was accepted
            </Text>
            <Text style={styles.activityTime}>5 hours ago</Text>
          </View>
        </RCard>

        <RCard style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Ionicons name="car" size={20} color={RodistaaColors.primary.main} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Inspection Completed</Text>
            <Text style={styles.activityDescription}>
              Daily inspection for TN-12-CD-5678 completed
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
    marginBottom: RodistaaSpacing.md,
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
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.default,
    padding: RodistaaSpacing.lg,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    marginBottom: RodistaaSpacing.md,
    ...RNShadowStyles.sm,
  },
  actionText: {
    flex: 1,
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    marginLeft: RodistaaSpacing.md,
    fontWeight: '600',
  },
  activityCard: {
    flexDirection: 'row',
    padding: RodistaaSpacing.lg,
    marginBottom: RodistaaSpacing.md,
    ...RNShadowStyles.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: RodistaaColors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
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
