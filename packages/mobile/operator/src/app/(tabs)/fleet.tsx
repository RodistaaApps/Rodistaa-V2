import React from 'react';
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
import { useState } from 'react';

// Mock data - replace with API call
const mockTrucks = [
  {
    id: '1',
    registration: 'TN-12-AB-1234',
    type: 'Container 20ft',
    status: 'ACTIVE',
    lastInspection: '2024-12-04',
    driver: 'Ramesh Kumar',
  },
  {
    id: '2',
    registration: 'TN-12-CD-5678',
    type: 'Container 40ft',
    status: 'ACTIVE',
    lastInspection: '2024-12-03',
    driver: 'Suresh Babu',
  },
  {
    id: '3',
    registration: 'TN-12-EF-9012',
    type: 'Flatbed',
    status: 'PENDING_INSPECTION',
    lastInspection: '2024-12-02',
    driver: null,
  },
  {
    id: '4',
    registration: 'TN-12-GH-3456',
    type: 'Container 20ft',
    status: 'ACTIVE',
    lastInspection: '2024-12-04',
    driver: 'Vijay Kumar',
  },
  {
    id: '5',
    registration: 'TN-12-IJ-7890',
    type: 'Open Body',
    status: 'EXPIRED_DOCS',
    lastInspection: '2024-11-30',
    driver: null,
  },
];

export default function FleetScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Fetch latest trucks
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#27AE60';
      case 'PENDING_INSPECTION':
        return '#F39C12';
      case 'EXPIRED_DOCS':
        return '#E74C3C';
      default:
        return '#4F4F4F';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PENDING_INSPECTION':
        return 'Pending Inspection';
      case 'EXPIRED_DOCS':
        return 'Expired Documents';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Fleet</Text>
          <Text style={styles.headerSubtitle}>
            {mockTrucks.length} / 10 Trucks
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/fleet/add')}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Truck</Text>
        </TouchableOpacity>

        <View style={styles.trucksContainer}>
          {mockTrucks.map((truck) => (
            <TouchableOpacity
              key={truck.id}
              style={styles.truckCard}
              onPress={() => router.push(`/fleet/${truck.id}`)}
            >
              <View style={styles.truckHeader}>
                <View style={styles.truckIconContainer}>
                  <Ionicons name="car" size={32} color="#C90D0D" />
                </View>
                <View style={styles.truckInfo}>
                  <Text style={styles.truckRegistration}>
                    {truck.registration}
                  </Text>
                  <Text style={styles.truckType}>{truck.type}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(truck.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusLabel(truck.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.truckDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="person" size={16} color="#4F4F4F" />
                  <Text style={styles.detailText}>
                    {truck.driver || 'No driver assigned'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#4F4F4F" />
                  <Text style={styles.detailText}>
                    Last Inspection: {truck.lastInspection}
                  </Text>
                </View>
              </View>

              <View style={styles.truckActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/inspection/${truck.id}`)}
                >
                  <Ionicons name="camera" size={18} color="#C90D0D" />
                  <Text style={styles.actionButtonText}>Inspect</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/fleet/${truck.id}/assign-driver`)}
                >
                  <Ionicons name="person-add" size={18} color="#C90D0D" />
                  <Text style={styles.actionButtonText}>Assign Driver</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
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
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4F4F4F',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C90D0D',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  trucksContainer: {
    padding: 16,
    paddingTop: 0,
  },
  truckCard: {
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
  truckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  truckIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  truckInfo: {
    flex: 1,
  },
  truckRegistration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  truckType: {
    fontSize: 14,
    color: '#4F4F4F',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  truckDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4F4F4F',
    marginLeft: 8,
  },
  truckActions: {
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
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C90D0D',
    marginLeft: 6,
  },
});

