/**
 * Driver Home/Dashboard Screen - Uses design system
 */

import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { RCard, RButton, RTag } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system';
import { useRouter } from 'expo-router';

export default function DriverHomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const stats = {
    assignedShipments: 1,
    completedToday: 0,
    totalEarnings: 5000,
    currentShipment: {
      id: 'SH-001',
      route: 'Mumbai → Delhi',
      progress: 45,
      eta: '4 hours',
    },
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
        <Text style={styles.title}>Driver Dashboard</Text>
        <RTag
          label={gpsActive ? 'GPS Active' : 'GPS Inactive'}
          variant={gpsActive ? 'success' : 'error'}
          size="small"
        />
      </View>

      {stats.currentShipment && (
        <RCard style={styles.currentShipmentCard}>
          <Text style={styles.cardTitle}>Current Shipment</Text>
          <Text style={styles.shipmentId}>{stats.currentShipment.id}</Text>
          <Text style={styles.route}>{stats.currentShipment.route}</Text>
          <View style={styles.progressRow}>
            <Text style={styles.label}>Progress:</Text>
            <Text style={styles.progress}>{stats.currentShipment.progress}%</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.label}>ETA:</Text>
            <Text style={styles.value}>{stats.currentShipment.eta}</Text>
          </View>
          <RButton
            title="View Details"
            variant="primary"
            onPress={() => router.push(`/shipments/${stats.currentShipment.id}`)}
            style={styles.detailsButton}
          />
        </RCard>
      )}

      <View style={styles.statsGrid}>
        <RCard style={styles.statCard}>
          <Text style={styles.statValue}>{stats.assignedShipments}</Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </RCard>
        <RCard style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completedToday}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </RCard>
        <RCard style={styles.statCard}>
          <Text style={styles.statValue}>₹{stats.totalEarnings.toLocaleString('en-IN')}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </RCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  header: {
    padding: RodistaaSpacing.xl,
    backgroundColor: RodistaaColors.background.default,
    marginBottom: RodistaaSpacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
  },
  currentShipmentCard: {
    margin: RodistaaSpacing.lg,
    padding: RodistaaSpacing.lg,
    backgroundColor: RodistaaColors.warning.light,
  },
  cardTitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.sm,
  },
  shipmentId: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
    marginBottom: RodistaaSpacing.xs,
  },
  route: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.primary.main,
    marginBottom: RodistaaSpacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: RodistaaSpacing.sm,
  },
  label: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  value: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.primary,
  },
  progress: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.primary.main,
  },
  detailsButton: {
    marginTop: RodistaaSpacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: RodistaaSpacing.md,
    gap: RodistaaSpacing.md,
  },
  statCard: {
    flex: 1,
    padding: RodistaaSpacing.lg,
    alignItems: 'center',
  },
  statValue: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.primary.main,
    marginBottom: RodistaaSpacing.sm,
  },
  statLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    textAlign: 'center',
  },
});
