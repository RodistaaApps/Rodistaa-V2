/**
 * Truck Detail Card
 * Displays canonical truck master info with tabs
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { RCard, RTag, RTabs } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';

interface TruckDetailCardProps {
  truck: any; // TruckMasterDetail
}

export function TruckDetailCard({ truck }: TruckDetailCardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const complianceStatus = truck.compliance?.allow ? 'ALLOWED' : truck.compliance ? 'BLOCKED' : 'PENDING';
  const complianceColor = complianceStatus === 'ALLOWED' ? 'success' : complianceStatus === 'BLOCKED' ? 'error' : 'warning';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <RCard style={styles.headerCard}>
        <View style={styles.header}>
          <View>
            <Text style={styles.rcNumber}>{truck.truck.rc_number}</Text>
            {truck.inference?.inferred_body_type && (
              <RTag
                label={truck.inference.inferred_body_type}
                variant="primary"
                size="medium"
                style={styles.classificationTag}
              />
            )}
          </View>
          <RTag
            label={complianceStatus}
            variant={complianceColor}
            size="medium"
          />
        </View>
        
        {truck.compliance?.reasons && truck.compliance.reasons.length > 0 && (
          <View style={styles.reasonsContainer}>
            <Text style={styles.reasonsTitle}>Block Reasons:</Text>
            {truck.compliance.reasons.map((reason: string, index: number) => (
              <Text key={index} style={styles.reasonText}>• {reason}</Text>
            ))}
          </View>
        )}

        {truck.compliance?.last_verified_at && (
          <Text style={styles.verifiedText}>
            Last verified: {new Date(truck.compliance.last_verified_at).toLocaleString()}
          </Text>
        )}
      </RCard>

      {/* Tabs */}
      <RTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'vahan', label: 'VAHAN Snapshot' },
          { id: 'inference', label: 'Inference' },
          { id: 'compliance', label: 'Compliance' },
          { id: 'links', label: 'Links' },
          { id: 'tickets', label: 'Tickets' },
        ]}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <RCard style={styles.tabCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Text style={styles.detail}>Status: {truck.truck.status}</Text>
          {truck.truck.nickname && <Text style={styles.detail}>Nickname: {truck.truck.nickname}</Text>}
          <Text style={styles.detail}>Onboarded: {new Date(truck.truck.onboarded_at).toLocaleDateString()}</Text>
        </RCard>
      )}

      {activeTab === 'vahan' && truck.latest_snapshot && (
        <RCard style={styles.tabCard}>
          <Text style={styles.sectionTitle}>VAHAN Data</Text>
          <Text style={styles.detail}>Provider: {truck.latest_snapshot.provider}</Text>
          <Text style={styles.detail}>Maker: {truck.latest_snapshot.maker || 'N/A'}</Text>
          <Text style={styles.detail}>Model: {truck.latest_snapshot.model_name || 'N/A'}</Text>
          <Text style={styles.detail}>GVW: {truck.latest_snapshot.gvw_kg || 'N/A'} kg</Text>
          <Text style={styles.detail}>Body Type: {truck.latest_snapshot.body_type_name || 'N/A'}</Text>
          <Text style={styles.detail}>Category: {truck.latest_snapshot.vehicle_category || 'N/A'}</Text>
        </RCard>
      )}

      {activeTab === 'inference' && truck.inference && (
        <RCard style={styles.tabCard}>
          <Text style={styles.sectionTitle}>Body Length Inference</Text>
          <Text style={styles.detail}>Method: {truck.inference.inference_method}</Text>
          <Text style={styles.detail}>Length: {truck.inference.inferred_length_ft || 'N/A'} ft</Text>
          <Text style={styles.detail}>Confidence: {(truck.inference.confidence_score * 100).toFixed(0)}%</Text>
        </RCard>
      )}

      {activeTab === 'compliance' && truck.compliance && (
        <RCard style={styles.tabCard}>
          <Text style={styles.sectionTitle}>Compliance History</Text>
          <Text style={styles.detail}>Status: {truck.compliance.allow ? 'ALLOWED' : 'BLOCKED'}</Text>
          <Text style={styles.detail}>Decision At: {new Date(truck.compliance.decision_at).toLocaleString()}</Text>
          <Text style={styles.detail}>Provider: {truck.compliance.provider || 'N/A'}</Text>
          {truck.compliance.rules_applied && (
            <View style={styles.rulesContainer}>
              <Text style={styles.detail}>Rules Applied:</Text>
              {truck.compliance.rules_applied.map((rule: string, index: number) => (
                <Text key={index} style={styles.ruleText}>• {rule}</Text>
              ))}
            </View>
          )}
        </RCard>
      )}

      {activeTab === 'links' && (
        <RCard style={styles.tabCard}>
          <Text style={styles.sectionTitle}>Linked Vehicles</Text>
          {truck.linked_tractor && (
            <Text style={styles.detail}>Tractor: {truck.linked_tractor.rc_number}</Text>
          )}
          {truck.linked_trailer && (
            <Text style={styles.detail}>Trailer: {truck.linked_trailer.rc_number}</Text>
          )}
          {!truck.linked_tractor && !truck.linked_trailer && (
            <Text style={styles.detail}>No linked vehicles</Text>
          )}
        </RCard>
      )}

      {activeTab === 'tickets' && (
        <RCard style={styles.tabCard}>
          <Text style={styles.sectionTitle}>HQ Tickets</Text>
          {truck.tickets && truck.tickets.length > 0 ? (
            truck.tickets.map((ticket: any) => (
              <View key={ticket.id} style={styles.ticketItem}>
                <Text style={styles.ticketType}>{ticket.ticket_type}</Text>
                <Text style={styles.ticketStatus}>Status: {ticket.status}</Text>
                <Text style={styles.ticketDate}>{new Date(ticket.created_at).toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.detail}>No tickets</Text>
          )}
        </RCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  headerCard: {
    margin: RodistaaSpacing.lg,
    padding: RodistaaSpacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  rcNumber: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  classificationTag: {
    marginTop: RodistaaSpacing.xs,
  },
  reasonsContainer: {
    marginTop: RodistaaSpacing.md,
    padding: RodistaaSpacing.md,
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
  },
  reasonsTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  reasonText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.error.main,
    marginBottom: RodistaaSpacing.xs,
  },
  verifiedText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginTop: RodistaaSpacing.md,
  },
  tabCard: {
    margin: RodistaaSpacing.lg,
    padding: RodistaaSpacing.lg,
  },
  sectionTitle: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  detail: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  rulesContainer: {
    marginTop: RodistaaSpacing.md,
  },
  ruleText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginLeft: RodistaaSpacing.md,
  },
  ticketItem: {
    padding: RodistaaSpacing.md,
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
    marginBottom: RodistaaSpacing.sm,
  },
  ticketType: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
  },
  ticketStatus: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  ticketDate: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.disabled,
  },
});

