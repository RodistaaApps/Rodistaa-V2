/**
 * Truck Add Form
 * Single-screen form for truck onboarding with mandatory body length and tyre count
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';

const ALLOWED_TYRE_COUNTS = [6, 10, 12, 14, 16, 18, 20, 22];
const ALLOWED_BODY_LENGTHS = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40, 42, 45];
const BODY_TYPES = [
  { value: 'OPEN', label: 'Open Body', icon: '📦' },
  { value: 'CONTAINER', label: 'Container', icon: '🚚' },
  { value: 'FLATBED', label: 'Flatbed', icon: '🚛' },
  { value: 'LOWBED', label: 'Lowbed', icon: '🔧' },
  { value: 'TRAILER', label: 'Trailer', icon: '🚋' },
  { value: 'OTHER', label: 'Other', icon: '❓' },
];

interface TruckAddFormProps {
  operatorId: string;
  onSubmit: (data: TruckFormData) => Promise<void>;
  onCancel?: () => void;
}

interface TruckFormData {
  rc_number: string;
  tyre_count: number;
  body_length_ft: number;
  body_type: string;
  payload_kg?: number;
  axle_count?: number;
  nickname?: string;
  rc_copy: File | null;
}

export const TruckAddForm: React.FC<TruckAddFormProps> = ({
  operatorId,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<TruckFormData>({
    rc_number: '',
    tyre_count: 0,
    body_length_ft: 0,
    body_type: '',
    payload_kg: undefined,
    axle_count: undefined,
    nickname: '',
    rc_copy: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showTyreDropdown, setShowTyreDropdown] = useState(false);
  const [showLengthDropdown, setShowLengthDropdown] = useState(false);
  const [flags, setFlags] = useState<Array<{ code: string; severity: string; reason: string }>>([]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.rc_number || formData.rc_number.trim().length < 10) {
      newErrors.rc_number = 'RC number must be at least 10 characters';
    }

    if (!ALLOWED_TYRE_COUNTS.includes(formData.tyre_count)) {
      newErrors.tyre_count = 'Please select tyre count';
    }

    if (!ALLOWED_BODY_LENGTHS.includes(formData.body_length_ft)) {
      newErrors.body_length_ft = 'Please select body length';
    }

    if (!formData.body_type) {
      newErrors.body_type = 'Please select body type';
    }

    if (!formData.rc_copy) {
      newErrors.rc_copy = 'RC copy is required';
    }

    if (formData.payload_kg !== undefined && formData.payload_kg < 0) {
      newErrors.payload_kg = 'Payload must be non-negative';
    }

    if (formData.axle_count !== undefined && (formData.axle_count < 2 || formData.axle_count > 10)) {
      newErrors.axle_count = 'Axle count must be between 2 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTyreCountChange = (tyreCount: number) => {
    setFormData({ ...formData, tyre_count: tyreCount });
    setShowTyreDropdown(false);
    
    // Compute flags immediately for feedback
    computeFlags({ ...formData, tyre_count: tyreCount });
  };

  const handleBodyLengthChange = (length: number) => {
    setFormData({ ...formData, body_length_ft: length });
    setShowLengthDropdown(false);
    
    // Compute flags immediately for feedback
    computeFlags({ ...formData, body_length_ft: length });
  };

  const computeFlags = (data: Partial<TruckFormData>) => {
    if (!data.tyre_count || !data.body_length_ft) return;

    // Typical length ranges by tyre count
    const typicalRanges: Record<number, { min: number; max: number }> = {
      6: { min: 12, max: 18 },
      10: { min: 18, max: 24 },
      12: { min: 22, max: 28 },
      14: { min: 24, max: 30 },
      16: { min: 26, max: 32 },
      18: { min: 28, max: 40 },
      20: { min: 30, max: 45 },
      22: { min: 32, max: 45 },
    };

    const range = typicalRanges[data.tyre_count];
    const computedFlags: Array<{ code: string; severity: string; reason: string }> = [];

    if (range && (data.body_length_ft < range.min || data.body_length_ft > range.max)) {
      computedFlags.push({
        code: 'LENGTH_MISMATCH_WARNING',
        severity: 'LOW',
        reason: `Body length ${data.body_length_ft}ft is outside typical range ${range.min}-${range.max}ft for ${data.tyre_count}-tyre vehicles`,
      });
    }

    setFlags(computedFlags);
  };

  const handleFilePick = () => {
    // TODO: Implement file picker for RC copy
    Alert.alert('File Picker', 'RC copy file picker not yet implemented');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      Alert.alert('Success', 'Truck created successfully. Pending verification.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create truck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* RC Number */}
        <View style={styles.field}>
          <Text style={styles.label}>RC Number *</Text>
          <TextInput
            style={[styles.input, errors.rc_number && styles.inputError]}
            value={formData.rc_number}
            onChangeText={(text) => {
              setFormData({ ...formData, rc_number: text.toUpperCase() });
              setErrors({ ...errors, rc_number: '' });
            }}
            placeholder="Enter RC number"
            placeholderTextColor="#999"
            maxLength={20}
            autoCapitalize="characters"
            testID="rc-number-input"
          />
          {errors.rc_number && <Text style={styles.errorText}>{errors.rc_number}</Text>}
        </View>

        {/* Tyre Count Dropdown */}
        <View style={styles.field}>
          <Text style={styles.label}>Tyre Count *</Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.tyre_count && styles.inputError]}
            onPress={() => setShowTyreDropdown(!showTyreDropdown)}
            testID="tyre-count-dropdown"
          >
            <Text style={styles.dropdownText}>
              {formData.tyre_count > 0 ? `${formData.tyre_count} tyres` : 'Select tyre count'}
            </Text>
            <Text style={styles.dropdownArrow}>{showTyreDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showTyreDropdown && (
            <View style={styles.dropdownMenu}>
              {ALLOWED_TYRE_COUNTS.map((count) => (
                <TouchableOpacity
                  key={count}
                  style={styles.dropdownItem}
                  onPress={() => handleTyreCountChange(count)}
                >
                  <Text style={styles.dropdownItemText}>{count} tyres</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.tyre_count && <Text style={styles.errorText}>{errors.tyre_count}</Text>}
          <Text style={styles.helpText}>
            💡 Common: 6 (small), 10 (medium), 12-14 (large), 16+ (trailers)
          </Text>
        </View>

        {/* Body Length Dropdown */}
        <View style={styles.field}>
          <Text style={styles.label}>Body Length (feet) *</Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.body_length_ft && styles.inputError]}
            onPress={() => setShowLengthDropdown(!showLengthDropdown)}
            testID="body-length-dropdown"
          >
            <Text style={styles.dropdownText}>
              {formData.body_length_ft > 0 ? `${formData.body_length_ft} ft` : 'Select body length'}
            </Text>
            <Text style={styles.dropdownArrow}>{showLengthDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showLengthDropdown && (
            <View style={styles.dropdownMenu}>
              {ALLOWED_BODY_LENGTHS.map((length) => (
                <TouchableOpacity
                  key={length}
                  style={styles.dropdownItem}
                  onPress={() => handleBodyLengthChange(length)}
                >
                  <Text style={styles.dropdownItemText}>{length} ft</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.body_length_ft && <Text style={styles.errorText}>{errors.body_length_ft}</Text>}
          <Text style={styles.helpText}>
            💡 Measure from front edge of cargo area to rear edge
          </Text>
        </View>

        {/* Body Type Radio */}
        <View style={styles.field}>
          <Text style={styles.label}>Body Type *</Text>
          <View style={styles.radioGroup}>
            {BODY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.radioOption,
                  formData.body_type === type.value && styles.radioOptionSelected,
                ]}
                onPress={() => {
                  setFormData({ ...formData, body_type: type.value });
                  setErrors({ ...errors, body_type: '' });
                }}
                testID={`body-type-${type.value}`}
              >
                <Text style={styles.radioIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.radioText,
                    formData.body_type === type.value && styles.radioTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.body_type && <Text style={styles.errorText}>{errors.body_type}</Text>}
        </View>

        {/* Payload (Optional) */}
        <View style={styles.field}>
          <Text style={styles.label}>Payload (kg) - Optional</Text>
          <TextInput
            style={styles.input}
            value={formData.payload_kg?.toString() || ''}
            onChangeText={(text) => {
              const value = text ? parseInt(text, 10) : undefined;
              setFormData({ ...formData, payload_kg: value });
              setErrors({ ...errors, payload_kg: '' });
            }}
            placeholder="Enter payload capacity"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            testID="payload-input"
          />
          {errors.payload_kg && <Text style={styles.errorText}>{errors.payload_kg}</Text>}
        </View>

        {/* Axle Count (Optional) */}
        <View style={styles.field}>
          <Text style={styles.label}>Axle Count - Optional</Text>
          <TextInput
            style={styles.input}
            value={formData.axle_count?.toString() || ''}
            onChangeText={(text) => {
              const value = text ? parseInt(text, 10) : undefined;
              setFormData({ ...formData, axle_count: value });
              setErrors({ ...errors, axle_count: '' });
            }}
            placeholder="Enter axle count (2-10)"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={2}
            testID="axle-count-input"
          />
          {errors.axle_count && <Text style={styles.errorText}>{errors.axle_count}</Text>}
        </View>

        {/* RC Copy Upload */}
        <View style={styles.field}>
          <Text style={styles.label}>RC Copy (PDF/Image) *</Text>
          <TouchableOpacity
            style={[styles.fileButton, errors.rc_copy && styles.inputError]}
            onPress={handleFilePick}
            testID="rc-copy-upload"
          >
            <Text style={styles.fileButtonText}>
              {formData.rc_copy ? '📄 RC Copy Selected' : '+ Upload RC Copy'}
            </Text>
          </TouchableOpacity>
          {errors.rc_copy && <Text style={styles.errorText}>{errors.rc_copy}</Text>}
          <Text style={styles.helpText}>
            💡 Upload clear photo or PDF of RC document
          </Text>
        </View>

        {/* Flags Toast */}
        {flags.length > 0 && (
          <View style={styles.flagsContainer}>
            <Text style={styles.flagsTitle}>⚠️ Configuration Notice</Text>
            {flags.map((flag, index) => (
              <View key={index} style={styles.flagItem}>
                <Text style={styles.flagText}>{flag.reason}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.helpButton} onPress={() => {
              Alert.alert('Request Help', 'Ticket will be created for manual review');
            }}>
              <Text style={styles.helpButtonText}>Request Help</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          testID="submit-button"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Truck Details</Text>
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
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  inputError: {
    borderColor: '#e03131',
  },
  errorText: {
    color: '#e03131',
    fontSize: 12,
    marginTop: 4,
  },
  helpText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    minWidth: '30%',
    marginBottom: 8,
  },
  radioOptionSelected: {
    borderColor: '#C90D0D',
    backgroundColor: '#ffe6e6',
  },
  radioIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  radioTextSelected: {
    color: '#C90D0D',
    fontWeight: '600',
  },
  fileButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minHeight: 44,
  },
  fileButtonText: {
    fontSize: 16,
    color: '#333',
  },
  flagsContainer: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  flagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  flagItem: {
    marginBottom: 4,
  },
  flagText: {
    fontSize: 14,
    color: '#856404',
  },
  helpButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ffc107',
    borderRadius: 4,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#333',
    fontWeight: '600',
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

export default TruckAddForm;

