/**
 * Operator Shipments Screen
 * View active and completed shipments
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Card } from '@rodistaa/mobile-shared';

export default function OperatorShipmentsScreen() {
  const [shipments] = useState([
    {
      id: 'SH-001',
      bookingId: 'RID-20241201-0001',
      route: 'Mumbai → Delhi',
      truck: 'MH-12-AB-1234',
      driver: 'John Doe',
      status: 'IN_TRANSIT',
      progress: '45%',
    },
    {
      id: 'SH-002',
      bookingId: 'RID-20241130-0025',
      route: 'Pune → Bangalore',
      truck: 'MH-12-CD-5678',
      driver: 'Jane Smith',
      status: 'COMPLETED',
      progress: '100%',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT': return '#2196F3';
      case 'COMPLETED': return '#4CAF50';
      case 'ASSIGNED': return '#FF9800';
      default: return '#666666';
    }
  };

  const renderShipment = ({ item }: any) => (
    <Card style={styles.shipmentCard}>
      <View style={styles.shipmentHeader}>
        <Text style={styles.shipmentId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.route}>{item.route}</Text>
      <View style={styles.shipmentInfo}>
        <Text style={styles.infoText}>Truck: {item.truck}</Text>
        <Text style={styles.infoText}>Driver: {item.driver}</Text>
        <Text style={styles.infoText}>Progress: {item.progress}</Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={shipments}
        renderItem={renderShipment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>My Shipments</Text>
            <Text style={styles.subtitle}>{shipments.length} total</Text>
          </View>
        }
      />
    </View>
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
    fontSize: 24,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  shipmentCard: {
    marginBottom: 12,
    padding: 16,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shipmentId: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  route: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    color: '#C90D0D',
    marginBottom: 12,
  },
  shipmentInfo: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
});

