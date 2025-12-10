/**
 * Bids List Screen
 * View all bids for a booking
 */

import { View, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BidCard, RLoader } from '@rodistaa/design-system';
import { RodistaaColors, RodistaaSpacing } from '@rodistaa/design-system';
import { useGetBids, useFinalizeBid } from '@rodistaa/mobile-shared';
import { useState } from 'react';

export default function BidsListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bids, isLoading } = useGetBids(id);
  const finalizeMutation = useFinalizeBid();

  const handleAcceptBid = async (bidId: string) => {
    try {
      await finalizeMutation.mutateAsync(bidId);
      // Navigation will be handled by parent
    } catch (error: any) {
      console.error('Failed to accept bid:', error);
    }
  };

  if (isLoading) {
    return <RLoader />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bids?.data || []}
        renderItem={({ item }) => (
          <BidCard
            key={item.id}
            id={item.id}
            bookingId={id}
            amount={item.amount}
            operatorName={item.operatorName || 'Anonymous'}
            operatorPhone={item.operatorPhone}
            status={item.status || 'PENDING'}
            submittedAt={item.submittedAt || new Date().toISOString()}
            canAccept={item.status === 'PENDING'}
            onAccept={() => handleAcceptBid(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
});

