/**
 * RPhotoGallery - Rodistaa Web Photo Gallery Component
 * For displaying multiple photos (truck inspection, etc.)
 */

import React, { CSSProperties, useState } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { RodistaaSpacing, WebShadowStyles } from '../../tokens/spacing';

export interface RPhotoGalleryProps {
  photos: string[];
  onPhotoClick?: (index: number) => void;
  columns?: number;
  className?: string;
  style?: CSSProperties;
}

export const RPhotoGallery: React.FC<RPhotoGalleryProps> = ({
  photos,
  onPhotoClick,
  columns = 3,
  className = '',
  style,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const galleryStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${RodistaaSpacing.md}px`,
    ...style,
  };

  const photoWrapperStyles: CSSProperties = {
    position: 'relative',
    paddingBottom: '75%', // 4:3 aspect ratio
    overflow: 'hidden',
    borderRadius: `${RodistaaSpacing.borderRadius.lg}px`,
    cursor: onPhotoClick ? 'pointer' : 'default',
    boxShadow: WebShadowStyles.sm,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const photoStyles: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  return (
    <div className={className} style={galleryStyles}>
      {photos.map((photo, index) => (
        <div
          key={index}
          style={{
            ...photoWrapperStyles,
            ...(hoveredIndex === index && {
              transform: 'scale(1.05)',
              boxShadow: WebShadowStyles.md,
            }),
          }}
          onClick={() => onPhotoClick?.(index)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <img src={photo} alt={`Photo ${index + 1}`} style={photoStyles} />
        </div>
      ))}
    </div>
  );
};

export default RPhotoGallery;

