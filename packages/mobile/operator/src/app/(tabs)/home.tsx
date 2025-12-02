/**
 * Operator Home/Dashboard Screen
 * Overview of operator's business metrics
 */

import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { Card } from '@rodistaa/mobile-shared';

export default function OperatorHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch latest data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const stats = {
    activeTrucks: 5,
    activeBids: 3,
    activeShipments: 2,
    ledgerBalance: 15000,
    pendingInspections: 1,
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#C90D0D']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Operator Overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeTrucks}</Text>
          <Text style={styles.statLabel}>Active Trucks</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeBids}</Text>
          <Text style={styles.statLabel}>Active Bids</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeShipments}</Text>
          <Text style={styles.statLabel}>Active Shipments</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>₹{stats.ledgerBalance.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Ledger Balance</Text>
        </Card>
      </View>

      <Card style={styles.alertCard}>
        <Text style={styles.alertTitle}>⚠️ Inspections Due</Text>
        <Text style={styles.alertText}>
          {stats.pendingInspections} truck(s) require inspection within 7 days
        </Text>
      </Card>

      <Card style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.actionItem}>• View available bookings</Text>
        <Text style={styles.actionItem}>• Add new truck</Text>
        <Text style={styles.actionItem}>• Manage fleet</Text>
        <Text style={styles.actionItem}>• Check bid status</Text>
      </Card>
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
  },
  title: {
    fontSize: 28,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    textAlign: 'center',
  },
  alertCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    backgroundColor: '#FFF3E0',
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
  quickActionsCard: {
    margin: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  actionItem: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginBottom: 8,
  },
});

