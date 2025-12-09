/**
 * Driver Add Form
 * Add driver with KYC, license, medical, contact, documents
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
} from 'react-native';

const DL_CLASSES = ['LMV', 'LMV-NT', 'HMV', 'HMV-NT', 'Transport', 'MCWG', 'MCWOG'];
const GENDERS = ['M', 'F', 'O', 'PREFER_NOT_TO_SAY'];
const SHIFTS = ['DAY', 'NIGHT', 'ANY'];

interface DriverAddFormProps {
  operatorId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export const DriverAddForm: React.FC<DriverAddFormProps> = ({
  operatorId,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    alt_mobile: '',
    aadhaar_number: '',
    dl_number: '',
    dl_class: '',
    dl_valid_from: '',
    dl_valid_till: '',
    dob: '',
    gender: '',
    city: '',
    state: '',
    pincode: '',
    preferred_shift: 'ANY',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.mobile.match(/^[6-9]\d{9}$/)) {
      newErrors.mobile = 'Valid 10-digit mobile number required';
    }
    if (!formData.dl_number.trim()) {
      newErrors.dl_number = 'DL number is required';
    }
    if (!DL_CLASSES.includes(formData.dl_class)) {
      newErrors.dl_class = 'DL class is required';
    }
    if (!formData.dl_valid_from) {
      newErrors.dl_valid_from = 'DL valid from date is required';
    }
    if (!formData.dl_valid_till) {
      newErrors.dl_valid_till = 'DL valid till date is required';
    }
    if (formData.dl_valid_till && formData.dl_valid_from) {
      if (new Date(formData.dl_valid_till) <= new Date(formData.dl_valid_from)) {
        newErrors.dl_valid_till = 'Valid till must be after valid from';
      }
      const daysUntilExpiry = Math.floor(
        (new Date(formData.dl_valid_till).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry < 30) {
        setWarnings([`⚠️ DL expires in ${daysUntilExpiry} days`]);
      }
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.pincode.match(/^\d{6}$/)) {
      newErrors.pincode = 'Valid 6-digit pincode required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        operator_id: operatorId,
        address: {
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      });
      Alert.alert('Success', 'Driver created successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Add Driver</Text>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              setErrors({ ...errors, name: '' });
            }}
            placeholder="Enter driver name"
            testID="driver-name-input"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Mobile */}
        <View style={styles.field}>
          <Text style={styles.label}>Mobile *</Text>
          <TextInput
            style={[styles.input, errors.mobile && styles.inputError]}
            value={formData.mobile}
            onChangeText={(text) => {
              setFormData({ ...formData, mobile: text });
              setErrors({ ...errors, mobile: '' });
            }}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            testID="driver-mobile-input"
          />
          {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
        </View>

        {/* DL Number */}
        <View style={styles.field}>
          <Text style={styles.label}>DL Number *</Text>
          <TextInput
            style={[styles.input, errors.dl_number && styles.inputError]}
            value={formData.dl_number}
            onChangeText={(text) => {
              setFormData({ ...formData, dl_number: text.toUpperCase() });
              setErrors({ ...errors, dl_number: '' });
            }}
            placeholder="Enter DL number"
            autoCapitalize="characters"
            testID="driver-dl-input"
          />
          {errors.dl_number && <Text style={styles.errorText}>{errors.dl_number}</Text>}
        </View>

        {/* DL Class */}
        <View style={styles.field}>
          <Text style={styles.label}>DL Class *</Text>
          <View style={styles.radioGroup}>
            {DL_CLASSES.map((dlClass) => (
              <TouchableOpacity
                key={dlClass}
                style={[
                  styles.radioOption,
                  formData.dl_class === dlClass && styles.radioOptionSelected,
                ]}
                onPress={() => {
                  setFormData({ ...formData, dl_class: dlClass });
                  setErrors({ ...errors, dl_class: '' });
                }}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.dl_class === dlClass && styles.radioTextSelected,
                  ]}
                >
                  {dlClass}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.dl_class && <Text style={styles.errorText}>{errors.dl_class}</Text>}
        </View>

        {/* DL Valid Till */}
        <View style={styles.field}>
          <Text style={styles.label}>DL Valid Till *</Text>
          <TextInput
            style={[styles.input, errors.dl_valid_till && styles.inputError]}
            value={formData.dl_valid_till}
            onChangeText={(text) => {
              setFormData({ ...formData, dl_valid_till: text });
              setErrors({ ...errors, dl_valid_till: '' });
              setWarnings([]);
            }}
            placeholder="YYYY-MM-DD"
            testID="driver-dl-valid-till"
          />
          {errors.dl_valid_till && <Text style={styles.errorText}>{errors.dl_valid_till}</Text>}
          {warnings.length > 0 && warnings.map((w, i) => (
            <Text key={i} style={styles.warningText}>{w}</Text>
          ))}
        </View>

        {/* Address */}
        <View style={styles.field}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={[styles.input, errors.city && styles.inputError]}
            value={formData.city}
            onChangeText={(text) => {
              setFormData({ ...formData, city: text });
              setErrors({ ...errors, city: '' });
            }}
            placeholder="Enter city"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={[styles.input, errors.state && styles.inputError]}
            value={formData.state}
            onChangeText={(text) => {
              setFormData({ ...formData, state: text });
              setErrors({ ...errors, state: '' });
            }}
            placeholder="Enter state"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={[styles.input, errors.pincode && styles.inputError]}
            value={formData.pincode}
            onChangeText={(text) => {
              setFormData({ ...formData, pincode: text });
              setErrors({ ...errors, pincode: '' });
            }}
            placeholder="6-digit pincode"
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          testID="submit-driver-button"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Driver</Text>
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
    marginBottom: 16,
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
  inputError: {
    borderColor: '#e03131',
  },
  errorText: {
    color: '#e03131',
    fontSize: 12,
    marginTop: 4,
  },
  warningText: {
    color: '#ff9800',
    fontSize: 12,
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    minWidth: '30%',
  },
  radioOptionSelected: {
    borderColor: '#C90D0D',
    backgroundColor: '#ffe6e6',
  },
  radioText: {
    fontSize: 14,
  },
  radioTextSelected: {
    color: '#C90D0D',
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

export default DriverAddForm;

