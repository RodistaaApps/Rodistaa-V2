/**
 * Fleet Screen - Full truck management with design system TruckCard
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
import { RCard } from '../components/RCard';
import {
  RodistaaColors,
  MobileTextStyles,
  RodistaaSpacing,
  RNShadowStyles,
} from '../theme/colors';

const mockTrucks = [
  {
    id: '1',
    registrationNumber: 'DL 01 AB 1234',
    vehicleType: 'Container 20ft',
    capacityTons: 10,
    bodyType: 'Container',
    status: 'ACTIVE' as const,
    inspectionDue: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    driver: 'Ramesh Kumar',
  },
  {
    id: '2',
    registrationNumber: 'HR 26 BX 5678',
    vehicleType: 'Open Body 14ft',
    capacityTons: 7.5,
    bodyType: 'Open Body',
    status: 'PENDING_INSPECTION' as const,
    inspectionDue: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    driver: null,
  },
  {
    id: '3',
    registrationNumber: 'MH 12 CD 9012',
    vehicleType: 'Trailer 32ft',
    capacityTons: 25,
    bodyType: 'Trailer',
    status: 'ACTIVE' as const,
    inspectionDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    driver: 'Suresh Reddy',
  },
  {
    id: '4',
    registrationNumber: 'GJ 05 EF 3456',
    vehicleType: 'Tanker',
    capacityTons: 20,
    bodyType: 'Tanker',
    status: 'BLOCKED' as const,
    inspectionDue: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    driver: null,
  },
  {
    id: '5',
    registrationNumber: 'KA 01 GH 7890',
    vehicleType: 'Container 20ft',
    capacityTons: 10,
    bodyType: 'Container',
    status: 'ACTIVE' as const,
    inspectionDue: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    driver: 'Vijay Kumar',
  },
];

interface FleetScreenProps {
  navigation?: any;
}

export default function FleetScreen({ navigation }: FleetScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [trucks, setTrucks] = useState(mockTrucks);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // TODO: Call GET /operator/trucks API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to refresh trucks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTruckPress = (truckId: string) => {
    console.log('Navigate to truck details:', truckId);
    // TODO: Navigate to truck detail screen
  };

  const handleManageTruck = (truckId: string) => {
    console.log('Manage truck:', truckId);
    // TODO: Navigate to truck management screen
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10B981';
      case 'PENDING_INSPECTION': return '#F59E0B';
      case 'BLOCKED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderTruck = ({ item }: { item: typeof mockTrucks[0] }) => (
    <TouchableOpacity
      onPress={() => handleTruckPress(item.id)}
      activeOpacity={0.7}
      style={{ marginBottom: RodistaaSpacing.md }}
    >
      <RCard>
        <View style={styles.truckHeader}>
          <View>
            <Text style={styles.truckReg}>{item.registrationNumber}</Text>
            <Text style={styles.truckId}>{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>
        <View style={styles.truckDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{item.vehicleType} • {item.capacityTons} MT</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Driver:</Text>
            <Text style={styles.detailValue}>{item.driver || 'Not Assigned'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Inspection:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.inspectionDue) < new Date() ? 
                'Overdue' : 
                `Due in ${Math.ceil((new Date(item.inspectionDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => console.log('Inspect')}>
            <Text style={styles.actionBtnText}>🔍 Inspect</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => console.log('Assign')}>
            <Text style={styles.actionBtnText}>👤 Assign Driver</Text>
          </TouchableOpacity>
        </View>
      </RCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Fleet</Text>
          <Text style={styles.headerSubtitle}>{trucks.length} / 10 Trucks</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => console.log('Add new truck')}
        >
          <Text style={styles.addButtonText}>+ Add Truck</Text>
        </TouchableOpacity>
      </View>

      {/* Trucks List */}
      <FlatList
        data={trucks}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.paper,
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
    backgroundColor: RodistaaColors.primary.main,
    paddingHorizontal: RodistaaSpacing.lg,
    paddingVertical: RodistaaSpacing.md,
    borderRadius: RodistaaSpacing.borderRadius.md,
  },
  addButtonText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.primary.contrast,
    fontWeight: '600',
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
  truckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: RodistaaSpacing.md,
  },
  truckReg: {
    fontSize: 18,
    fontWeight: 'bold',
    color: RodistaaColors.text.primary,
    fontFamily: 'monospace',
  },
  truckId: {
    fontSize: 12,
    color: RodistaaColors.text.secondary,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  truckDetails: {
    marginBottom: RodistaaSpacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: RodistaaColors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
});
