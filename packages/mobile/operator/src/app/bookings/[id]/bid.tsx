/**
 * Place Bid Screen
 * Operator places a bid on a booking
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Input, Card } from '@rodistaa/mobile-shared';

export default function PlaceBidScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock booking data
  const booking = {
    id,
    route: 'Mumbai → Delhi',
    tonnage: 20,
    priceRange: { min: 25000, max: 35000 },
    distance: 1450,
  };

  const handleSubmit = async () => {
    if (!amount || !selectedTruck) {
      Alert.alert('Error', 'Please enter bid amount and select a truck');
      return;
    }

    const bidAmount = parseFloat(amount);
    if (bidAmount < booking.priceRange.min || bidAmount > booking.priceRange.max) {
      Alert.alert(
        'Warning',
        `Bid amount should be between ₹${booking.priceRange.min.toLocaleString()} and ₹${booking.priceRange.max.toLocaleString()}`
      );
      return;
    }

    setLoading(true);
    try {
      // API call: await placeBid(id, { amount: bidAmount, truckId: selectedTruck, driverId: selectedDriver });
      Alert.alert('Success', 'Bid placed successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const biddingFee = (booking.tonnage * 5) + (booking.distance * 0.25);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.bookingInfo}>
        <Text style={styles.route}>{booking.route}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Tonnage:</Text>
          <Text style={styles.value}>{booking.tonnage}T</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Price Range:</Text>
          <Text style={styles.value}>
            ₹{booking.priceRange.min.toLocaleString()} - ₹{booking.priceRange.max.toLocaleString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Bidding Fee:</Text>
          <Text style={styles.feeValue}>₹{biddingFee.toFixed(2)}</Text>
        </View>
      </Card>

      <View style={styles.form}>
        <Input
          label="Bid Amount (₹) *"
          placeholder={`₹${booking.priceRange.min} - ₹${booking.priceRange.max}`}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <Input
          label="Select Truck *"
          placeholder="Choose from your fleet"
          value={selectedTruck}
          onChangeText={setSelectedTruck}
        />

        <Input
          label="Assign Driver (Optional)"
          placeholder="Select driver"
          value={selectedDriver}
          onChangeText={setSelectedDriver}
        />

        <Text style={styles.note}>
          ⚠️ Bidding fee of ₹{biddingFee.toFixed(2)} will be deducted from your ledger
        </Text>

        <Button
          title="Place Bid"
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
  bookingInfo: {
    margin: 16,
    padding: 20,
  },
  route: {
    fontSize: 18,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
  },
  feeValue: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#C90D0D',
  },
  form: {
    padding: 16,
  },
  note: {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    color: '#FF9800',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 8,
  },
});

