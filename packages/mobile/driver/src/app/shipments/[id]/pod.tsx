/**
 * POD Upload Screen
 * Upload Proof of Delivery document
 */

import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RPDFViewer, RButton, RCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useState } from 'react';
import { queueUpload } from '@rodistaa/mobile-shared';
import * as DocumentPicker from 'expo-document-picker';

export default function PODUploadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [podUri, setPodUri] = useState<string | null>(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPodUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    if (!podUri) {
      Alert.alert('Error', 'Please select a POD document');
      return;
    }

    try {
      await queueUpload({
        type: 'pod',
        data: {
          shipmentId: id,
          podUri,
        },
        maxRetries: 5,
      });

      router.push(`/shipments/${id}/complete`);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload POD');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RCard style={styles.card}>
        <Text style={styles.title}>Upload Proof of Delivery</Text>
        <Text style={styles.subtitle}>Please upload the POD document received at drop location</Text>
      </RCard>

      {podUri && (
        <RPDFViewer uri={podUri} style={styles.pdfViewer} />
      )}

      <RButton
        title={podUri ? 'Change Document' : 'Select POD Document'}
        variant="secondary"
        onPress={handlePickDocument}
        style={styles.button}
      />

      <RButton
        title="Continue to OTP Verification"
        variant="primary"
        onPress={handleSubmit}
        disabled={!podUri}
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
    marginBottom: RodistaaSpacing.lg,
    padding: RodistaaSpacing.lg,
  },
  title: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  subtitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  pdfViewer: {
    height: 400,
    marginBottom: RodistaaSpacing.lg,
  },
  button: {
    marginTop: RodistaaSpacing.md,
  },
});
