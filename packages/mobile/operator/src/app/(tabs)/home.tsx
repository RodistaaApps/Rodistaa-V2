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

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Fetch latest data
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, Operator!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-IN')}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="car" size={32} color="#C90D0D" />
          </View>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Active Trucks</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="cube" size={32} color="#C90D0D" />
          </View>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Active Shipments</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="list" size={32} color="#C90D0D" />
          </View>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Active Bids</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle" size={32} color="#27AE60" />
          </View>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Pending Inspections</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/fleet/add')}
        >
          <Ionicons name="add-circle" size={24} color="#C90D0D" />
          <Text style={styles.actionText}>Add New Truck</Text>
          <Ionicons name="chevron-forward" size={24} color="#4F4F4F" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/bookings')}
        >
          <Ionicons name="search" size={24} color="#C90D0D" />
          <Text style={styles.actionText}>Browse Bookings</Text>
          <Ionicons name="chevron-forward" size={24} color="#4F4F4F" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/inspection/daily')}
        >
          <Ionicons name="camera" size={24} color="#C90D0D" />
          <Text style={styles.actionText}>Daily Inspection</Text>
          <Ionicons name="chevron-forward" size={24} color="#4F4F4F" />
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Ionicons name="cube" size={20} color="#27AE60" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Shipment Started</Text>
            <Text style={styles.activityDescription}>
              TN-12-AB-1234 started shipment to Chennai
            </Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>

        <View style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#2E86DE" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Bid Accepted</Text>
            <Text style={styles.activityDescription}>
              Your bid for BKG-2024-001 was accepted
            </Text>
            <Text style={styles.activityTime}>5 hours ago</Text>
          </View>
        </View>

        <View style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Ionicons name="car" size={20} color="#C90D0D" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Inspection Completed</Text>
            <Text style={styles.activityDescription}>
              Daily inspection for TN-12-CD-5678 completed
            </Text>
            <Text style={styles.activityTime}>1 day ago</Text>
          </View>
        </View>
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
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#4F4F4F',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#4F4F4F',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
    fontWeight: '500',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#4F4F4F',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999999',
  },
});

