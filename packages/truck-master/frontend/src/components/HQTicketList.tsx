/**
 * HQ Ticket List
 * HQ ticket UI for compliance team
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { RCard, RTag, RButton, RModal, RInput } from '@rodistaa/design-system';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';

interface HQTicketListProps {
  tickets: Ticket[];
  onResolve: (ticketId: number, resolutionNotes: string) => Promise<void>;
  onViewDetails: (ticket: Ticket) => void;
}

interface Ticket {
  id: number;
  ticket_type: string;
  priority: string;
  status: string;
  rc_number?: string;
  operator_id?: string;
  payload: any;
  assigned_to?: string;
  resolved_at?: Date;
  resolution_notes?: string;
  created_at: Date;
}

export function HQTicketList({ tickets, onResolve, onViewDetails }: HQTicketListProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleResolve = async () => {
    if (!selectedTicket) return;
    await onResolve(selectedTicket.id, resolutionNotes);
    setSelectedTicket(null);
    setResolutionNotes('');
  };

  const renderTicket = ({ item }: { item: Ticket }) => {
    const priorityColor = item.priority === 'CRITICAL' ? 'error' : item.priority === 'HIGH' ? 'warning' : 'default';

    return (
      <TouchableOpacity onPress={() => onViewDetails(item)}>
        <RCard style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <View>
              <Text style={styles.ticketType}>{item.ticket_type}</Text>
              <Text style={styles.ticketRC}>{item.rc_number || 'N/A'}</Text>
            </View>
            <RTag
              label={item.priority}
              variant={priorityColor}
              size="small"
            />
          </View>
          
          <Text style={styles.ticketStatus}>Status: {item.status}</Text>
          <Text style={styles.ticketDate}>{new Date(item.created_at).toLocaleString()}</Text>
          
          {item.payload?.mismatches && (
            <View style={styles.mismatchesContainer}>
              <Text style={styles.mismatchesTitle}>Provider Mismatches:</Text>
              {item.payload.mismatches.map((mismatch: string, index: number) => (
                <Text key={index} style={styles.mismatchText}>• {mismatch}</Text>
              ))}
            </View>
          )}

          {item.status === 'OPEN' && (
            <RButton
              title="Resolve"
              variant="primary"
              onPress={() => setSelectedTicket(item)}
              style={styles.resolveButton}
            />
          )}
        </RCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      {/* Resolution Modal */}
      {selectedTicket && (
        <RModal
          visible={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title="Resolve Ticket"
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Resolving: {selectedTicket.ticket_type}
            </Text>
            <Text style={styles.modalText}>
              RC: {selectedTicket.rc_number}
            </Text>
            
            {selectedTicket.payload && (
              <View style={styles.payloadContainer}>
                <Text style={styles.payloadTitle}>Payload:</Text>
                <Text style={styles.payloadText}>
                  {JSON.stringify(selectedTicket.payload, null, 2)}
                </Text>
              </View>
            )}

            <RInput
              label="Resolution Notes"
              placeholder="Enter resolution notes..."
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
            />

            <RButton
              title="Confirm Resolution"
              variant="primary"
              onPress={handleResolve}
              style={styles.confirmButton}
            />
          </View>
        </RModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  list: {
    padding: RodistaaSpacing.lg,
  },
  ticketCard: {
    marginBottom: RodistaaSpacing.md,
    padding: RodistaaSpacing.lg,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: RodistaaSpacing.md,
  },
  ticketType: {
    ...MobileTextStyles.h4,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  ticketRC: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  ticketStatus: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  ticketDate: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.disabled,
    marginBottom: RodistaaSpacing.sm,
  },
  mismatchesContainer: {
    marginTop: RodistaaSpacing.md,
    padding: RodistaaSpacing.md,
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
  },
  mismatchesTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  mismatchText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.error.main,
  },
  resolveButton: {
    marginTop: RodistaaSpacing.md,
  },
  modalContent: {
    padding: RodistaaSpacing.lg,
  },
  modalText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.md,
  },
  payloadContainer: {
    marginTop: RodistaaSpacing.md,
    padding: RodistaaSpacing.md,
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
  },
  payloadTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  payloadText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    fontFamily: 'monospace',
  },
  notesInput: {
    marginTop: RodistaaSpacing.lg,
  },
  confirmButton: {
    marginTop: RodistaaSpacing.lg,
  },
});

