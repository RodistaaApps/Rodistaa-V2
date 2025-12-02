/**
 * Truck Details Screen
 * View and manage individual truck details
 */

import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button } from '@rodistaa/mobile-shared';

export default function TruckDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Mock truck data
  const truck = {
    id,
    regNo: 'MH-12-AB-1234',
    modelYear: 2020,
    bsType: 'BS6',
    tonnage: 20,
    status: 'ACTIVE',
    lastInspectionAt: '2024-11-01',
    nextInspectionDue: '2024-12-15',
    documents: {
      rcExpiry: '2025-06-30',
      fitnessExpiry: '2025-03-15',
      permitExpiry: '2025-12-31',
      insuranceExpiry: '2025-05-20',
    },
  };

  const handlePerformInspection = () => {
    Alert.alert('Inspection', 'Navigate to inspection screen');
  };

  const handleEdit = () => {
    Alert.alert('Edit Truck', 'Edit truck functionality coming soon');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.regNo}>{truck.regNo}</Text>
        <View style={[styles.statusBadge, { backgroundColor: truck.status === 'ACTIVE' ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.statusText}>{truck.status}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Model Year:</Text>
          <Text style={styles.value}>{truck.modelYear}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>BS Type:</Text>
          <Text style={styles.value}>{truck.bsType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Tonnage:</Text>
          <Text style={styles.value}>{truck.tonnage}T</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Inspections</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Last Inspection:</Text>
          <Text style={styles.value}>{truck.lastInspectionAt}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Next Due:</Text>
          <Text style={[styles.value, styles.dueDate]}>{truck.nextInspectionDue}</Text>
        </View>
        <Button
          title="Perform Inspection"
          onPress={handlePerformInspection}
          style={styles.actionButton}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Documents</Text>
        {Object.entries(truck.documents).map(([key, value]) => (
          <View key={key} style={styles.detailRow}>
            <Text style={styles.label}>{key.replace(/([A-Z])/g, ' $1').trim()}:</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </Card>

      <Button
        title="Edit Truck Details"
        onPress={handleEdit}
        variant="outline"
        style={styles.editButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 16,
    padding: 20,
  },
  regNo: {
    fontSize: 24,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
  },
  dueDate: {
    color: '#FF9800',
  },
  actionButton: {
    marginTop: 16,
  },
  editButton: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
});

