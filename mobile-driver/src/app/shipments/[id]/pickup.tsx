/**
 * Pickup Photo Screen
 * Capture geotagged photos at pickup location
 */

import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RPhotoCapture, RButton } from '@rodistaa/design-system';
import { RodistaaColors, RodistaaSpacing } from '@rodistaa/design-system';
import { useState } from 'react';
import { queueUpload } from '@rodistaa/mobile-shared';

export default function PickupPhotoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photos, setPhotos] = useState<string[]>([]);

  const handleCapture = (photoUri: string) => {
    setPhotos([...photos, photoUri]);
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert('Error', 'Please capture at least one photo');
      return;
    }

    try {
      // Queue upload for offline support
      await queueUpload({
        type: 'photo',
        data: {
          shipmentId: id,
          photos,
          type: 'pickup',
        },
        maxRetries: 5,
      });

      router.push(`/shipments/${id}/drop`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save photos');
    }
  };

  return (
    <View style={styles.container}>
      <RPhotoCapture
        onCapture={handleCapture}
        requiredPhotos={3}
        geotagRequired={true}
      />
      
      <RButton
        title="Continue to Drop"
        variant="primary"
        onPress={handleSubmit}
        disabled={photos.length < 3}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  button: {
    margin: RodistaaSpacing.lg,
  },
});

