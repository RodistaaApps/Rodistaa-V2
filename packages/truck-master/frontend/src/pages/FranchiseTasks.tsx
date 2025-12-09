/**
 * Franchise Tasks Page
 * List of assigned photo-verification tasks with camera checklist UI
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface FranchiseTask {
  id: number;
  truck_id: number;
  rc_number: string;
  due_at: string;
  required_photos: string[];
}

const REQUIRED_PHOTOS = [
  { key: 'front', label: 'Front View', icon: '📷' },
  { key: 'rear', label: 'Rear View', icon: '📷' },
  { key: 'side_left', label: 'Left Side', icon: '📷' },
  { key: 'side_right', label: 'Right Side', icon: '📷' },
  { key: 'tyres_closeup', label: 'Tyres Closeup', icon: '🔍' },
  { key: 'deck_length_with_tape', label: 'Deck Length with Tape', icon: '📏' },
];

export const FranchiseTasks: React.FC<{ franchiseId: string }> = ({ franchiseId }) => {
  const [tasks, setTasks] = useState<FranchiseTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<FranchiseTask | null>(null);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  const handleTakePhoto = async (photoKey: string) => {
    // TODO: Implement camera integration
    console.log(`Take photo: ${photoKey}`);
  };

  const handleSubmitVerification = async () => {
    if (!selectedTask) return;
    // TODO: Submit verification with photos
    console.log('Submit verification', { taskId: selectedTask.id, photos });
  };

  return (
    <ScrollView style={styles.container}>
      {!selectedTask ? (
        <View>
          <Text style={styles.title}>Photo Verification Tasks</Text>
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => setSelectedTask(task)}
            >
              <Text style={styles.taskRC}>{task.rc_number}</Text>
              <Text style={styles.taskDue}>Due: {new Date(task.due_at).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Verify: {selectedTask.rc_number}</Text>
          <Text style={styles.instructions}>
            Take photos according to the checklist below. Include measuring tape in deck length photo.
          </Text>

          {REQUIRED_PHOTOS.map((photo) => (
            <View key={photo.key} style={styles.photoItem}>
              <Text style={styles.photoLabel}>
                {photo.icon} {photo.label}
              </Text>
              {photos[photo.key] ? (
                <Image source={{ uri: photos[photo.key] }} style={styles.photoPreview} />
              ) : (
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={() => handleTakePhoto(photo.key)}
                >
                  <Text>📷 Take Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitVerification}
          >
            <Text style={styles.submitButtonText}>Submit Verification</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  taskRC: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskDue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  photoItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  photoButton: {
    backgroundColor: '#C90D0D',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#C90D0D',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FranchiseTasks;

