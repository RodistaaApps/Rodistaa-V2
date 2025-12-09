/**
 * Assignment Form
 * Assign drivers to truck with validation and warnings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

interface AssignmentFormProps {
  truckId: number;
  availableDrivers: Array<{
    id: string;
    name: string;
    dl_class: string;
    dl_valid_till: string;
    is_active: boolean;
  }>;
  onSubmit: (data: any) => Promise<{ warnings: any[] }>;
  onCancel?: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  truckId,
  availableDrivers,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    primary_driver_id: '',
    co_driver_ids: [] as string[],
    start_at: new Date().toISOString().split('T')[0],
    end_at: '',
    assignment_reason: '',
  });

  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [showCoDriverSelector, setShowCoDriverSelector] = useState(false);

  const handleSubmit = async () => {
    if (!formData.primary_driver_id) {
      Alert.alert('Error', 'Please select a primary driver');
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit({
        ...formData,
        truck_id: truckId,
        start_at: new Date(formData.start_at),
        end_at: formData.end_at ? new Date(formData.end_at) : undefined,
      });
      
      setWarnings(result.warnings || []);
      
      if (result.warnings && result.warnings.length > 0) {
        Alert.alert(
          'Assignment Created with Warnings',
          result.warnings.map(w => w.message).join('\n')
        );
      } else {
        Alert.alert('Success', 'Assignment created successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const addCoDriver = (driverId: string) => {
    if (formData.co_driver_ids.length >= 2) {
      Alert.alert('Error', 'Maximum 2 co-drivers allowed');
      return;
    }
    if (formData.co_driver_ids.includes(driverId)) {
      Alert.alert('Error', 'Driver already added');
      return;
    }
    if (driverId === formData.primary_driver_id) {
      Alert.alert('Error', 'Primary driver cannot be co-driver');
      return;
    }
    setFormData({
      ...formData,
      co_driver_ids: [...formData.co_driver_ids, driverId],
    });
  };

  const removeCoDriver = (driverId: string) => {
    setFormData({
      ...formData,
      co_driver_ids: formData.co_driver_ids.filter(id => id !== driverId),
    });
  };

  const availableDriversList = availableDrivers.filter(d => d.is_active);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Assign Drivers to Truck</Text>

        {/* Primary Driver */}
        <View style={styles.field}>
          <Text style={styles.label}>Primary Driver *</Text>
          {availableDriversList.map((driver) => (
            <TouchableOpacity
              key={driver.id}
              style={[
                styles.driverOption,
                formData.primary_driver_id === driver.id && styles.driverOptionSelected,
              ]}
              onPress={() => {
                setFormData({ ...formData, primary_driver_id: driver.id });
              }}
            >
              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={styles.driverDetails}>
                {driver.dl_class} | Valid till: {new Date(driver.dl_valid_till).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Co-Drivers */}
        <View style={styles.field}>
          <Text style={styles.label}>Co-Drivers (Max 2)</Text>
          {formData.co_driver_ids.map((driverId) => {
            const driver = availableDriversList.find(d => d.id === driverId);
            return driver ? (
              <View key={driverId} style={styles.coDriverItem}>
                <Text>{driver.name}</Text>
                <TouchableOpacity onPress={() => removeCoDriver(driverId)}>
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : null;
          })}
          
          {formData.co_driver_ids.length < 2 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCoDriverSelector(!showCoDriverSelector)}
            >
              <Text>+ Add Co-Driver</Text>
            </TouchableOpacity>
          )}

          {showCoDriverSelector && (
            <View style={styles.coDriverSelector}>
              {availableDriversList
                .filter(d => d.id !== formData.primary_driver_id && !formData.co_driver_ids.includes(d.id))
                .map((driver) => (
                  <TouchableOpacity
                    key={driver.id}
                    style={styles.driverOption}
                    onPress={() => {
                      addCoDriver(driver.id);
                      setShowCoDriverSelector(false);
                    }}
                  >
                    <Text>{driver.name}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>

        {/* Start Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Start Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.start_at}
            onChangeText={(text) => setFormData({ ...formData, start_at: text })}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* End Date (Optional) */}
        <View style={styles.field}>
          <Text style={styles.label}>End Date (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.end_at}
            onChangeText={(text) => setFormData({ ...formData, end_at: text })}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Reason */}
        <View style={styles.field}>
          <Text style={styles.label}>Reason</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.assignment_reason}
            onChangeText={(text) => setFormData({ ...formData, assignment_reason: text })}
            placeholder="e.g., shift/route/temp/holiday cover"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Warnings */}
        {warnings.length > 0 && (
          <View style={styles.warningsContainer}>
            <Text style={styles.warningsTitle}>⚠️ Warnings</Text>
            {warnings.map((warning, index) => (
              <Text key={index} style={styles.warningText}>
                {warning.message}
              </Text>
            ))}
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Assignment</Text>
          )}
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
  },
  driverOption: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  driverOptionSelected: {
    borderColor: '#C90D0D',
    backgroundColor: '#ffe6e6',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
  },
  driverDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  coDriverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#C90D0D',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  coDriverSelector: {
    marginTop: 8,
  },
  removeButton: {
    color: '#e03131',
  },
  warningsContainer: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#C90D0D',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 48,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default AssignmentForm;

