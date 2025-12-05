import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

export default function FleetScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const mockTrucks = [
    {
      id: 'TRK-001',
      registration: 'DL 01 AB 1234',
      type: 'Container 20ft',
      status: 'active',
      driver: 'Ramesh Kumar',
      lastInspection: '2 days ago',
    },
    {
      id: 'TRK-002',
      registration: 'HR 26 BX 5678',
      type: 'Open Body 14ft',
      status: 'pending',
      driver: 'Not Assigned',
      lastInspection: '1 week ago',
    },
    {
      id: 'TRK-003',
      registration: 'MH 12 CD 9012',
      type: 'Trailer 32ft',
      status: 'active',
      driver: 'Suresh Reddy',
      lastInspection: 'Today',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'expired': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Fleet Summary: 5/10 Trucks</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Truck</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {mockTrucks.map((truck) => (
          <View key={truck.id} style={styles.truckCard}>
            <View style={styles.truckHeader}>
              <View>
                <Text style={styles.registration}>{truck.registration}</Text>
                <Text style={styles.truckId}>{truck.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(truck.status) }]}>
                <Text style={styles.statusText}>{truck.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.truckDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{truck.type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Driver:</Text>
                <Text style={styles.detailValue}>{truck.driver}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Inspection:</Text>
                <Text style={styles.detailValue}>{truck.lastInspection}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>🔍 Inspect</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>👤 Assign Driver</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#C90D0D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  truckCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  truckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  registration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'monospace',
  },
  truckId: {
    fontSize: 12,
    color: '#6B7280',
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
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
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

