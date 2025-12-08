/**
 * Admin Flag Dashboard
 * List trucks by flag type, filter by region/state, assign to franchise, create ticket
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export const FlagDashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    flag_code: '',
    compliance_status: '',
    region: '',
    state: '',
  });

  const [trucks, setTrucks] = useState<any[]>([]);

  const handleAssignFranchise = (truckId: number) => {
    // TODO: Implement franchise assignment
    console.log('Assign franchise for truck', truckId);
  };

  const handleCreateTicket = (truckId: number) => {
    // TODO: Implement ticket creation
    console.log('Create ticket for truck', truckId);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Flag Dashboard</Text>

      {/* Filters */}
      <View style={styles.filters}>
        {/* Filter UI here */}
      </View>

      {/* Trucks List */}
      {trucks.map((truck) => (
        <View key={truck.id} style={styles.truckCard}>
          <Text style={styles.truckRC}>{truck.rc_number}</Text>
          <Text style={styles.truckFlags}>
            Flags: {truck.flags.map((f: any) => f.code).join(', ')}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAssignFranchise(truck.id)}
            >
              <Text>Assign Franchise</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCreateTicket(truck.id)}
            >
              <Text>Create Ticket</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  filters: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  truckCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  truckRC: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  truckFlags: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#C90D0D',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
});

export default FlagDashboard;

