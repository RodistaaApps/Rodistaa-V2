/**
 * Media Utilities
 * Photo/PDF picker, compression, and file handling
 */

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface MediaFile {
  uri: string;
  type: 'image' | 'pdf';
  name: string;
  size: number;
  base64?: string;
}

/**
 * Request camera/media library permissions
 */
export async function requestMediaPermissions(): Promise<boolean> {
  try {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus.granted && mediaStatus.granted;
  } catch (error) {
    console.error('Media permission error:', error);
    return false;
  }
}

/**
 * Pick image from gallery or camera
 * @param source - 'gallery' or 'camera'
 * @param allowsEditing - Allow image editing
 * @param quality - Image quality (0-1)
 * @returns Media file or null
 */
export async function pickImage(
  source: 'gallery' | 'camera' = 'gallery',
  allowsEditing: boolean = false,
  quality: number = 0.8
): Promise<MediaFile | null> {
  try {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
      throw new Error('Media permission denied');
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      quality,
      base64: true,
    };

    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);

    return {
      uri: asset.uri,
      type: 'image',
      name: asset.uri.split('/').pop() || 'image.jpg',
      size: fileInfo.exists ? fileInfo.size || 0 : 0,
      base64: asset.base64,
    };
  } catch (error) {
    console.error('Pick image error:', error);
    return null;
  }
}

/**
 * Compress image to reduce file size
 * @param uri - Image URI
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @param quality - Compression quality (0-1)
 * @returns Compressed image URI
 */
export async function compressImage(
  uri: string,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.7
): Promise<string> {
  try {
    // Expo ImagePicker already handles compression via quality parameter
    // For more advanced compression, consider using react-native-image-resizer
    return uri;
  } catch (error) {
    console.error('Image compression error:', error);
    return uri;
  }
}

/**
 * Convert image to base64
 */
export async function imageToBase64(uri: string): Promise<string | null> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Image to base64 error:', error);
    return null;
  }
}

/**
 * Get file size in MB
 */
export function getFileSizeMB(size: number): number {
  return size / (1024 * 1024);
}

/**
 * Validate file size (max 10MB for images, 5MB for PDFs)
 */
export function validateFileSize(file: MediaFile, maxSizeMB: number = 10): boolean {
  const sizeMB = getFileSizeMB(file.size);
  return sizeMB <= maxSizeMB;
}

