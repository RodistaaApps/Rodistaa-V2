/**
 * Live Tracking Screen
 * Real-time GPS tracking for shipments
 */

import { View, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { RCard, RTag } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useGetShipment } from '@rodistaa/mobile-shared';
import { useEffect, useState } from 'react';
import { isGPSWorkerRunning } from '@rodistaa/mobile-shared';

export default function LiveTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: shipment } = useGetShipment(id);
  const [gpsActive, setGpsActive] = useState(false);

  useEffect(() => {
    checkGPSStatus();
    const interval = setInterval(checkGPSStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  async function checkGPSStatus() {
    const running = await isGPSWorkerRunning();
    setGpsActive(running);
  }

  return (
    <View style={styles.container}>
      <RCard style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Live Tracking</Text>
          <RTag
            label={gpsActive ? 'GPS Active' : 'GPS Inactive'}
            variant={gpsActive ? 'success' : 'error'}
            size="small"
          />
        </View>
        
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>Map View</Text>
          <Text style={styles.mapSubtext}>
            {gpsActive ? 'Tracking active' : 'Waiting for GPS...'}
          </Text>
        </View>
      </RCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  card: {
    margin: RodistaaSpacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  title: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
  },
  mapPlaceholder: {
    height: 400,
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  mapSubtext: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.disabled,
  },
});

