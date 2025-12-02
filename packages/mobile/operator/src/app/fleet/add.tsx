/**
 * Add Truck Screen
 * Register a new truck to the operator's fleet
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@rodistaa/mobile-shared';

export default function AddTruckScreen() {
  const router = useRouter();
  const [regNo, setRegNo] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [tonnage, setTonnage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!regNo || !modelYear || !chassisNumber || !tonnage) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const yearNum = parseInt(modelYear);
    if (yearNum < 2018) {
      Alert.alert('Error', 'Truck model year must be 2018 or newer');
      return;
    }

    setLoading(true);
    try {
      // API call to create truck
      // await createTruck({ regNo, modelYear: yearNum, chassisNumber, tonnage: parseFloat(tonnage) });
      Alert.alert('Success', 'Truck added to fleet', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add truck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Truck</Text>
        <Text style={styles.subtitle}>Register truck to your fleet</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Registration Number *"
          placeholder="e.g., MH-12-AB-1234"
          value={regNo}
          onChangeText={setRegNo}
          autoCapitalize="characters"
        />
        <Input
          label="Model Year *"
          placeholder="e.g., 2020"
          value={modelYear}
          onChangeText={setModelYear}
          keyboardType="numeric"
          maxLength={4}
        />
        <Input
          label="Chassis Number *"
          placeholder="Enter chassis number"
          value={chassisNumber}
          onChangeText={setChassisNumber}
          autoCapitalize="characters"
        />
        <Input
          label="Tonnage Capacity *"
          placeholder="e.g., 20"
          value={tonnage}
          onChangeText={setTonnage}
          keyboardType="numeric"
        />

        <Text style={styles.note}>
          * All trucks must be HGV type with BS4/BS6 compliance
        </Text>

        <Button
          title="Add Truck"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
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
  form: {
    padding: 16,
  },
  note: {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
});

