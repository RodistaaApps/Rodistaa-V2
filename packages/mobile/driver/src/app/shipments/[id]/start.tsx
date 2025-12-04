/**
 * Start Trip Screen
 * Driver accepts and starts a trip
 */

import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RButton, RCard, LoadCard, Timeline } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useGetShipment, useStartTrip, guardDriverTripRoute } from '@rodistaa/mobile-shared';
import { initializeGPSWorker } from '@rodistaa/mobile-shared';
import { useState, useEffect } from 'react';

export default function StartTripScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: shipment } = useGetShipment(id);
  const startTripMutation = useStartTrip();
  const [gpsInitialized, setGpsInitialized] = useState(false);

  useEffect(() => {
    checkGuard();
  }, []);

  async function checkGuard() {
    // TODO: Get user from auth context
    const user = null;
    const result = await guardDriverTripRoute(user);
    if (!result.allowed) {
      Alert.alert('Access Denied', result.reason || 'You cannot access this trip');
      router.back();
    }
  }

  const handleStartTrip = async () => {
    try {
      await startTripMutation.mutateAsync(id);
      
      // Initialize GPS worker
      const gpsStarted = await initializeGPSWorker(id);
      setGpsInitialized(gpsStarted);
      
      if (gpsStarted) {
        Alert.alert('Trip Started', 'GPS tracking is now active', [
          { text: 'OK', onPress: () => router.push(`/shipments/${id}`) },
        ]);
      } else {
        Alert.alert('Warning', 'GPS tracking could not be started. Please check permissions.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start trip');
    }
  };

  if (!shipment) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LoadCard
        id={shipment.id}
        pickup={{ address: shipment.pickupAddress, city: '', state: '' }}
        drop={{ address: shipment.dropAddress, city: '', state: '' }}
        tonnage={shipment.weightTons || 0}
        priceRange={{ min: 0, max: 0 }}
        status={shipment.status as any}
      />

      <RCard style={styles.card}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <Text style={styles.detail}>Truck: {shipment.truckRegistration}</Text>
        <Text style={styles.detail}>Distance: {shipment.distance} km</Text>
        <Text style={styles.detail}>Estimated Time: {shipment.estimatedTime}</Text>
      </RCard>

      <RButton
        title="Start Trip"
        variant="primary"
        onPress={handleStartTrip}
        loading={startTripMutation.isPending}
        style={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  content: {
    padding: RodistaaSpacing.lg,
  },
  card: {
    marginTop: RodistaaSpacing.lg,
    padding: RodistaaSpacing.lg,
  },
  sectionTitle: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  detail: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  button: {
    marginTop: RodistaaSpacing.xl,
  },
});

