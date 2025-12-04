/**
 * Truck Search Filter
 * Client-facing search filters for truck discovery
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { RInput, RButton, RCard } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';

interface TruckSearchFilterProps {
  onFilter: (filters: SearchFilters) => void;
  onReset: () => void;
}

export interface SearchFilters {
  category?: 'SMALL' | 'MEDIUM' | 'HEAVY' | 'SUPER_HEAVY' | 'TRAILER';
  bodyType?: 'OPEN' | 'CONTAINER' | 'FLATBED' | 'TRAILER';
  trailerSubtype?: 'CONTAINER' | 'FLATBED' | 'LOWBED' | 'SKELETAL';
  minPayload?: number;
  maxPayload?: number;
  complianceStatus?: 'ALLOWED' | 'BLOCKED' | 'PENDING';
}

export function TruckSearchFilter({ onFilter, onReset }: TruckSearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleCategoryChange = (category: SearchFilters['category']) => {
    setFilters({ ...filters, category });
  };

  const handleBodyTypeChange = (bodyType: SearchFilters['bodyType']) => {
    setFilters({ ...filters, bodyType });
  };

  const handleApply = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RCard style={styles.card}>
        <Text style={styles.title}>Filter Trucks</Text>

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.buttonRow}>
            <RButton
              title="Small"
              variant={filters.category === 'SMALL' ? 'primary' : 'secondary'}
              onPress={() => handleCategoryChange('SMALL')}
              style={styles.filterButton}
            />
            <RButton
              title="Medium"
              variant={filters.category === 'MEDIUM' ? 'primary' : 'secondary'}
              onPress={() => handleCategoryChange('MEDIUM')}
              style={styles.filterButton}
            />
            <RButton
              title="Heavy"
              variant={filters.category === 'HEAVY' ? 'primary' : 'secondary'}
              onPress={() => handleCategoryChange('HEAVY')}
              style={styles.filterButton}
            />
          </View>
          <View style={styles.buttonRow}>
            <RButton
              title="Super Heavy"
              variant={filters.category === 'SUPER_HEAVY' ? 'primary' : 'secondary'}
              onPress={() => handleCategoryChange('SUPER_HEAVY')}
              style={styles.filterButton}
            />
            <RButton
              title="Trailer"
              variant={filters.category === 'TRAILER' ? 'primary' : 'secondary'}
              onPress={() => handleCategoryChange('TRAILER')}
              style={styles.filterButton}
            />
          </View>
        </View>

        {/* Body Type Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Type</Text>
          <View style={styles.buttonRow}>
            <RButton
              title="Open"
              variant={filters.bodyType === 'OPEN' ? 'primary' : 'secondary'}
              onPress={() => handleBodyTypeChange('OPEN')}
              style={styles.filterButton}
            />
            <RButton
              title="Container"
              variant={filters.bodyType === 'CONTAINER' ? 'primary' : 'secondary'}
              onPress={() => handleBodyTypeChange('CONTAINER')}
              style={styles.filterButton}
            />
          </View>
          <View style={styles.buttonRow}>
            <RButton
              title="Flatbed"
              variant={filters.bodyType === 'FLATBED' ? 'primary' : 'secondary'}
              onPress={() => handleBodyTypeChange('FLATBED')}
              style={styles.filterButton}
            />
            <RButton
              title="Trailer"
              variant={filters.bodyType === 'TRAILER' ? 'primary' : 'secondary'}
              onPress={() => handleBodyTypeChange('TRAILER')}
              style={styles.filterButton}
            />
          </View>
        </View>

        {/* Payload Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payload Range (Tons)</Text>
          <View style={styles.inputRow}>
            <RInput
              placeholder="Min"
              value={filters.minPayload?.toString() || ''}
              onChangeText={(text) => setFilters({ ...filters, minPayload: parseFloat(text) || undefined })}
              keyboardType="decimal-pad"
              style={styles.halfInput}
            />
            <RInput
              placeholder="Max"
              value={filters.maxPayload?.toString() || ''}
              onChangeText={(text) => setFilters({ ...filters, maxPayload: parseFloat(text) || undefined })}
              keyboardType="decimal-pad"
              style={styles.halfInput}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <RButton
            title="Apply Filters"
            variant="primary"
            onPress={handleApply}
            style={styles.actionButton}
          />
          <RButton
            title="Reset"
            variant="secondary"
            onPress={handleReset}
            style={styles.actionButton}
          />
        </View>
      </RCard>
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
    padding: RodistaaSpacing.lg,
  },
  title: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.lg,
  },
  section: {
    marginBottom: RodistaaSpacing.lg,
  },
  sectionTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: RodistaaSpacing.sm,
    marginBottom: RodistaaSpacing.sm,
  },
  filterButton: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: RodistaaSpacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  actions: {
    marginTop: RodistaaSpacing.lg,
    gap: RodistaaSpacing.md,
  },
  actionButton: {
    width: '100%',
  },
});

