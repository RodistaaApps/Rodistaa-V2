/**
 * Home Screen
 * Main dashboard for shipper
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { RCard, RButton } from '@rodistaa/design-system';
import { Ionicons } from '@expo/vector-icons';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RCard style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome to Rodistaa</Text>
        <Text style={styles.welcomeSubtitle}>Your logistics partner</Text>
      </RCard>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/bookings/create')}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={48} color={RodistaaColors.primary.main} />
          <Text style={styles.actionTitle}>Post New Load</Text>
          <Text style={styles.actionSubtitle}>Create a booking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/bookings')}
          activeOpacity={0.7}
        >
          <Ionicons name="list" size={48} color={RodistaaColors.primary.main} />
          <Text style={styles.actionTitle}>My Bookings</Text>
          <Text style={styles.actionSubtitle}>View all bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/bookings')}
          activeOpacity={0.7}
        >
          <Ionicons name="car" size={48} color={RodistaaColors.primary.main} />
          <Text style={styles.actionTitle}>Active Shipments</Text>
          <Text style={styles.actionSubtitle}>Track your shipments</Text>
        </TouchableOpacity>
      </View>
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
  welcomeCard: {
    marginBottom: RodistaaSpacing.xl,
    backgroundColor: RodistaaColors.primary.main,
    padding: RodistaaSpacing.xl,
  },
  welcomeTitle: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.primary.contrast,
    marginBottom: RodistaaSpacing.sm,
  },
  welcomeSubtitle: {
    ...MobileTextStyles.body,
    color: RodistaaColors.primary.contrast,
    opacity: 0.9,
  },
  actions: {
    gap: RodistaaSpacing.lg,
  },
  actionCard: {
    backgroundColor: RodistaaColors.background.default,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.xl,
    alignItems: 'center',
    ...RNShadowStyles.md,
  },
  actionTitle: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    marginTop: RodistaaSpacing.md,
  },
  actionSubtitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginTop: RodistaaSpacing.xs,
  },
});

