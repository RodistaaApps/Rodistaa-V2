/**
 * Inspection History Screen
 * View all inspections for a truck
 */

import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { RCard, RLoader, Timeline } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useGetTruckInspections } from '@rodistaa/mobile-shared';

export default function InspectionHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: inspections, isLoading } = useGetTruckInspections(id);

  if (isLoading) {
    return <RLoader />;
  }

  const timelineEvents = inspections?.data?.map((inspection: any) => ({
    id: inspection.id,
    title: `Inspection - ${inspection.status}`,
    description: `Performed on ${new Date(inspection.date).toLocaleDateString()}`,
    timestamp: inspection.date,
    status: inspection.status === 'verified' ? 'completed' : inspection.status === 'pending' ? 'pending' : 'active',
  })) || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={inspections?.data || []}
        renderItem={({ item }) => (
          <RCard style={styles.card}>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.status}>Status: {item.status}</Text>
            {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
          </RCard>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Inspection Timeline</Text>
            <Timeline events={timelineEvents} />
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
  list: {
    padding: RodistaaSpacing.lg,
  },
  timelineContainer: {
    marginBottom: RodistaaSpacing.xl,
  },
  timelineTitle: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  card: {
    marginBottom: RodistaaSpacing.md,
    padding: RodistaaSpacing.lg,
  },
  date: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  status: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  notes: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
});

