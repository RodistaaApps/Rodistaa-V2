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

export default function ShipmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock data - replace with API call
  const shipment = {
    id,
    bookingId: 'BKG-2024-001',
    route: 'Mumbai → Delhi',
    status: 'IN_TRANSIT',
    pickup: {
      address: 'Mumbai Port, Gate 5',
      contact: 'Ramesh Kumar',
      phone: '+91 9876543210',
      date: '2024-12-04 08:00 AM',
    },
    drop: {
      address: 'Delhi Warehouse, Sector 18',
      contact: 'Suresh Patel',
      phone: '+91 9876543211',
      date: '2024-12-05 06:00 PM',
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

  const getStatusConfig = () => {
    switch (shipment.status) {
      case 'ASSIGNED':
        return { color: '#F39C12', label: 'Assigned', icon: 'time' };
      case 'IN_TRANSIT':
        return { color: '#2E86DE', label: 'In Transit', icon: 'navigate' };
      case 'AT_DESTINATION':
        return { color: '#9C27B0', label: 'At Destination', icon: 'location' };
      case 'COMPLETED':
        return { color: '#27AE60', label: 'Completed', icon: 'checkmark-circle' };
      default:
        return { color: '#4F4F4F', label: shipment.status, icon: 'cube' };
    }
  };

  const statusConfig = getStatusConfig();

  const handleStartTrip = () => {
    Alert.alert(
      'Start Trip',
      'Are you sure you want to start this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            // Start GPS tracking
            Alert.alert('Success', 'Trip started! GPS tracking enabled.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.shipmentId}>{shipment.id}</Text>
            <Text style={styles.bookingId}>Booking: {shipment.bookingId}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}
          >
            <Ionicons name={statusConfig.icon as any} size={14} color="#FFFFFF" />
            <Text style={styles.statusText}>{statusConfig.label}</Text>
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
      </View>

      {/* Pickup Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={24} color="#27AE60" />
          <Text style={styles.sectionTitle}>Pickup Location</Text>
        </View>
        <View style={styles.locationCard}>
          <Text style={styles.address}>{shipment.pickup.address}</Text>
          <View style={styles.contactRow}>
            <Ionicons name="person" size={16} color="#4F4F4F" />
            <Text style={styles.contactText}>{shipment.pickup.contact}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call" size={16} color="#4F4F4F" />
            <Text style={styles.contactText}>{shipment.pickup.phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="time" size={16} color="#4F4F4F" />
            <Text style={styles.contactText}>{shipment.pickup.date}</Text>
          </View>
        </View>
        {!shipment.needsPickupPhotos && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
            <Text style={styles.completedText}>Pickup photos uploaded</Text>
          </View>
        )}
      </View>

      {/* Drop Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={24} color="#C90D0D" />
          <Text style={styles.sectionTitle}>Drop Location</Text>
        </View>
        <View style={styles.locationCard}>
          <Text style={styles.address}>{shipment.drop.address}</Text>
          <View style={styles.contactRow}>
            <Ionicons name="person" size={16} color="#4F4F4F" />
            <Text style={styles.contactText}>{shipment.drop.contact}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call" size={16} color="#4F4F4F" />
            <Text style={styles.contactText}>{shipment.drop.phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="time" size={16} color="#4F4F4F" />
            <Text style={styles.contactText}>{shipment.drop.date}</Text>
          </View>
        </View>
      </View>

      {/* Shipment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipment Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="car" size={20} color="#4F4F4F" />
            <Text style={styles.detailLabel}>Truck:</Text>
            <Text style={styles.detailValue}>{shipment.truck}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cube" size={20} color="#4F4F4F" />
            <Text style={styles.detailLabel}>Weight:</Text>
            <Text style={styles.detailValue}>{shipment.weight}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="navigate" size={20} color="#4F4F4F" />
            <Text style={styles.detailLabel}>Distance:</Text>
            <Text style={styles.detailValue}>{shipment.distance}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {shipment.status === 'ASSIGNED' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleStartTrip}
          >
            <Ionicons name="play-circle" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Start Trip</Text>
          </TouchableOpacity>
        )}

        {shipment.status === 'IN_TRANSIT' && (
          <>
            {shipment.needsDropPhotos && (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => router.push(`/shipments/${id}/photos`)}
              >
                <Ionicons name="camera" size={24} color="#C90D0D" />
                <Text style={styles.secondaryButtonText}>Capture Drop Photos</Text>
              </TouchableOpacity>
            )}
            {shipment.needsPOD && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => router.push(`/shipments/${id}/pod`)}
              >
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Upload POD</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {shipment.needsOTP && !shipment.needsPOD && (
          <TouchableOpacity
            style={[styles.actionButton, styles.successButton]}
            onPress={() => router.push(`/shipments/${id}/complete`)}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Complete Delivery</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => {
            Alert.alert('Report Issue', 'Feature coming soon');
          }}
        >
          <Ionicons name="warning" size={24} color="#C90D0D" />
          <Text style={styles.secondaryButtonText}>Report Delay/Issue</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  shipmentId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 12,
    color: '#4F4F4F',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  route: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E86DE',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E86DE',
    minWidth: 45,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#4F4F4F',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#4F4F4F',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#C90D0D',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C90D0D',
  },
  successButton: {
    backgroundColor: '#27AE60',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C90D0D',
  },
});
