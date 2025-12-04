/**
 * Fleet Screen - Uses design system TruckCard components
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RCard, RButton, TruckCard, RLoader } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system';

const mockTrucks = [
  {
    id: '1',
    registrationNumber: 'TN-12-AB-1234',
    vehicleType: 'Container 20ft',
    capacityTons: 10,
    bodyType: 'Container',
    status: 'ACTIVE' as const,
    lastInspection: '2024-12-04',
    driver: 'Ramesh Kumar',
  },
  {
    id: '2',
    registrationNumber: 'TN-12-CD-5678',
    vehicleType: 'Container 40ft',
    capacityTons: 20,
    bodyType: 'Container',
    status: 'ACTIVE' as const,
    lastInspection: '2024-12-03',
    driver: 'Suresh Babu',
  },
  {
    id: '3',
    registrationNumber: 'TN-12-EF-9012',
    vehicleType: 'Flatbed',
    capacityTons: 15,
    bodyType: 'Flatbed',
    status: 'PENDING_INSPECTION' as const,
    lastInspection: '2024-12-02',
    driver: null,
  },
  {
    id: '4',
    registrationNumber: 'TN-12-GH-3456',
    vehicleType: 'Container 20ft',
    capacityTons: 10,
    bodyType: 'Container',
    status: 'ACTIVE' as const,
    lastInspection: '2024-12-04',
    driver: 'Vijay Kumar',
  },
  {
    id: '5',
    registrationNumber: 'TN-12-IJ-7890',
    vehicleType: 'Open Body',
    capacityTons: 12,
    bodyType: 'Open Body',
    status: 'BLOCKED' as const,
    lastInspection: '2024-11-30',
    driver: null,
  },
];

export default function FleetScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderTruck = ({ item }: { item: typeof mockTrucks[0] }) => {
    const inspectionDate = new Date(item.lastInspection);
    inspectionDate.setDate(inspectionDate.getDate() + 30); // 30 days from last inspection

    return (
      <TruckCard
        id={item.id}
        registrationNumber={item.registrationNumber}
        vehicleType={item.vehicleType}
        capacityTons={item.capacityTons}
        bodyType={item.bodyType}
        status={item.status}
        inspectionDue={inspectionDate.toISOString()}
        onPress={() => router.push(`/fleet/${item.id}`)}
        onViewDetails={() => router.push(`/fleet/${item.id}`)}
        onManage={() => router.push(`/fleet/${item.id}/manage`)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Fleet</Text>
        <Text style={styles.headerSubtitle}>{mockTrucks.length} / 10 Trucks</Text>
      </View>

      <RButton
        title="Add New Truck"
        variant="primary"
        onPress={() => router.push('/fleet/add')}
        icon={<Ionicons name="add-circle" size={20} color={RodistaaColors.primary.contrast} />}
        style={styles.addButton}
      />

      <FlatList
        data={mockTrucks}
        renderItem={renderTruck}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={RodistaaColors.primary.main}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No trucks yet</Text>
            <Text style={styles.emptySubtext}>Add your first truck to get started</Text>
          </View>
        }
      />
    </View>
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
  headerTitle: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  headerSubtitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  addButton: {
    margin: RodistaaSpacing.lg,
  },
  list: {
    padding: RodistaaSpacing.lg,
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
