/**
 * Driver Home Screen - Enhanced Dashboard
 * Pure React Native CLI - Uses Rodistaa Design System
 * Features: KPIs, Active Trip card, Recent Trips, Inspection reminder, Safety tips, Emergency call
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

interface DashboardData {
  todayTrips: number;
  earningsToday: number;
  behaviorScore: number;
  lastPing: string;
  activeTrip?: {
    id: string;
    route: string;
    status: string;
    eta: string;
    otpRequired: boolean;
  };
  recentTrips: Array<{
    id: string;
    route: string;
    completedAt: string;
    earnings: number;
  }>;
}

interface DriverHomeScreenProps {
  navigation: any;
}

export const DriverHomeScreen: React.FC<DriverHomeScreenProps> = ({ navigation }) => {
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['driver-dashboard'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/mobile/v1/dashboard/driver');
      // return response.data;
      
      // Mock data
      return {
        todayTrips: 2,
        earningsToday: 1500,
        behaviorScore: 95,
        lastPing: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        activeTrip: {
          id: 'TRIP001',
          route: 'Mumbai → Delhi',
          status: 'in_transit',
          eta: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          otpRequired: true,
        },
        recentTrips: [
          {
            id: 'TRIP002',
            route: 'Hyderabad → Bangalore',
            completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            earnings: 1800,
          },
          {
            id: 'TRIP003',
            route: 'Pune → Mumbai',
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            earnings: 1200,
          },
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
    return `₹${amount}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const formatETA = (etaTimestamp: string) => {
    const now = Date.now();
    const eta = new Date(etaTimestamp).getTime();
    const diff = eta - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const safetyTips = [
    'Always wear seatbelt while driving',
    'Take breaks every 4 hours',
    'Keep vehicle documents updated',
    'Check tire pressure before long trips',
  ];

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
        title={dashboardData?.activeTrip ? 'Active Trip' : 'No Active Trip'}
        subtitle={dashboardData?.activeTrip ? `${formatETA(dashboardData.activeTrip.eta)} ETA` : 'Last ping: ' + formatTimeAgo(dashboardData?.lastPing || new Date().toISOString())}
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
              icon="🚚"
              value={dashboardData?.todayTrips || 0}
              label="Today Trips"
              backgroundColor="#DBEAFE"
              style={styles.kpiCard}
            />
            <RMetricCard
              icon="💵"
              value={formatCurrency(dashboardData?.earningsToday || 0)}
              label="Earnings Today"
              backgroundColor="#D1FAE5"
              style={styles.kpiCard}
            />
            <RMetricCard
              icon="⭐"
              value={dashboardData?.behaviorScore || 0}
              label="Behaviour Score"
              backgroundColor="#FEF3C7"
              style={styles.kpiCard}
            />
            <RMetricCard
              icon="📍"
              value={formatTimeAgo(dashboardData?.lastPing || new Date().toISOString())}
              label="Last Ping"
              backgroundColor="#FED7AA"
              style={styles.kpiCard}
            />
          </ScrollView>
        </View>

        {/* Active Trip Card */}
        {dashboardData?.activeTrip && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚚 Active Trip</Text>
            <View style={styles.activeTripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripRoute}>{dashboardData.activeTrip.route}</Text>
                <View style={[styles.statusBadge, { backgroundColor: RodistaaColors.info.main }]}>
                  <Text style={styles.statusBadgeText}>{dashboardData.activeTrip.status.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.tripDetails}>
                <View style={styles.tripDetailItem}>
                  <Text style={styles.tripDetailLabel}>ETA</Text>
                  <Text style={styles.tripDetailValue}>{formatETA(dashboardData.activeTrip.eta)}</Text>
                </View>
                {dashboardData.activeTrip.otpRequired && (
                  <View style={styles.otpIndicator}>
                    <Text style={styles.otpText}>🔐 OTP Required</Text>
                  </View>
                )}
              </View>
              <RActionButton
                label="Validate OTP"
                icon="🔐"
                variant="primary"
                fullWidth
                onPress={() => {
                  navigation.navigate('TripDetail', { id: dashboardData.activeTrip!.id, action: 'validate-otp' });
                }}
                style={styles.otpButton}
                testID="validate-otp-button"
              />
              <RActionButton
                label="View Trip Details"
                variant="outline"
                fullWidth
                onPress={() => {
                  navigation.navigate('TripDetail', { id: dashboardData.activeTrip!.id });
                }}
                style={styles.viewTripButton}
              />
            </View>
          </View>
        )}

        {/* Inspection Reminder */}
        <View style={styles.section}>
          <View style={styles.inspectionReminder}>
            <Text style={styles.inspectionIcon}>🔍</Text>
            <View style={styles.inspectionContent}>
              <Text style={styles.inspectionTitle}>Daily Inspection</Text>
              <Text style={styles.inspectionText}>Complete your daily vehicle inspection</Text>
            </View>
            <TouchableOpacity
              style={styles.inspectionCheckbox}
              onPress={() => {
                navigation.navigate('Inspections', { action: 'start' });
              }}
              accessible={true}
              accessibilityLabel="Start inspection"
              accessibilityRole="button"
            >
              <Text style={styles.checkboxText}>✓</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Trips */}
        {dashboardData?.recentTrips && dashboardData.recentTrips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Trips (7 days)</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyTrips')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {dashboardData.recentTrips.slice(0, 7).map((trip) => (
              <RListCard
                key={trip.id}
                title={trip.route}
                subtitle={`Completed ${formatTimeAgo(trip.completedAt)}`}
                metadata={`Earnings: ${formatCurrency(trip.earnings)}`}
                rightContent={<Text style={styles.arrowIcon}>›</Text>}
                onPress={() => navigation.navigate('TripDetail', { id: trip.id })}
                testID={`trip-${trip.id}`}
              />
            ))}
          </View>
        )}

        {/* Safety Tips Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Safety Tips</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsContainer}>
            {safetyTips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Emergency Call Button */}
        <View style={styles.section}>
          <RActionButton
            label="Request Emergency Call"
            icon="🆘"
            variant="primary"
            fullWidth
            onPress={() => {
              // Show emergency call modal/queue ticket
              // TODO: Implement emergency call flow
            }}
            style={styles.emergencyButton}
            testID="emergency-call-button"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

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
  activeTripCard: {
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    borderWidth: 2,
    borderColor: RodistaaColors.primary.main,
    ...RNShadowStyles.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  tripRoute: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.xs,
    borderRadius: RodistaaSpacing.borderRadius.md,
  },
  statusBadgeText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.primary.contrast,
    fontWeight: '700',
    fontSize: 10,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  tripDetailItem: {
    flex: 1,
  },
  tripDetailLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  tripDetailValue: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
  },
  otpIndicator: {
    backgroundColor: RodistaaColors.warning.main,
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.xs,
    borderRadius: RodistaaSpacing.borderRadius.md,
  },
  otpText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.primary.contrast,
    fontWeight: '600',
  },
  otpButton: {
    marginBottom: RodistaaSpacing.md,
  },
  viewTripButton: {
    marginBottom: 0,
  },
  inspectionReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    ...RNShadowStyles.sm,
  },
  inspectionIcon: {
    fontSize: 32,
    marginRight: RodistaaSpacing.md,
  },
  inspectionContent: {
    flex: 1,
  },
  inspectionTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  inspectionText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  inspectionCheckbox: {
    width: 44,
    height: 44,
    borderRadius: RodistaaSpacing.borderRadius.md,
    borderWidth: 2,
    borderColor: RodistaaColors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.default,
  },
  checkboxText: {
    fontSize: 24,
    color: RodistaaColors.primary.main,
  },
  arrowIcon: {
    fontSize: 24,
    color: RodistaaColors.text.secondary,
  },
  tipsContainer: {
    gap: RodistaaSpacing.md,
    paddingRight: RodistaaSpacing.lg,
  },
  tipCard: {
    width: 200,
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    ...RNShadowStyles.sm,
  },
  tipText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.primary,
    textAlign: 'center',
  },
  emergencyButton: {
    backgroundColor: RodistaaColors.error.main,
  },
  bottomSpacer: {
    height: RodistaaSpacing.xxl,
  },
});

export default DriverHomeScreen;
