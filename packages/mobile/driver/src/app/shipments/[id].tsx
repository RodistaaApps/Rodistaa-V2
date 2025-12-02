/**
 * Driver Shipment Details Screen
 * View shipment details, upload POD, complete delivery
 */

import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button } from '@rodistaa/mobile-shared';

export default function DriverShipmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [gpsActive, setGpsActive] = useState(false);

  const shipment = {
    id,
    route: 'Mumbai → Delhi',
    status: 'IN_TRANSIT',
    pickup: {
      address: 'Mumbai Port, Gate 5',
      contact: '+91 98765 43210',
    },
    drop: {
      address: 'Delhi Warehouse, Sector 12',
      contact: '+91 98123 45678',
    },
    truck: 'MH-12-AB-1234',
    progress: '45%',
    hasPod: false,
  };

  const handleStartShipment = () => {
    setGpsActive(true);
    Alert.alert('Shipment Started', 'GPS tracking is now active');
  };

  const handleUploadPOD = () => {
    router.push(`/shipments/${id}/pod`);
  };

  const handleComplete = () => {
    router.push(`/shipments/${id}/complete`);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.shipmentId}>{shipment.id}</Text>
          <View style={[styles.gpsBadge, { backgroundColor: gpsActive ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.gpsText}>{gpsActive ? '● GPS Active' : '● GPS Inactive'}</Text>
          </View>
        </View>
        <Text style={styles.route}>{shipment.route}</Text>
        <Text style={styles.progress}>Progress: {shipment.progress}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Pickup Location</Text>
        <Text style={styles.address}>{shipment.pickup.address}</Text>
        <Text style={styles.contact}>Contact: {shipment.pickup.contact}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Drop Location</Text>
        <Text style={styles.address}>{shipment.drop.address}</Text>
        <Text style={styles.contact}>Contact: {shipment.drop.contact}</Text>
      </Card>

      <View style={styles.actions}>
        {shipment.status === 'ASSIGNED' && (
          <Button
            title="Start Shipment"
            onPress={handleStartShipment}
            style={styles.actionButton}
          />
        )}

        {shipment.status === 'IN_TRANSIT' && !shipment.hasPod && (
          <Button
            title="Upload POD"
            onPress={handleUploadPOD}
            style={styles.actionButton}
          />
        )}

        {shipment.hasPod && (
          <Button
            title="Complete Delivery"
            onPress={handleComplete}
            style={styles.actionButton}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFF3E0',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shipmentId: {
    fontSize: 16,
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
  route: {
    fontSize: 20,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 8,
  },
  progress: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#333333',
    marginBottom: 8,
  },
  contact: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
  actions: {
    padding: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
});

