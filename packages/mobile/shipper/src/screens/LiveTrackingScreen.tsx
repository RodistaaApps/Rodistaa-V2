/**
 * Live Tracking Screen - Track Shipment Location
 * Pure React Native CLI component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { RCard } from '@rodistaa/design-system';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { apiClient } from '@rodistaa/mobile-shared';

export interface LiveTrackingScreenProps {
  navigation: any;
}

interface TrackingData {
  shipmentId: string;
  currentLocation: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  status: 'in_transit' | 'delivered' | 'delayed';
  progress: number; // 0-100
  eta: string;
  driverName: string;
  driverPhone: string;
  truckNumber: string;
  lastUpdate: string;
}

export const LiveTrackingScreen: React.FC<LiveTrackingScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const shipmentId = (route.params as any)?.id || '';
  const [mapVisible, setMapVisible] = useState(false);

  const { data: tracking, isLoading } = useQuery<TrackingData>({
    queryKey: ['tracking', shipmentId],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // return await apiClient.get(`/shipments/${shipmentId}/tracking`);
      
      // Mock data
      return {
        shipmentId,
        currentLocation: {
          lat: 17.3850,
          lng: 78.4867,
          address: 'Hyderabad, Telangana',
        },
        destination: {
          lat: 19.0760,
          lng: 72.8777,
          address: 'Mumbai, Maharashtra',
        },
        status: 'in_transit',
        progress: 65,
        eta: '2 hours',
        driverName: 'Ramesh Kumar',
        driverPhone: '9876543212',
        truckNumber: 'DL 01 AB 1234',
        lastUpdate: new Date().toISOString(),
      };
    },
    enabled: !!shipmentId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // TODO: Integrate with actual map component (react-native-maps)
  const renderMapPlaceholder = () => (
    <View style={styles.mapPlaceholder}>
      <Text style={styles.mapPlaceholderText}>📍</Text>
      <Text style={styles.mapPlaceholderLabel}>Map View</Text>
      <Text style={styles.mapPlaceholderHint}>
        {tracking?.currentLocation.address || 'Loading location...'}
      </Text>
      <Text style={styles.mapPlaceholderNote}>
        Note: Google Maps API key required for live map view
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={RodistaaColors.primary.main} />
        <Text style={styles.loadingText}>Loading tracking data...</Text>
      </View>
    );
  }

  if (!tracking) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Tracking data not available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        {renderMapPlaceholder()}
      </View>

      <RCard style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.shipmentId}>Shipment: {tracking.shipmentId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tracking.status) }]}>
            <Text style={styles.statusText}>{tracking.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${tracking.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{tracking.progress}% Complete</Text>
        </View>

        <View style={styles.routeSection}>
          <View style={styles.routePoint}>
            <View style={styles.routeDot} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Current Location</Text>
              <Text style={styles.routeText}>{tracking.currentLocation.address}</Text>
              <Text style={styles.routeTime}>Last updated: {formatTime(tracking.lastUpdate)}</Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotDestination]} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Destination</Text>
              <Text style={styles.routeText}>{tracking.destination.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ETA</Text>
            <Text style={styles.detailValue}>{tracking.eta}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Truck</Text>
            <Text style={styles.detailValue}>{tracking.truckNumber}</Text>
          </View>
        </View>
      </RCard>

      <RCard style={styles.card}>
        <Text style={styles.sectionTitle}>Driver Information</Text>
        <View style={styles.driverInfo}>
          <View style={styles.driverDetail}>
            <Text style={styles.driverLabel}>Name</Text>
            <Text style={styles.driverValue}>{tracking.driverName}</Text>
          </View>
          <View style={styles.driverDetail}>
            <Text style={styles.driverLabel}>Phone</Text>
            <Text style={styles.driverValue}>{maskPhone(tracking.driverPhone)}</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => {
              // TODO: Open dialer
              console.log('Call driver:', tracking.driverPhone);
            }}
            accessibilityLabel="Call driver"
          >
            <Text style={styles.callButtonText}>📞 Call Driver</Text>
          </TouchableOpacity>
        </View>
      </RCard>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_transit': return RodistaaColors.info.main;
    case 'delivered': return RodistaaColors.success.main;
    case 'delayed': return RodistaaColors.warning.main;
    default: return RodistaaColors.text.secondary;
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const maskPhone = (phone: string) => {
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, '+91 $1****$3');
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
  errorText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.error.main,
  },
  mapContainer: {
    height: 300,
    backgroundColor: RodistaaColors.background.paper,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.default,
  },
  mapPlaceholderText: {
    fontSize: 64,
    marginBottom: RodistaaSpacing.md,
  },
  mapPlaceholderLabel: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  mapPlaceholderHint: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: RodistaaSpacing.xl,
  },
  mapPlaceholderNote: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
    marginTop: RodistaaSpacing.md,
    textAlign: 'center',
    paddingHorizontal: RodistaaSpacing.xl,
    fontStyle: 'italic',
  },
  card: {
    margin: RodistaaSpacing.lg,
    padding: RodistaaSpacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.lg,
  },
  shipmentId: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.xs,
    borderRadius: RodistaaSpacing.borderRadius.sm,
  },
  statusText: {
    ...MobileTextStyles.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: RodistaaSpacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: RodistaaColors.border.light,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: RodistaaSpacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: RodistaaColors.success.main,
  },
  progressText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    textAlign: 'right',
  },
  routeSection: {
    marginBottom: RodistaaSpacing.lg,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: RodistaaColors.primary.main,
    marginRight: RodistaaSpacing.md,
    marginTop: 4,
  },
  routeDotDestination: {
    backgroundColor: RodistaaColors.success.main,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  routeText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  routeTime: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: RodistaaColors.border.light,
    marginLeft: 5,
    marginVertical: RodistaaSpacing.xs,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: RodistaaSpacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  detailValue: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
  },
  sectionTitle: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  driverInfo: {
    gap: RodistaaSpacing.md,
  },
  driverDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: RodistaaSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  driverLabel: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
  },
  driverValue: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
  },
  callButton: {
    backgroundColor: RodistaaColors.primary.main,
    paddingVertical: RodistaaSpacing.md,
    borderRadius: RodistaaSpacing.borderRadius.md,
    alignItems: 'center',
    marginTop: RodistaaSpacing.sm,
  },
  callButtonText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.primary.contrast,
  },
});

