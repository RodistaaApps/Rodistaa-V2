/**
 * InspectionGrid - Rodistaa Web Inspection Grid Component
 * Photo grid for truck inspections with upload capability
 */

import React, { CSSProperties, useState } from 'react';
import { RCardWeb } from './RCardWeb';
import { RButtonWeb } from './RButtonWeb';
import { RodistaaColors } from '../../tokens/colors';
import { WebTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface InspectionPhoto {
  id: string;
  url: string;
  type: 'front' | 'back' | 'left' | 'right' | 'interior' | 'document' | 'other';
  uploadedAt: string;
  geotagged?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface InspectionGridProps {
  photos: InspectionPhoto[];
  onPhotoClick?: (photo: InspectionPhoto) => void;
  onUpload?: (type: InspectionPhoto['type'], file: File) => void;
  canUpload?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const InspectionGrid: React.FC<InspectionGridProps> = ({
  photos,
  onPhotoClick,
  onUpload,
  canUpload = false,
  className = '',
  style,
}) => {
  const [uploadingType, setUploadingType] = useState<InspectionPhoto['type'] | null>(null);

  const photoTypes: Array<{ type: InspectionPhoto['type']; label: string; required: boolean }> = [
    { type: 'front', label: 'Front View', required: true },
    { type: 'back', label: 'Back View', required: true },
    { type: 'left', label: 'Left Side', required: true },
    { type: 'right', label: 'Right Side', required: true },
    { type: 'interior', label: 'Interior', required: false },
    { type: 'document', label: 'Documents', required: false },
    { type: 'other', label: 'Other', required: false },
  ];

  const handleFileSelect = (type: InspectionPhoto['type'], event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      setUploadingType(type);
      onUpload(type, file);
      // Reset after upload
      setTimeout(() => {
        setUploadingType(null);
        event.target.value = '';
      }, 1000);
    }
  };

  const getPhotoForType = (type: InspectionPhoto['type']): InspectionPhoto | undefined => {
    return photos.find((p) => p.type === type);
  };

  const renderPhotoCell = (photoType: typeof photoTypes[0]) => {
    const photo = getPhotoForType(photoType.type);
    const hasPhoto = !!photo;
    const isUploading = uploadingType === photoType.type;

    return (
      <div
        key={photoType.type}
        style={{
          position: 'relative',
          aspectRatio: '1',
          borderRadius: `${RodistaaSpacing.borderRadius.md}px`,
          overflow: 'hidden',
          backgroundColor: RodistaaColors.background.paper,
          border: `2px dashed ${hasPhoto ? RodistaaColors.border.default : RodistaaColors.border.light}`,
          cursor: onPhotoClick && hasPhoto ? 'pointer' : 'default',
          transition: 'all 120ms ease',
        }}
        onClick={() => hasPhoto && photo && onPhotoClick?.(photo)}
      >
        {hasPhoto && photo ? (
          <>
            <img
              src={photo.url}
              alt={photoType.label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: `${RodistaaSpacing.xs}px`,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                ...WebTextStyles.caption,
                color: RodistaaColors.text.inverse,
                textAlign: 'center',
              }}
            >
              {photoType.label}
              {photo.geotagged && ' 📍'}
            </div>
          </>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${RodistaaSpacing.sm}px`,
              padding: `${RodistaaSpacing.md}px`,
            }}
          >
            {canUpload && onUpload ? (
              <>
                <div style={{ ...WebTextStyles.caption, color: RodistaaColors.text.secondary, textAlign: 'center' }}>
                  {photoType.label}
                  {photoType.required && (
                    <span style={{ color: RodistaaColors.error.main }}> *</span>
                  )}
                </div>
                <label
                  style={{
                    cursor: 'pointer',
                    padding: `${RodistaaSpacing.xs}px ${RodistaaSpacing.sm}px`,
                    backgroundColor: RodistaaColors.primary.main,
                    borderRadius: `${RodistaaSpacing.borderRadius.sm}px`,
                    ...WebTextStyles.caption,
                    color: RodistaaColors.primary.contrast,
                    fontWeight: '600',
                    display: 'inline-block',
                  }}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(photoType.type, e)}
                    disabled={isUploading}
                  />
                </label>
              </>
            ) : (
              <div style={{ ...WebTextStyles.caption, textAlign: 'center', color: RodistaaColors.text.disabled }}>
                {photoType.label}
                {photoType.required && (
                  <span style={{ color: RodistaaColors.error.main }}> *</span>
                )}
                <div style={{ marginTop: `${RodistaaSpacing.xs}px` }}>No photo</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className} style={style}>
      <RCardWeb>
        <div style={{ marginBottom: `${RodistaaSpacing.md}px` }}>
          <h3 style={{ ...WebTextStyles.h3, marginBottom: `${RodistaaSpacing.sm}px` }}>
            Inspection Photos
          </h3>
          <p style={{ ...WebTextStyles.bodySmall, color: RodistaaColors.text.secondary }}>
            Upload geotagged photos for truck inspection. Required photos are marked with *.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: `${RodistaaSpacing.md}px`,
          }}
        >
          {photoTypes.map((photoType) => renderPhotoCell(photoType))}
        </div>
      </RCardWeb>
    </div>
  );
};

export default InspectionGrid;

