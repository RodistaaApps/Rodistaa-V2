import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock data - replace with API call
const mockShipments = [
  {
    id: 'SHP-2024-001',
    bookingId: 'BKG-2024-001',
    truck: 'TN-12-AB-1234',
    driver: 'Ramesh Kumar',
    from: 'Chennai, TN',
    to: 'Bangalore, KA',
    status: 'IN_TRANSIT',
    progress: 65,
    startDate: '2024-12-03',
    eta: '2024-12-05',
    lastUpdate: '2 hours ago',
  },
  {
    id: 'SHP-2024-002',
    bookingId: 'BKG-2024-002',
    truck: 'TN-12-CD-5678',
    driver: 'Suresh Babu',
    from: 'Bangalore, KA',
    to: 'Mumbai, MH',
    status: 'PICKUP_PENDING',
    progress: 0,
    startDate: '2024-12-05',
    eta: '2024-12-07',
    lastUpdate: '30 minutes ago',
  },
  {
    id: 'SHP-2024-003',
    bookingId: 'BKG-2024-003',
    truck: 'TN-12-GH-3456',
    driver: 'Vijay Kumar',
    from: 'Chennai, TN',
    to: 'Hyderabad, TS',
    status: 'IN_TRANSIT',
    progress: 35,
    startDate: '2024-12-02',
    eta: '2024-12-04',
    lastUpdate: '1 hour ago',
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'IN_TRANSIT':
      return { color: '#2E86DE', label: 'In Transit', icon: 'navigate' };
    case 'PICKUP_PENDING':
      return { color: '#F39C12', label: 'Pickup Pending', icon: 'time' };
    case 'DELIVERED':
      return { color: '#27AE60', label: 'Delivered', icon: 'checkmark-circle' };
    case 'DELAYED':
      return { color: '#E74C3C', label: 'Delayed', icon: 'warning' };
    default:
      return { color: '#4F4F4F', label: status, icon: 'cube' };
  }
};

export default function ShipmentsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Fetch latest shipments
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.shipmentsContainer}>
          {mockShipments.map((shipment) => {
            const statusConfig = getStatusConfig(shipment.status);
            return (
              <TouchableOpacity
                key={shipment.id}
                style={styles.shipmentCard}
                onPress={() => router.push(`/shipments/${shipment.id}`)}
              >
                {/* Header */}
                <View style={styles.shipmentHeader}>
                  <View>
                    <Text style={styles.shipmentId}>{shipment.id}</Text>
                    <Text style={styles.bookingId}>Booking: {shipment.bookingId}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig.color },
                    ]}
                  >
                    <Ionicons
                      name={statusConfig.icon as any}
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={styles.statusText}>{statusConfig.label}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                {shipment.progress > 0 && (
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
                )}

                {/* Route */}
                <View style={styles.routeContainer}>
                  <View style={styles.routePoint}>
                    <Ionicons name="location" size={18} color="#27AE60" />
                    <Text style={styles.locationText}>{shipment.from}</Text>
                  </View>
                  <Ionicons name="arrow-down" size={16} color="#D0D0D0" />
                  <View style={styles.routePoint}>
                    <Ionicons name="location" size={18} color="#C90D0D" />
                    <Text style={styles.locationText}>{shipment.to}</Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="car" size={16} color="#4F4F4F" />
                    <Text style={styles.detailText}>{shipment.truck}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={16} color="#4F4F4F" />
                    <Text style={styles.detailText}>{shipment.driver}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#4F4F4F" />
                    <Text style={styles.detailText}>
                      ETA: {shipment.eta}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#4F4F4F" />
                    <Text style={styles.detailText}>
                      Updated {shipment.lastUpdate}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/shipments/${shipment.id}/track`)}
                  >
                    <Ionicons name="navigate-circle" size={18} color="#C90D0D" />
                    <Text style={styles.actionText}>Track</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/shipments/${shipment.id}/driver`)}
                  >
                    <Ionicons name="swap-horizontal" size={18} color="#C90D0D" />
                    <Text style={styles.actionText}>Replace Driver</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  shipmentsContainer: {
    padding: 16,
  },
  shipmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shipmentId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 12,
    color: '#4F4F4F',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E86DE',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E86DE',
    minWidth: 40,
  },
  routeContainer: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 8,
    fontWeight: '500',
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  detailText: {
    fontSize: 13,
    color: '#4F4F4F',
    marginLeft: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C90D0D',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C90D0D',
  },
});

