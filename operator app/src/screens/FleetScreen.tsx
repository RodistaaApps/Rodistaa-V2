/**
 * Fleet Screen - Full truck management with design system TruckCard
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
  Alert,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RCard } from '../components/RCard';
import {
  RodistaaColors,
  MobileTextStyles,
  RodistaaSpacing,
  RNShadowStyles,
} from '../theme/colors';
import { truckService, type Truck } from '../services/truckService';
import { useNavigation } from '@react-navigation/native';

interface FleetScreenProps {
  navigation?: any;
}

export default function FleetScreen({ navigation: navProp }: FleetScreenProps) {
  // Use navigation from props first, fallback to hook
  let navigation;
  try {
    navigation = navProp || useNavigation();
  } catch (error) {
    console.error('Navigation error in FleetScreen:', error);
    navigation = {
      navigate: (name: string) => console.log('Navigate to:', name),
    };
  }
  const queryClient = useQueryClient();

  const { data: trucks = [], isLoading, refetch, error } = useQuery({
    queryKey: ['trucks'],
    queryFn: async () => {
      console.log('Fetching trucks...');
      const data = await truckService.getTrucks();
      console.log('Trucks fetched:', data);
      return data;
    },
    staleTime: 30000, // 30 seconds
  });

  React.useEffect(() => {
    console.log('FleetScreen - trucks:', trucks);
    console.log('FleetScreen - isLoading:', isLoading);
    console.log('FleetScreen - error:', error);
  }, [trucks, isLoading, error]);

  const onRefresh = async () => {
    await refetch();
  };

  const handleTruckPress = (truckId: string) => {
    Alert.alert('Truck Details', `View details for truck ${truckId}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'View', onPress: () => console.log('Navigate to truck details:', truckId) },
    ]);
  };

  const handleManageTruck = (truckId: string) => {
    Alert.alert('Manage Truck', `Manage truck ${truckId}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Manage', onPress: () => console.log('Manage truck:', truckId) },
    ]);
  };

  const handleInspect = (truckId: string) => {
    Alert.alert('Inspection', `Start inspection for truck ${truckId}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start', onPress: () => console.log('Start inspection:', truckId) },
    ]);
  };

  const handleAssignDriver = (truckId: string) => {
    Alert.alert('Assign Driver', `Assign driver to truck ${truckId}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Assign', onPress: () => console.log('Assign driver:', truckId) },
    ]);
  };

  const handleAddTruck = () => {
    Alert.alert('Add Truck', 'Add a new truck to your fleet', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', onPress: () => console.log('Add new truck') },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10B981';
      case 'PENDING_INSPECTION': return '#F59E0B';
      case 'BLOCKED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: RodistaaColors.error.main, marginBottom: 8 }}>
          Error loading fleet: {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={{ color: RodistaaColors.primary.main }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && trucks.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={RodistaaColors.primary.main} />
        <Text style={{ marginTop: 16, color: RodistaaColors.text.secondary }}>
          Loading fleet...
        </Text>
      </View>
    );
  }

  const renderTruck = ({ item }: { item: Truck; index?: number }) => (
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
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleInspect(item.id)}
          >
            <Text style={styles.actionBtnText}>🔍 Inspect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleAssignDriver(item.id)}
          >
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
        <TouchableOpacity style={styles.addButton} onPress={handleAddTruck}>
          <Text style={styles.addButtonText}>+ Add Truck</Text>
        </TouchableOpacity>
      </View>

      {/* Trucks List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={RodistaaColors.primary.main}
          />
        }
      >
        {trucks.length === 0 && !isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No trucks yet</Text>
            <Text style={styles.emptySubtext}>Add your first truck to get started</Text>
          </View>
        ) : (
          trucks.map((truck) => (
            <View key={truck.id}>
              {renderTruck({ item: truck, index: trucks.indexOf(truck) })}
            </View>
          ))
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
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
