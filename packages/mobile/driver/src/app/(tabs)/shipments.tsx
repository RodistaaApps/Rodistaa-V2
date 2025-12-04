/**
 * Driver Shipments Screen - Uses design system
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { RCard, RTag, LoadCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';

export default function DriverShipmentsScreen() {
  const router = useRouter();

  const [shipments] = useState([
    {
      id: 'SH-001',
      pickup: { address: 'Mumbai Port', city: 'Mumbai', state: 'MH' },
      drop: { address: 'Delhi Warehouse', city: 'Delhi', state: 'DL' },
      status: 'IN_TRANSIT' as const,
      progress: 45,
      hasPod: false,
    },
    {
      id: 'SH-002',
      pickup: { address: 'Pune Industrial', city: 'Pune', state: 'MH' },
      drop: { address: 'Bangalore Hub', city: 'Bangalore', state: 'KA' },
      status: 'COMPLETED' as const,
      progress: 100,
      hasPod: true,
    },
  ]);

  const renderShipment = ({ item }: { item: typeof shipments[0] }) => (
    <LoadCard
      id={item.id}
      pickup={item.pickup}
      drop={item.drop}
      tonnage={10}
      priceRange={{ min: 0, max: 0 }}
      status={item.status}
      onPress={() => router.push(`/shipments/${item.id}`)}
    />
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
            <Text style={styles.subtitle}>
              {shipments.filter((s) => s.status !== 'COMPLETED').length} active
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  header: {
    padding: RodistaaSpacing.xl,
    backgroundColor: RodistaaColors.background.default,
    marginBottom: RodistaaSpacing.lg,
  },
  title: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
  },
  subtitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginTop: RodistaaSpacing.xs,
  },
  list: {
    paddingHorizontal: RodistaaSpacing.lg,
    paddingBottom: RodistaaSpacing.lg,
  },
});
