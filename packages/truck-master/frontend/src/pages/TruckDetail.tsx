/**
 * Truck Detail Page
 * Shows operator-declared data, VAHAN snapshot, flags history, photo verification results
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface TruckDetailProps {
  truckId: string;
  isAdmin?: boolean;
  isFranchise?: boolean;
}

export const TruckDetail: React.FC<TruckDetailProps> = ({ truckId, isAdmin, isFranchise }) => {
  // TODO: Fetch truck data using useTruckMaster hook
  // const { truck, loading, error } = useTruckMaster(truckId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Operator Declared</Text>
        {/* Display tyre_count, body_length_ft, body_type, payload_kg, etc. */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>VAHAN Snapshot</Text>
        {/* Display VAHAN data, provider, txn_id */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flags History</Text>
        {/* Display flags with timestamps */}
      </View>

      {(isAdmin || isFranchise) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text>Verify Manually</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#C90D0D',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default TruckDetail;

