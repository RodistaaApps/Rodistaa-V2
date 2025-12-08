/**
 * Payments Ledger Screen
 * Pure React Native CLI component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { RCard } from '@rodistaa/design-system';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@rodistaa/mobile-shared';

export interface PaymentsScreenProps {
  navigation: any;
}

interface Payment {
  id: string;
  type: 'advance' | 'balance' | 'refund';
  amount: number;
  bookingId: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description: string;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ navigation }) => {
  const [filter, setFilter] = useState<'all' | 'advance' | 'balance'>('all');

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ['payments', filter],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // return await apiClient.get(`/payments?filter=${filter}`);
      
      // Mock data
      return [
        {
          id: 'PAY001',
          type: 'advance',
          amount: 50000,
          bookingId: 'BKG001',
          status: 'completed',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Advance payment for BKG001',
        },
        {
          id: 'PAY002',
          type: 'balance',
          amount: 25000,
          bookingId: 'BKG001',
          status: 'completed',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Balance payment for BKG001',
        },
        {
          id: 'PAY003',
          type: 'advance',
          amount: 45000,
          bookingId: 'BKG002',
          status: 'pending',
          date: new Date().toISOString(),
          description: 'Advance payment for BKG002',
        },
      ].filter(p => filter === 'all' || p.type === filter);
    },
  });

  const totalAdvance = payments.filter(p => p.type === 'advance').reduce((sum, p) => sum + p.amount, 0);
  const totalBalance = payments.filter(p => p.type === 'balance').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const handleExport = () => {
    // TODO: Export to CSV
    console.log('Export payments to CSV');
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View>
          <Text style={styles.paymentId}>{item.id}</Text>
          <Text style={styles.paymentDescription}>{item.description}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.paymentFooter}>
        <Text style={styles.paymentAmount}>₹{item.amount.toLocaleString()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.paymentDate}>{formatDate(item.date)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payments & Ledger</Text>
        <TouchableOpacity onPress={handleExport} accessibilityLabel="Export to CSV">
          <Text style={styles.exportText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCards}>
        <RCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Advance</Text>
          <Text style={styles.summaryValue}>₹{(totalAdvance / 1000).toFixed(1)}K</Text>
        </RCard>
        <RCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Balance</Text>
          <Text style={styles.summaryValue}>₹{(totalBalance / 1000).toFixed(1)}K</Text>
        </RCard>
      </View>

      {pendingPayments > 0 && (
        <RCard style={[styles.alertCard, { backgroundColor: RodistaaColors.warning.light }]}>
          <Text style={styles.alertText}>
            ₹{pendingPayments.toLocaleString()} pending payment
          </Text>
        </RCard>
      )}

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'advance' && styles.filterTabActive]}
          onPress={() => setFilter('advance')}
        >
          <Text style={[styles.filterText, filter === 'advance' && styles.filterTextActive]}>Advance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'balance' && styles.filterTabActive]}
          onPress={() => setFilter('balance')}
        >
          <Text style={[styles.filterText, filter === 'balance' && styles.filterTextActive]}>Balance</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No payments found</Text>
          </View>
        }
      />
    </View>
  );
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'advance': return RodistaaColors.info.main;
    case 'balance': return RodistaaColors.success.main;
    default: return RodistaaColors.text.secondary;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return RodistaaColors.success.main;
    case 'pending': return RodistaaColors.warning.main;
    case 'failed': return RodistaaColors.error.main;
    default: return RodistaaColors.text.secondary;
  }
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: RodistaaSpacing.xl,
    backgroundColor: RodistaaColors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  headerTitle: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
  },
  exportText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.primary.main,
    fontWeight: '600',
  },
  summaryCards: {
    flexDirection: 'row',
    padding: RodistaaSpacing.md,
    gap: RodistaaSpacing.md,
  },
  summaryCard: {
    flex: 1,
    padding: RodistaaSpacing.lg,
    alignItems: 'center',
  },
  summaryLabel: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  summaryValue: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    fontWeight: '700',
  },
  alertCard: {
    margin: RodistaaSpacing.lg,
    padding: RodistaaSpacing.md,
  },
  alertText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.warning.dark,
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: RodistaaColors.background.paper,
    paddingHorizontal: RodistaaSpacing.sm,
    paddingVertical: RodistaaSpacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: RodistaaSpacing.md,
    alignItems: 'center',
    borderRadius: RodistaaSpacing.borderRadius.md,
    marginHorizontal: RodistaaSpacing.xs,
  },
  filterTabActive: {
    backgroundColor: RodistaaColors.primary.main,
  },
  filterText: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.text.secondary,
  },
  filterTextActive: {
    color: RodistaaColors.primary.contrast,
  },
  list: {
    padding: RodistaaSpacing.lg,
  },
  paymentCard: {
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
    padding: RodistaaSpacing.lg,
    marginBottom: RodistaaSpacing.md,
    borderLeftWidth: 4,
    borderLeftColor: RodistaaColors.primary.main,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: RodistaaSpacing.md,
  },
  paymentId: {
    ...MobileTextStyles.body,
    fontWeight: '700',
    color: RodistaaColors.text.primary,
    fontFamily: 'monospace',
    marginBottom: RodistaaSpacing.xs,
  },
  paymentDescription: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  typeBadge: {
    paddingHorizontal: RodistaaSpacing.sm,
    paddingVertical: 4,
    borderRadius: RodistaaSpacing.borderRadius.sm,
  },
  typeText: {
    ...MobileTextStyles.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.xs,
  },
  paymentAmount: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: RodistaaSpacing.sm,
    paddingVertical: 4,
    borderRadius: RodistaaSpacing.borderRadius.sm,
  },
  statusText: {
    ...MobileTextStyles.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paymentDate: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
  },
  empty: {
    alignItems: 'center',
    padding: RodistaaSpacing.xxxl,
  },
  emptyText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
  },
});

