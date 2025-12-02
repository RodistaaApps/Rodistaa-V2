/**
 * Fleet Management Screen
 * View and manage operator's trucks (max 10)
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Card, Button } from '@rodistaa/mobile-shared';

export default function FleetScreen() {
  const router = useRouter();
  
  // Mock trucks data
  const [trucks] = useState([
    {
      id: 'TRK-001',
      regNo: 'MH-12-AB-1234',
      status: 'ACTIVE',
      tonnage: 20,
      nextInspectionDue: '2024-12-15',
      driver: 'John Doe',
    },
    {
      id: 'TRK-002',
      regNo: 'MH-12-CD-5678',
      status: 'BLOCKED',
      tonnage: 15,
      nextInspectionDue: '2024-12-01',
      driver: null,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#4CAF50';
      case 'BLOCKED': return '#F44336';
      case 'NEEDS_INSPECTION': return '#FF9800';
      default: return '#666666';
    }
  };

  const renderTruck = ({ item }: any) => (
    <TouchableOpacity onPress={() => router.push(`/fleet/${item.id}`)}>
      <Card style={styles.truckCard}>
        <View style={styles.truckHeader}>
          <Text style={styles.regNo}>{item.regNo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.truckInfo}>
          <Text style={styles.infoText}>Tonnage: {item.tonnage}T</Text>
          <Text style={styles.infoText}>
            Inspection Due: {item.nextInspectionDue}
          </Text>
          {item.driver && <Text style={styles.infoText}>Driver: {item.driver}</Text>}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Fleet</Text>
        <Text style={styles.subtitle}>{trucks.length}/10 trucks</Text>
      </View>

      {trucks.length < 10 && (
        <Button
          title="+ Add New Truck"
          onPress={() => router.push('/fleet/add')}
          style={styles.addButton}
        />
      )}

      <FlatList
        data={trucks}
        renderItem={renderTruck}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
  addButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  truckCard: {
    marginBottom: 12,
    padding: 16,
  },
  truckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  regNo: {
    fontSize: 18,
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
  truckInfo: {
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
});

