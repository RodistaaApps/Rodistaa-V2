/**
 * Shipment Detail Screen - Uses design system and Timeline component
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RCard, RButton, Timeline, TimelineEvent } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system';

export default function ShipmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const shipment = {
    id,
    bookingId: 'BKG-2024-001',
    route: 'Mumbai → Delhi',
    status: 'IN_TRANSIT' as const,
    pickup: {
      address: 'Mumbai Port, Gate 5',
      contact: 'Ramesh Kumar',
      phone: '+91 9876543210',
      date: '2024-12-04T08:00:00Z',
    },
    drop: {
      address: 'Delhi Warehouse, Sector 18',
      contact: 'Suresh Patel',
      phone: '+91 9876543211',
      date: '2024-12-05T18:00:00Z',
    },
    truck: 'TN-12-AB-1234',
    weight: '10 tons',
    distance: '1,400 km',
    progress: 45,
    needsPickupPhotos: false,
    needsDropPhotos: true,
    needsPOD: true,
    needsOTP: true,
  };

  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Shipment Assigned',
      description: 'Assigned to driver',
      timestamp: '2024-12-03T10:00:00Z',
      status: 'completed',
    },
    {
      id: '2',
      title: 'Pickup Completed',
      description: 'Photos uploaded',
      timestamp: '2024-12-04T08:30:00Z',
      status: 'completed',
    },
    {
      id: '3',
      title: 'In Transit',
      description: 'On route to destination',
      timestamp: '2024-12-04T09:00:00Z',
      status: 'active',
    },
    {
      id: '4',
      title: 'Drop Off',
      description: 'Expected arrival',
      timestamp: shipment.drop.date,
      status: 'pending',
    },
  ];

  const handleStartTrip = () => {
    Alert.alert(
      'Start Trip',
      'Are you sure you want to start this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            Alert.alert('Success', 'Trip started! GPS tracking enabled.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <RCard style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.shipmentId}>{shipment.id}</Text>
            <Text style={styles.bookingId}>Booking: {shipment.bookingId}</Text>
          </View>
        </View>

        <Text style={styles.route}>{shipment.route}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${shipment.progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{shipment.progress}%</Text>
        </View>
      </RCard>

      {/* Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Timeline</Text>
        <Timeline events={timelineEvents} />
      </View>

      {/* Pickup Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={24} color={RodistaaColors.success.main} />
          <Text style={styles.sectionTitle}>Pickup Location</Text>
        </View>
        <RCard style={styles.locationCard}>
          <Text style={styles.address}>{shipment.pickup.address}</Text>
          <View style={styles.contactRow}>
            <Ionicons name="person" size={16} color={RodistaaColors.text.secondary} />
            <Text style={styles.contactText}>{shipment.pickup.contact}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call" size={16} color={RodistaaColors.text.secondary} />
            <Text style={styles.contactText}>{shipment.pickup.phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="time" size={16} color={RodistaaColors.text.secondary} />
            <Text style={styles.contactText}>
              {new Date(shipment.pickup.date).toLocaleString('en-IN')}
            </Text>
          </View>
        </RCard>
        {!shipment.needsPickupPhotos && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={RodistaaColors.success.main} />
            <Text style={styles.completedText}>Pickup photos uploaded</Text>
          </View>
        )}
      </View>

      {/* Drop Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={24} color={RodistaaColors.error.main} />
          <Text style={styles.sectionTitle}>Drop Location</Text>
        </View>
        <RCard style={styles.locationCard}>
          <Text style={styles.address}>{shipment.drop.address}</Text>
          <View style={styles.contactRow}>
            <Ionicons name="person" size={16} color={RodistaaColors.text.secondary} />
            <Text style={styles.contactText}>{shipment.drop.contact}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call" size={16} color={RodistaaColors.text.secondary} />
            <Text style={styles.contactText}>{shipment.drop.phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="time" size={16} color={RodistaaColors.text.secondary} />
            <Text style={styles.contactText}>
              {new Date(shipment.drop.date).toLocaleString('en-IN')}
            </Text>
          </View>
        </RCard>
      </View>

      {/* Shipment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipment Details</Text>
        <RCard style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="car" size={20} color={RodistaaColors.text.secondary} />
            <Text style={styles.detailLabel}>Truck:</Text>
            <Text style={styles.detailValue}>{shipment.truck}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cube" size={20} color={RodistaaColors.text.secondary} />
            <Text style={styles.detailLabel}>Weight:</Text>
            <Text style={styles.detailValue}>{shipment.weight}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="navigate" size={20} color={RodistaaColors.text.secondary} />
            <Text style={styles.detailLabel}>Distance:</Text>
            <Text style={styles.detailValue}>{shipment.distance}</Text>
          </View>
        </RCard>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {shipment.status === 'ASSIGNED' && (
          <RButton
            title="Start Trip"
            variant="primary"
            onPress={handleStartTrip}
            icon={<Ionicons name="play-circle" size={20} color={RodistaaColors.primary.contrast} />}
          />
        )}

        {shipment.status === 'IN_TRANSIT' && (
          <>
            {shipment.needsDropPhotos && (
              <RButton
                title="Capture Drop Photos"
                variant="secondary"
                onPress={() => router.push(`/shipments/${id}/photos`)}
                icon={<Ionicons name="camera" size={20} color={RodistaaColors.primary.main} />}
                style={styles.actionButton}
              />
            )}
            {shipment.needsPOD && (
              <RButton
                title="Upload POD"
                variant="primary"
                onPress={() => router.push(`/shipments/${id}/pod`)}
                icon={<Ionicons name="document-text" size={20} color={RodistaaColors.primary.contrast} />}
                style={styles.actionButton}
              />
            )}
          </>
        )}

        {shipment.needsOTP && !shipment.needsPOD && (
          <RButton
            title="Complete Delivery"
            variant="success"
            onPress={() => router.push(`/shipments/${id}/complete`)}
            icon={<Ionicons name="checkmark-circle" size={20} color={RodistaaColors.success.contrast} />}
            style={styles.actionButton}
          />
        )}

        <RButton
          title="Report Delay/Issue"
          variant="secondary"
          onPress={() => Alert.alert('Report Issue', 'Feature coming soon')}
          icon={<Ionicons name="warning" size={20} color={RodistaaColors.error.main} />}
          style={styles.actionButton}
        />
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
  headerCard: {
    padding: RodistaaSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: RodistaaSpacing.lg,
  },
  shipmentId: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  bookingId: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
  },
  route: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.primary.main,
    marginBottom: RodistaaSpacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: RodistaaColors.border.light,
    borderRadius: RodistaaSpacing.borderRadius.sm,
    overflow: 'hidden',
    marginRight: RodistaaSpacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: RodistaaColors.info.main,
    borderRadius: RodistaaSpacing.borderRadius.sm,
  },
  progressText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.info.main,
    minWidth: 45,
  },
  section: {
    padding: RodistaaSpacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
    gap: RodistaaSpacing.sm,
  },
  sectionTitle: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
  },
  locationCard: {
    padding: RodistaaSpacing.lg,
    ...RNShadowStyles.sm,
  },
  address: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.sm,
    gap: RodistaaSpacing.sm,
  },
  contactText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.success.light,
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.sm,
    borderRadius: RodistaaSpacing.borderRadius.md,
    marginTop: RodistaaSpacing.md,
    gap: RodistaaSpacing.xs,
  },
  completedText: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.success.main,
  },
  detailsCard: {
    padding: RodistaaSpacing.lg,
    gap: RodistaaSpacing.md,
    ...RNShadowStyles.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RodistaaSpacing.md,
  },
  detailLabel: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    minWidth: 80,
  },
  detailValue: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    flex: 1,
  },
  actionsContainer: {
    padding: RodistaaSpacing.lg,
    gap: RodistaaSpacing.md,
  },
  actionButton: {
    marginBottom: RodistaaSpacing.sm,
  },
});
