import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock data - replace with API call
const mockBookings = [
  {
    id: 'BKG-2024-001',
    from: 'Chennai, TN',
    to: 'Bangalore, KA',
    distance: '350 km',
    weight: '10 tons',
    vehicleType: 'Container 20ft',
    pickupDate: '2024-12-10',
    estimatedAmount: '₹25,000',
    bidsCount: 5,
    status: 'OPEN',
  },
  {
    id: 'BKG-2024-002',
    from: 'Bangalore, KA',
    to: 'Mumbai, MH',
    distance: '980 km',
    weight: '15 tons',
    vehicleType: 'Container 40ft',
    pickupDate: '2024-12-12',
    estimatedAmount: '₹55,000',
    bidsCount: 8,
    status: 'OPEN',
  },
  {
    id: 'BKG-2024-003',
    from: 'Chennai, TN',
    to: 'Hyderabad, TS',
    distance: '630 km',
    weight: '8 tons',
    vehicleType: 'Open Body',
    pickupDate: '2024-12-08',
    estimatedAmount: '₹30,000',
    bidsCount: 3,
    status: 'OPEN',
  },
];

export default function BookingsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'mybids'>('open');

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Fetch latest bookings
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'open' && styles.filterTabActive]}
          onPress={() => setFilter('open')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'open' && styles.filterTextActive,
            ]}
          >
            Open Bookings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'mybids' && styles.filterTabActive]}
          onPress={() => setFilter('mybids')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'mybids' && styles.filterTextActive,
            ]}
          >
            My Bids
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.bookingsContainer}>
          {mockBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => router.push(`/bookings/${booking.id}`)}
            >
              {/* Header */}
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingId}>{booking.id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{booking.status}</Text>
                </View>
              </View>

              {/* Route */}
              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <Ionicons name="location" size={20} color="#27AE60" />
                  <Text style={styles.locationText}>{booking.from}</Text>
                </View>
                <View style={styles.routeLine}>
                  <View style={styles.routeDots} />
                  <View style={styles.routeDots} />
                  <View style={styles.routeDots} />
                </View>
                <View style={styles.routePoint}>
                  <Ionicons name="location" size={20} color="#C90D0D" />
                  <Text style={styles.locationText}>{booking.to}</Text>
                </View>
              </View>

              {/* Details */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar" size={16} color="#4F4F4F" />
                  <Text style={styles.detailText}>{booking.pickupDate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="car" size={16} color="#4F4F4F" />
                  <Text style={styles.detailText}>{booking.vehicleType}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="navigate" size={16} color="#4F4F4F" />
                  <Text style={styles.detailText}>{booking.distance}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="cube" size={16} color="#4F4F4F" />
                  <Text style={styles.detailText}>{booking.weight}</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.bookingFooter}>
                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Est. Amount</Text>
                  <Text style={styles.amountValue}>{booking.estimatedAmount}</Text>
                </View>
                <View style={styles.bidInfo}>
                  <Ionicons name="people" size={16} color="#4F4F4F" />
                  <Text style={styles.bidCount}>{booking.bidsCount} bids</Text>
                </View>
                <TouchableOpacity
                  style={styles.bidButton}
                  onPress={() => router.push(`/bookings/${booking.id}/bid`)}
                >
                  <Text style={styles.bidButtonText}>Place Bid</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#C90D0D',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F4F4F',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  bookingsContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statusBadge: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 8,
    fontWeight: '500',
  },
  routeLine: {
    flexDirection: 'row',
    marginLeft: 10,
    marginBottom: 8,
    gap: 4,
  },
  routeDots: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  detailText: {
    fontSize: 14,
    color: '#4F4F4F',
    marginLeft: 6,
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#4F4F4F',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  bidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  bidCount: {
    fontSize: 14,
    color: '#4F4F4F',
    marginLeft: 4,
  },
  bidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C90D0D',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  bidButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

