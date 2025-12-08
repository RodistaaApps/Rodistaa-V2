/**
 * Operator Home Screen - Enhanced Dashboard
 * Pure React Native CLI - Uses Rodistaa Design System
 * Features: KPIs, Live Loads feed, Trucks snapshot, Reminders
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system/tokens';
import { RHeader, RMetricCard, RListCard, RActionButton } from '@rodistaa/mobile-shared/src/components/ui';
import { useNavigation } from '@react-navigation/native';

interface DashboardData {
  availableTrucks: number;
  activeBids: number;
  pendingInspections: number;
  ledgerBalance: number;
  recommendedLoads: Array<{
    id: string;
    route: string;
    distance: number;
    tonnage: number;
    expectedPrice: number;
    postedTime: string;
  }>;
  trucksSnapshot: Array<{
    id: string;
    status: string;
    lastInspection: string;
  }>;
  inspectionReminders: Array<{
    truckId: string;
    dueIn: number;
    message: string;
  }>;
}

interface OperatorHomeScreenProps {
  navigation?: any;
}

export default function OperatorHomeScreen({ navigation: navProp }: OperatorHomeScreenProps) {
  let navigation;
  try {
    navigation = navProp || useNavigation();
  } catch (error) {
    navigation = {
      navigate: (name: string) => console.log('Navigate to:', name),
    };
  }
  
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['operator-dashboard'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/mobile/v1/dashboard/operator');
      // return response.data;
      
      // Mock data
      return {
        availableTrucks: 8,
        activeBids: 12,
        pendingInspections: 3,
        ledgerBalance: 145000,
        recommendedLoads: [
          {
            id: 'LD001',
            route: 'Hyderabad → Mumbai',
            distance: 750,
            tonnage: 10,
            expectedPrice: 35000,
            postedTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: 'LD002',
            route: 'Bangalore → Chennai',
            distance: 350,
            tonnage: 8,
            expectedPrice: 22000,
            postedTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
        ],
        trucksSnapshot: [
          { id: 'TR001', status: 'available', lastInspection: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'TR002', status: 'in_transit', lastInspection: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'TR003', status: 'maintenance', lastInspection: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        inspectionReminders: [
          { truckId: 'TR003', dueIn: 3, message: 'Inspection due in 3 days' },
          { truckId: 'TR004', dueIn: 5, message: 'Inspection due in 5 days' },
        ],
      };
    },
    staleTime: 30000,
  });

  const onRefresh = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 1000).toFixed(amount >= 1000 ? 1 : 0)}${amount >= 1000 ? 'K' : ''}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return RodistaaColors.success.main;
      case 'in_transit':
        return RodistaaColors.info.main;
      case 'maintenance':
        return RodistaaColors.warning.main;
      default:
        return RodistaaColors.text.secondary;
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={RodistaaColors.primary.main} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RHeader
        title="Franchise: Hyderabad"
        subtitle={`Balance: ${formatCurrency(dashboardData?.ledgerBalance || 0)}`}
        showProfileAvatar={true}
        showMenu={true}
        onProfilePress={() => navigation.navigate('Profile')}
        onMenuPress={() => {
          // Handle menu press
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={RodistaaColors.primary.main}
          />
        }
      >
        {/* KPI Row */}
        <View style={styles.kpiRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiContainer}>
            <RMetricCard
              icon="🚛"
              value={dashboardData?.availableTrucks || 0}
              label="Available Trucks"
              backgroundColor="#DBEAFE"
              onPress={() => navigation.navigate('Fleet')}
              style={styles.kpiCard}
            />
            <RMetricCard
              icon="💰"
              value={dashboardData?.activeBids || 0}
              label="Active Bids"
              backgroundColor="#D1FAE5"
              onPress={() => navigation.navigate('Bookings')}
              style={styles.kpiCard}
            />
            <RMetricCard
              icon="🔍"
              value={dashboardData?.pendingInspections || 0}
              label="Pending Inspections"
              backgroundColor="#FEF3C7"
              style={styles.kpiCard}
            />
            <RMetricCard
              icon="💵"
              value={formatCurrency(dashboardData?.ledgerBalance || 0)}
              label="Ledger Balance"
              backgroundColor="#FED7AA"
              style={styles.kpiCard}
            />
          </ScrollView>
        </View>

        {/* Live Loads Feed */}
        {dashboardData?.recommendedLoads && dashboardData.recommendedLoads.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Live Loads</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {dashboardData.recommendedLoads.map((load) => (
              <RListCard
                key={load.id}
                title={load.route}
                subtitle={`${load.distance} km • ${load.tonnage} tons`}
                metadata={`Posted ${formatTimeAgo(load.postedTime)} • Expected: ${formatCurrency(load.expectedPrice)}`}
                rightContent={
                  <RActionButton
                    label="Quick Bid"
                    icon="💰"
                    variant="primary"
                    size="small"
                    onPress={() => {
                      navigation.navigate('Bookings', { screen: 'Bid', params: { loadId: load.id } });
                    }}
                    testID={`quick-bid-${load.id}`}
                  />
                }
                onPress={() => navigation.navigate('Bookings', { screen: 'Detail', params: { id: load.id } })}
                testID={`load-${load.id}`}
              />
            ))}
          </View>
        )}

        {/* Trucks Snapshot */}
        {dashboardData?.trucksSnapshot && dashboardData.trucksSnapshot.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🚛 Trucks Snapshot</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Fleet')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trucksContainer}>
              {dashboardData.trucksSnapshot.map((truck) => (
                <TouchableOpacity
                  key={truck.id}
                  style={styles.truckCard}
                  onPress={() => navigation.navigate('Fleet', { screen: 'Detail', params: { id: truck.id } })}
                  accessible={true}
                  accessibilityLabel={`Truck ${truck.id}, Status: ${truck.status}`}
                >
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(truck.status) }]} />
                  <Text style={styles.truckId}>{truck.id}</Text>
                  <Text style={styles.truckStatus}>{truck.status.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.truckInspection}>
                    Last: {formatTimeAgo(truck.lastInspection)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Inspection Reminders */}
        {dashboardData?.inspectionReminders && dashboardData.inspectionReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Inspection Reminders</Text>
            {dashboardData.inspectionReminders.map((reminder, index) => (
              <View
                key={`${reminder.truckId}-${index}`}
                style={[
                  styles.reminderCard,
                  {
                    borderLeftColor:
                      reminder.dueIn <= 3
                        ? RodistaaColors.error.main
                        : reminder.dueIn <= 5
                        ? RodistaaColors.warning.main
                        : RodistaaColors.info.main,
                  },
                ]}
              >
                <Text style={styles.reminderIcon}>🔍</Text>
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle}>Truck {reminder.truckId}</Text>
                  <Text style={styles.reminderMessage}>{reminder.message}</Text>
                </View>
                <RActionButton
                  label="Inspect"
                  variant="primary"
                  size="small"
                  onPress={() => {
                    navigation.navigate('Fleet', { screen: 'Inspections', params: { truckId: reminder.truckId } });
                  }}
                  testID={`inspect-${reminder.truckId}`}
                />
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <RActionButton
            label="Create Bid"
            icon="💰"
            variant="primary"
            fullWidth
            onPress={() => navigation.navigate('Bookings')}
            style={styles.quickActionButton}
          />
          <RActionButton
            label="Add Truck"
            icon="🚛"
            variant="outline"
            fullWidth
            onPress={() => navigation.navigate('Fleet')}
            style={styles.quickActionButton}
          />
          <RActionButton
            label="View Earnings"
            icon="💵"
            variant="outline"
            fullWidth
            onPress={() => {
              // Handle earnings view
            }}
            style={styles.quickActionButton}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    marginTop: RodistaaSpacing.md,
  },
  scrollView: {
    flex: 1,
  },
  kpiRow: {
    marginVertical: RodistaaSpacing.md,
  },
  kpiContainer: {
    paddingHorizontal: RodistaaSpacing.md,
    gap: RodistaaSpacing.md,
  },
  kpiCard: {
    width: 140,
    minHeight: 120,
  },
  section: {
    padding: RodistaaSpacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  sectionTitle: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  viewAllText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.primary.main,
    fontWeight: '600',
  },
  trucksContainer: {
    gap: RodistaaSpacing.md,
    paddingRight: RodistaaSpacing.lg,
  },
  truckCard: {
    width: 160,
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.md,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    ...RNShadowStyles.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: RodistaaSpacing.sm,
  },
  truckId: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  truckStatus: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  truckInspection: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.tertiary,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    marginBottom: RodistaaSpacing.md,
    borderLeftWidth: 4,
    ...RNShadowStyles.sm,
  },
  reminderIcon: {
    fontSize: 24,
    marginRight: RodistaaSpacing.md,
  },
  reminderContent: {
    flex: 1,
    marginRight: RodistaaSpacing.md,
  },
  reminderTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  reminderMessage: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  quickActionButton: {
    marginBottom: RodistaaSpacing.md,
  },
  bottomSpacer: {
    height: RodistaaSpacing.xxl,
  },
});
