/**
 * POD Upload Screen
 * Driver uploads proof of delivery (image or PDF)
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Card } from '@rodistaa/mobile-shared';

export default function PODUploadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    // Mock image picker
    setImageUri('https://via.placeholder.com/400x300');
    Alert.alert('Image Selected', 'POD image ready to upload');
  };

  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select a POD image first');
      return;
    }

    setUploading(true);
    try {
      // API call: await uploadPOD(id, imageUri);
      Alert.alert('Success', 'POD uploaded successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload POD');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Upload Proof of Delivery</Text>
        <Text style={styles.subtitle}>Shipment: {id}</Text>

        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            <Button
              title="Change Image"
              onPress={handlePickImage}
              variant="outline"
              style={styles.changeButton}
            />
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          <Text style={styles.instructionText}>• Take clear photo of signed POD</Text>
          <Text style={styles.instructionText}>• Ensure all details are visible</Text>
          <Text style={styles.instructionText}>• Document will be encrypted before upload</Text>
        </View>

        <View style={styles.actions}>
          {!imageUri && (
            <Button
              title="Capture POD"
              onPress={handlePickImage}
              style={styles.actionButton}
            />
          )}
          
          {imageUri && (
            <Button
              title="Upload POD"
              onPress={handleUpload}
              loading={uploading}
              style={styles.actionButton}
            />
          )}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  card: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginBottom: 24,
  },
  imageContainer: {
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeButton: {
    marginTop: 8,
  },
  placeholder: {
    height: 200,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    color: '#999999',
  },
  instructions: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  instructionTitle: {
    fontSize: 14,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    color: '#666666',
    marginBottom: 4,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    marginTop: 8,
  },
});

