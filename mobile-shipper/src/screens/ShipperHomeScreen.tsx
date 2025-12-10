/**
 * Shipper Home Screen - Enhanced Dashboard
 * Pure React Native CLI - Uses Rodistaa Design System
 * Features: KPIs, Recent Loads, Suggested Price, Notifications, Quick Actions
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
  activePostings: number;
  openBids: number;
  shipmentsInTransit: number;
  spend30d: number;
  recentLoads: Array<{
    id: string;
    route: string;
    postedTime: string;
    lowestBid: number;
    autoFinalizeCountdown?: number;
  }>;
  suggestedPrice?: {
    min: number;
    max: number;
    confidence: number;
  };
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
  }>;
}

interface ShipperHomeScreenProps {
  navigation: any;
}

export const ShipperHomeScreen: React.FC<ShipperHomeScreenProps> = ({ navigation }) => {
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['shipper-dashboard'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/mobile/v1/dashboard/shipper');
      // return response.data;
      
      // Mock data for now
      return {
        activePostings: 5,
        openBids: 12,
        shipmentsInTransit: 3,
        spend30d: 45000,
        recentLoads: [
          {
            id: 'BK001',
            route: 'Mumbai → Delhi',
            postedTime: '2 hours ago',
            lowestBid: 25000,
            autoFinalizeCountdown: 43200, // seconds
          },
          {
            id: 'BK002',
            route: 'Bangalore → Hyderabad',
            postedTime: '5 hours ago',
            lowestBid: 18000,
            autoFinalizeCountdown: 75600,
          },
        ],
        suggestedPrice: {
          min: 20000,
          max: 28000,
          confidence: 85,
        },
        notifications: [
          {
            id: 'N1',
            title: 'New Bid Received',
            message: '3 operators bid on BK001',
            type: 'info',
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

  const formatCountdown = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 1000).toFixed(amount >= 1000 ? 1 : 0)}${amount >= 1000 ? 'K' : ''}`;
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
        title="Hyderabad"
        subtitle="260 km from selected load"
        showProfileAvatar={true}
        showMenu={true}
        notificationCount={dashboardData?.notifications?.length || 0}
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
              icon="📋"
              value={dashboardData?.activePostings || 0}
              label="Active Postings"
              backgroundColor="#DBEAFE"
              onPress={() => navigation.navigate('MyPostings')}
              style={styles.kpiCard}
            />
            <RMetricCard
              icon="💰"
              value={dashboardData?.openBids || 0}
              label="Open Bids"
              backgroundColor="#D1FAE5"
              style={styles.kpiCard}
            />
            <RMetricCard
              icon="🚚"
              value={dashboardData?.shipmentsInTransit || 0}
              label="In Transit"
              backgroundColor="#FEF3C7"
              style={styles.kpiCard}
            />
            <RMetricCard
              icon="💵"
              value={formatCurrency(dashboardData?.spend30d || 0)}
              label="Spend (30d)"
              backgroundColor="#FED7AA"
              style={styles.kpiCard}
            />
          </ScrollView>
        </View>

        {/* Suggested Price Widget */}
        {dashboardData?.suggestedPrice && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Suggested Price (AI)</Text>
            <View style={styles.suggestedPriceCard}>
              <View style={styles.priceRange}>
                <Text style={styles.priceLabel}>Range</Text>
                <Text style={styles.priceValue}>
                  {formatCurrency(dashboardData.suggestedPrice.min)} - {formatCurrency(dashboardData.suggestedPrice.max)}
                </Text>
                <Text style={styles.confidenceText}>
                  {dashboardData.suggestedPrice.confidence}% confidence
                </Text>
              </View>
              <RActionButton
                label="Use Suggestion"
                icon="✓"
                variant="primary"
                size="small"
                onPress={() => {
                  // Handle use suggestion
                }}
                style={styles.useSuggestionButton}
              />
            </View>
          </View>
        )}

        {/* Recent Loads */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Loads</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyPostings')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {dashboardData?.recentLoads && dashboardData.recentLoads.length > 0 ? (
            dashboardData.recentLoads.slice(0, 5).map((load) => (
              <RListCard
                key={load.id}
                title={load.id}
                subtitle={load.route}
                metadata={`Posted ${load.postedTime} • Lowest: ${formatCurrency(load.lowestBid)}`}
                badge={load.autoFinalizeCountdown ? formatCountdown(load.autoFinalizeCountdown) : undefined}
                badgeColor={RodistaaColors.warning.main}
                rightContent={
                  <Text style={styles.arrowIcon}>›</Text>
                }
                onPress={() => navigation.navigate('BookingDetail', { id: load.id })}
                testID={`load-${load.id}`}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent loads</Text>
              <RActionButton
                label="Post Your First Load"
                icon="➕"
                variant="primary"
                onPress={() => navigation.navigate('PostLoad')}
                style={styles.emptyStateButton}
              />
            </View>
          )}
        </View>

        {/* Notifications & Alerts */}
        {dashboardData?.notifications && dashboardData.notifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
            {dashboardData.notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  {
                    borderLeftColor:
                      notification.type === 'error'
                        ? RodistaaColors.error.main
                        : notification.type === 'warning'
                        ? RodistaaColors.warning.main
                        : RodistaaColors.info.main,
                  },
                ]}
              >
                <Text style={styles.notificationIcon}>
                  {notification.type === 'error' ? '❌' : notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                </Text>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <RActionButton
            label="Post Load"
            icon="➕"
            variant="primary"
            fullWidth
            onPress={() => navigation.navigate('PostLoad')}
            style={styles.quickActionButton}
          />
          <RActionButton
            label="View Ledger"
            icon="📊"
            variant="outline"
            fullWidth
            onPress={() => navigation.navigate('Payments')}
            style={styles.quickActionButton}
          />
          <RActionButton
            label="Request Support"
            icon="🆘"
            variant="outline"
            fullWidth
            onPress={() => {
              // Handle support request
            }}
            style={styles.quickActionButton}
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
  suggestedPriceCard: {
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    ...RNShadowStyles.sm,
  },
  priceRange: {
    marginBottom: RodistaaSpacing.md,
  },
  priceLabel: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  priceValue: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  confidenceText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.tertiary,
  },
  useSuggestionButton: {
    marginTop: RodistaaSpacing.sm,
  },
  arrowIcon: {
    fontSize: 24,
    color: RodistaaColors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: RodistaaSpacing.xxl,
  },
  emptyStateText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.lg,
  },
  emptyStateButton: {
    marginTop: RodistaaSpacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    marginBottom: RodistaaSpacing.md,
    borderLeftWidth: 4,
    ...RNShadowStyles.sm,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: RodistaaSpacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  notificationMessage: {
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

export default ShipperHomeScreen;
