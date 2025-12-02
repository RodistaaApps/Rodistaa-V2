/**
 * Driver Home/Dashboard Screen
 * Overview of assigned shipments and current status
 */

import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { Card, Button } from '@rodistaa/mobile-shared';

export default function DriverHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const stats = {
    assignedShipments: 1,
    completedToday: 0,
    totalEarnings: 5000,
    currentShipment: {
      id: 'SH-001',
      route: 'Mumbai → Delhi',
      progress: '45%',
      eta: '4 hours',
    },
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#C90D0D']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Driver Dashboard</Text>
        <View style={[styles.gpsBadge, { backgroundColor: gpsActive ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.gpsText}>{gpsActive ? '● GPS Active' : '● GPS Inactive'}</Text>
        </View>
      </View>

      {stats.currentShipment && (
        <Card style={styles.currentShipmentCard}>
          <Text style={styles.cardTitle}>Current Shipment</Text>
          <Text style={styles.shipmentId}>{stats.currentShipment.id}</Text>
          <Text style={styles.route}>{stats.currentShipment.route}</Text>
          <View style={styles.progressRow}>
            <Text style={styles.label}>Progress:</Text>
            <Text style={styles.progress}>{stats.currentShipment.progress}</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.label}>ETA:</Text>
            <Text style={styles.value}>{stats.currentShipment.eta}</Text>
          </View>
          <Button
            title="View Details"
            onPress={() => {}}
            style={styles.detailsButton}
          />
        </Card>
      )}

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.assignedShipments}</Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completedToday}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>₹{stats.totalEarnings.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
  },
  gpsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gpsText: {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  currentShipmentCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFF3E0',
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginBottom: 8,
  },
  shipmentId: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  route: {
    fontSize: 18,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#333333',
  },
  progress: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#C90D0D',
  },
  detailsButton: {
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    color: '#666666',
    textAlign: 'center',
  },
});

