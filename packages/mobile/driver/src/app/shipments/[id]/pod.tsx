import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function PODUploadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [podImage, setPodImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPodImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!podImage) {
      Alert.alert('Error', 'Please capture POD document');
      return;
    }

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      Alert.alert('Success', 'POD uploaded successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Proof of Delivery</Text>
        <Text style={styles.subtitle}>Shipment: {id}</Text>
      </View>

      <View style={styles.instructionsCard}>
        <Ionicons name="information-circle" size={24} color="#2E86DE" />
        <View style={styles.instructionsText}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionItem}>
            • Capture clear image of signed POD
          </Text>
          <Text style={styles.instructionItem}>
            • Ensure signature is visible
          </Text>
          <Text style={styles.instructionItem}>
            • Document should be readable
          </Text>
        </View>
      </View>

      {podImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: podImage }} style={styles.image} />
          <TouchableOpacity style={styles.retakeButton} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.captureButton} onPress={pickImage}>
          <Ionicons name="camera" size={48} color="#FFFFFF" />
          <Text style={styles.captureText}>Capture POD</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.uploadButton,
          !podImage && styles.uploadButtonDisabled,
        ]}
        onPress={handleUpload}
        disabled={!podImage || uploading}
      >
        {uploading ? (
          <Text style={styles.uploadButtonText}>Uploading...</Text>
        ) : (
          <>
            <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>Upload POD</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#4F4F4F',
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  instructionsText: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#4F4F4F',
    marginBottom: 4,
  },
  captureButton: {
    backgroundColor: '#C90D0D',
    margin: 16,
    padding: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  imageContainer: {
    margin: 16,
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F4F4F',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#D0D0D0',
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
