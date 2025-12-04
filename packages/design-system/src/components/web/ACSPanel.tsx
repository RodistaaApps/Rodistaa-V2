/**
 * ACSPanel - Rodistaa Web ACS Override Panel Component
 * Panel for viewing and approving ACS override requests
 */

import React, { CSSProperties, useState } from 'react';
import { RCardWeb } from './RCardWeb';
import { RButtonWeb } from './RButtonWeb';
import { RTagWeb } from './RTagWeb';
import { RModalWeb } from './RModalWeb';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface ACSOverride {
  id: string;
  entityType: 'truck' | 'booking' | 'bid' | 'shipment' | 'user';
  entityId: string;
  ruleId: string;
  ruleName: string;
  violation: string;
  requestedBy: string;
  requestedAt: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface ACSPanelProps {
  overrides: ACSOverride[];
  canApprove?: boolean;
  onApprove?: (overrideId: string, notes?: string) => Promise<void>;
  onReject?: (overrideId: string, reason: string) => Promise<void>;
  onViewDetails?: (override: ACSOverride) => void;
  className?: string;
  style?: CSSProperties;
}

export const ACSPanel: React.FC<ACSPanelProps> = ({
  overrides,
  canApprove = false,
  onApprove,
  onReject,
  onViewDetails,
  className = '',
  style,
}) => {
  const [selectedOverride, setSelectedOverride] = useState<ACSOverride | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewText, setReviewText] = useState('');

  const handleApprove = (override: ACSOverride) => {
    setSelectedOverride(override);
    setReviewAction('approve');
    setReviewText('');
    setShowReviewModal(true);
  };

  const handleReject = (override: ACSOverride) => {
    setSelectedOverride(override);
    setReviewAction('reject');
    setReviewText('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedOverride) return;

    if (reviewAction === 'approve' && onApprove) {
      await onApprove(selectedOverride.id, reviewText);
    } else if (reviewAction === 'reject' && onReject) {
      if (!reviewText.trim()) {
        alert('Rejection reason is required');
        return;
      }
      await onReject(selectedOverride.id, reviewText);
    }

    setShowReviewModal(false);
    setSelectedOverride(null);
    setReviewAction(null);
    setReviewText('');
  };

  const getStatusVariant = (status: ACSOverride['status']): 'primary' | 'success' | 'error' | 'neutral' => {
    switch (status) {
      case 'pending':
        return 'primary';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOverride = (override: ACSOverride) => {
    return (
      <RCardWeb key={override.id} style={{ marginBottom: `${RodistaaSpacing.md}px` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.md}px` }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ ...WebTextStyles.h4, color: RodistaaColors.text.primary, marginBottom: '4px' }}>
                {override.ruleName}
              </div>
              <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary }}>
                {override.entityType.toUpperCase()} #{override.entityId.slice(-8)}
              </div>
            </div>
            <RTagWeb label={override.status} variant={getStatusVariant(override.status)} size="small" />
          </div>

          {/* Violation */}
          <div
            style={{
              padding: `${RodistaaSpacing.md}px`,
              backgroundColor: RodistaaColors.error.light,
              borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
            }}
          >
            <div style={{ ...WebTextStyles.caption, color: RodistaaColors.error.main, fontWeight: '600', marginBottom: '4px' }}>
              Violation
            </div>
            <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.primary }}>
              {override.violation}
            </div>
          </div>

          {/* Justification */}
          <div>
            <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, marginBottom: '4px' }}>
              Justification
            </div>
            <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.primary }}>
              {override.justification}
            </div>
          </div>

          {/* Meta Info */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: `${RodistaaSpacing.sm}px`,
              borderTop: `1px solid ${RodistaaColors.border.light}`,
              ...WebTextStyles.caption,
              color: RodistaaColors.text.secondary,
            }}
          >
            <div>Requested by: {override.requestedBy}</div>
            <div>{formatDate(override.requestedAt)}</div>
          </div>

          {/* Review Info */}
          {override.status !== 'pending' && override.reviewedBy && (
            <div
              style={{
                padding: `${RodistaaSpacing.md}px`,
                backgroundColor: RodistaaColors.background.paper,
                borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
              }}
            >
              <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, marginBottom: '4px' }}>
                Reviewed by {override.reviewedBy} on {override.reviewedAt && formatDate(override.reviewedAt)}
              </div>
              {override.reviewNotes && (
                <div style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.primary, marginTop: '4px' }}>
                  {override.reviewNotes}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {override.status === 'pending' && canApprove && (
            <div style={{ display: 'flex', gap: `${RodistaaSpacing.sm}px` }}>
              {onViewDetails && (
                <RButtonWeb variant="secondary" size="small" onClick={() => onViewDetails(override)}>
                  View Details
                </RButtonWeb>
              )}
              {onApprove && (
                <RButtonWeb variant="primary" size="small" onClick={() => handleApprove(override)}>
                  Approve
                </RButtonWeb>
              )}
              {onReject && (
                <RButtonWeb variant="danger" size="small" onClick={() => handleReject(override)}>
                  Reject
                </RButtonWeb>
              )}
            </div>
          )}
        </div>
      </RCardWeb>
    );
  };

  return (
    <>
      <div className={className} style={style}>
        <RCardWeb>
          <div style={{ marginBottom: `${RodistaaSpacing.lg}px` }}>
            <h3 style={{ ...WebTextStyles.h3, marginBottom: `${RodistaaSpacing.sm}px` }}>
              ACS Override Requests
            </h3>
            <p style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.secondary }}>
              {canApprove
                ? 'Review and approve/reject ACS override requests. All actions are logged.'
                : 'View ACS override requests. Approval requires admin access.'}
            </p>
          </div>
          <div>
            {overrides.length === 0 ? (
              <div
                style={{
                  padding: `${RodistaaSpacing.xl}px`,
                  textAlign: 'center',
                  ...WebTextStyles.body,
                  color: RodistaaColors.text.secondary,
                }}
              >
                No override requests
              </div>
            ) : (
              overrides.map((override) => renderOverride(override))
            )}
          </div>
        </RCardWeb>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedOverride && (
        <RModalWeb
          visible={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedOverride(null);
            setReviewAction(null);
            setReviewText('');
          }}
          title={reviewAction === 'approve' ? 'Approve Override' : 'Reject Override'}
          size="medium"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${RodistaaSpacing.md}px` }}>
            <div>
              <div style={{ ...WebTextStyles.body, marginBottom: `${RodistaaSpacing.sm}px` }}>
                {reviewAction === 'approve'
                  ? 'Please provide notes for approving this override:'
                  : 'Please provide a reason for rejecting this override (required):'}
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={
                  reviewAction === 'approve'
                    ? 'Enter approval notes...'
                    : 'Enter rejection reason...'
                }
                required={reviewAction === 'reject'}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: `${RodistaaSpacing.md}px`,
                  border: `1px solid ${RodistaaColors.border.default}`,
                  borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
                  fontFamily: WebTextStyles.body.fontFamily,
                  fontSize: WebTextStyles.body.fontSize,
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: `${RodistaaSpacing.sm}px`, justifyContent: 'flex-end' }}>
              <RButtonWeb
                variant="secondary"
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedOverride(null);
                  setReviewAction(null);
                  setReviewText('');
                }}
              >
                Cancel
              </RButtonWeb>
              <RButtonWeb
                variant={reviewAction === 'approve' ? 'primary' : 'danger'}
                onClick={submitReview}
                disabled={reviewAction === 'reject' && !reviewText.trim()}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </RButtonWeb>
            </div>
          </div>
        </RModalWeb>
      )}
    </>
  );
};

export default ACSPanel;

