/**
 * Home Screen
 * Main dashboard for shipper
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@rodistaa/mobile-shared';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome to Rodistaa</Text>
        <Text style={styles.welcomeSubtitle}>Your logistics partner</Text>
      </Card>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/bookings/create')}
        >
          <Ionicons name="add-circle" size={48} color="#C90D0D" />
          <Text style={styles.actionTitle}>Post New Load</Text>
          <Text style={styles.actionSubtitle}>Create a booking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/bookings')}
        >
          <Ionicons name="list" size={48} color="#C90D0D" />
          <Text style={styles.actionTitle}>My Bookings</Text>
          <Text style={styles.actionSubtitle}>View all bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/shipments')}
        >
          <Ionicons name="car" size={48} color="#C90D0D" />
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
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 24,
    backgroundColor: '#C90D0D',
    padding: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  actions: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 18,
    fontFamily: 'Times New Roman',
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
  },
  actionSubtitle: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginTop: 4,
  },
});

