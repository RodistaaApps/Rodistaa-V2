/**
 * Override Requests Page - Uses design system ACSPanel component
 */

import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { ACSPanel } from '@rodistaa/design-system';
import { RodistaaColors, WebTextStyles, RodistaaSpacing } from '@rodistaa/design-system';

function OverridesPage() {
  const mockOverrides = [
    {
      id: 'OVR-001',
      entityType: 'bid' as const,
      entityId: 'BID-001',
      ruleId: 'RULE-001',
      ruleName: 'One Active Bid Per Operator',
      violation: 'Operator has multiple active bids for same booking',
      requestedBy: 'District Franchise - North',
      requestedAt: '2024-01-02T10:30:00Z',
      justification: 'Operator dispute resolution - special case',
      status: 'pending' as const,
    },
    {
      id: 'OVR-002',
      entityType: 'truck' as const,
      entityId: 'TRK-001',
      ruleId: 'RULE-002',
      ruleName: 'Truck Document Expiry',
      violation: 'Truck documents expired',
      requestedBy: 'ACS Engine',
      requestedAt: '2024-01-02T09:15:00Z',
      justification: 'Document verification completed - renewal in process',
      status: 'pending' as const,
    },
  ];

  const handleApprove = async (overrideId: string, notes?: string) => {
    console.log('Approve override:', overrideId, notes);
    const override = mockOverrides.find((o) => o.id === overrideId);
    if (override) {
      override.status = 'approved';
      override.reviewedBy = 'Admin User';
      override.reviewedAt = new Date().toISOString();
      override.reviewNotes = notes;
    }
  };

  const handleReject = async (overrideId: string, reason: string) => {
    console.log('Reject override:', overrideId, reason);
    const override = mockOverrides.find((o) => o.id === overrideId);
    if (override) {
      override.status = 'rejected';
      override.reviewedBy = 'Admin User';
      override.reviewedAt = new Date().toISOString();
      override.reviewNotes = reason;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AdminLayout>
        <h1 style={{ ...WebTextStyles.h1, marginBottom: RodistaaSpacing.xl }}>Override Requests</h1>

        <ACSPanel
          overrides={mockOverrides}
          canApprove={true}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewDetails={(override) => console.log('View details:', override)}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default OverridesPage;
