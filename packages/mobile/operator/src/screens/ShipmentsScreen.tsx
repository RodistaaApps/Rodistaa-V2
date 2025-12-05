import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

export default function ShipmentsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const mockShipments = [
    {
      id: 'SHP-001',
      bookingId: 'BKG-002',
      status: 'in_transit',
      progress: 65,
      from: 'Delhi',
      to: 'Bangalore',
      truck: 'DL 01 AB 1234',
      driver: 'Ramesh Kumar',
      eta: '2 hours',
      lastUpdate: '15 mins ago',
    },
    {
      id: 'SHP-002',
      bookingId: 'BKG-005',
      status: 'pending',
      progress: 0,
      from: 'Mumbai',
      to: 'Pune',
      truck: 'MH 12 CD 9012',
      driver: 'Suresh Reddy',
      eta: '—',
      lastUpdate: '1 day ago',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit': return '#F59E0B';
      case 'delivered': return '#10B981';
      case 'pending': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {mockShipments.map((shipment) => (
        <View key={shipment.id} style={styles.shipmentCard}>
          <View style={styles.shipmentHeader}>
            <View>
              <Text style={styles.shipmentId}>{shipment.id}</Text>
              <Text style={styles.bookingRef}>Booking: {shipment.bookingId}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.status) }]}>
              <Text style={styles.statusText}>
                {shipment.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${shipment.progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{shipment.progress}%</Text>
          </View>

          {/* Route */}
          <View style={styles.routeContainer}>
            <Text style={styles.routeText}>
              {shipment.from} → {shipment.to}
            </Text>
          </View>

          {/* Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Truck</Text>
              <Text style={styles.detailValue}>{shipment.truck}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Driver</Text>
              <Text style={styles.detailValue}>{shipment.driver}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>ETA</Text>
              <Text style={styles.detailValue}>{shipment.eta}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Update</Text>
              <Text style={styles.detailValue}>{shipment.lastUpdate}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📍 Track</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>🔄 Replace Driver</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  shipmentCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  shipmentId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    fontFamily: 'monospace',
  },
  bookingRef: {
    fontSize: 12,
    color: '#6B7280',
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    minWidth: 40,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
});

