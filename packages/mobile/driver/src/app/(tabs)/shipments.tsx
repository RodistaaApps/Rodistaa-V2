/**
 * Driver Shipments Screen
 * View assigned shipments
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Card } from '@rodistaa/mobile-shared';

export default function DriverShipmentsScreen() {
  const router = useRouter();
  
  const [shipments] = useState([
    {
      id: 'SH-001',
      route: 'Mumbai → Delhi',
      status: 'IN_TRANSIT',
      pickup: 'Mumbai Port',
      drop: 'Delhi Warehouse',
      progress: '45%',
      hasPod: false,
    },
    {
      id: 'SH-002',
      route: 'Pune → Bangalore',
      status: 'COMPLETED',
      pickup: 'Pune Industrial Area',
      drop: 'Bangalore Hub',
      progress: '100%',
      hasPod: true,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return '#FF9800';
      case 'IN_TRANSIT': return '#2196F3';
      case 'AT_DESTINATION': return '#9C27B0';
      case 'COMPLETED': return '#4CAF50';
      default: return '#666666';
    }
  };

  const renderShipment = ({ item }: any) => (
    <TouchableOpacity onPress={() => router.push(`/shipments/${item.id}`)}>
      <Card style={styles.shipmentCard}>
        <View style={styles.shipmentHeader}>
          <Text style={styles.shipmentId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.route}>{item.route}</Text>
        <View style={styles.shipmentInfo}>
          <Text style={styles.infoText}>From: {item.pickup}</Text>
          <Text style={styles.infoText}>To: {item.drop}</Text>
          <Text style={styles.infoText}>Progress: {item.progress}</Text>
          {item.hasPod && <Text style={styles.podText}>✓ POD Uploaded</Text>}
        </View>
      </Card>
    </TouchableOpacity>
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
            <Text style={styles.subtitle}>{shipments.filter(s => s.status !== 'COMPLETED').length} active</Text>
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
    fontSize: 18,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 12,
  },
  shipmentInfo: {
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
  podText: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

