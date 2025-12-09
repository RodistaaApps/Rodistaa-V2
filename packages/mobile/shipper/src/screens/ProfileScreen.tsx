/**
 * Shipper Profile Screen
 * Pure React Native CLI - Uses Rodistaa Design System
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProfileScreenBase, type ProfileData } from '@rodistaa/mobile-shared/src/components/Profile/ProfileScreenBase';

interface ProfileScreenProps {
  navigation: any;
}

export const ShipperProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { data: profileData } = useQuery<ProfileData>({
    queryKey: ['shipper-profile'],
    queryFn: async () => {
      // Mock data
      return {
        name: 'ABC Logistics',
        id: 'SHP001',
        role: 'Shipper',
        mobile: '9876543210',
        trustScore: 90,
        documents: [
          { id: 'DOC001', type: 'PAN', status: 'uploaded' as const },
          { id: 'DOC002', type: 'GST Certificate', status: 'uploaded' as const },
        ],
      };
    },
  });

  const handleDocumentView = async (docId: string, reason: string): Promise<string> => {
    console.log(`[AUDIT] Document ${docId} viewed. Reason: ${reason}`);
    return 'https://example.com/documents/' + docId;
  };

  const handleLogout = async () => {
    navigation.replace('Login');
  };

  if (!profileData) return null;

  return (
    <ProfileScreenBase
      profileData={profileData}
      onDocumentView={handleDocumentView}
      onLogout={handleLogout}
      onLanguageChange={(lang) => console.log('Language changed to:', lang)}
    />
  );
};

export default ShipperProfileScreen;

