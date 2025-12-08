/**
 * Driver Profile Screen
 * Pure React Native CLI - Uses Rodistaa Design System
 * Includes Driver License expiry warning
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProfileScreenBase, type ProfileData } from '@rodistaa/mobile-shared/src/components/Profile/ProfileScreenBase';

interface ProfileScreenProps {
  navigation: any;
}

export const DriverProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { data: profileData } = useQuery<ProfileData>({
    queryKey: ['driver-profile'],
    queryFn: async () => {
      // Mock data
      return {
        name: 'Ramesh Kumar',
        id: 'DRV001',
        role: 'Driver',
        mobile: '9876543212',
        trustScore: 88,
        documents: [
          { id: 'DOC001', type: 'Driving License', status: 'expiring' as const, expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'DOC002', type: 'Aadhaar', status: 'uploaded' as const },
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

  // Driver License expiry - get from documents or profile
  const driverLicense = profileData?.documents.find(doc => doc.type === 'Driving License');
  const driverLicenseExpiry = driverLicense?.expiryDate;

  if (!profileData) return null;

  return (
    <ProfileScreenBase
      profileData={profileData}
      onDocumentView={handleDocumentView}
      onLogout={handleLogout}
      onLanguageChange={(lang) => console.log('Language changed to:', lang)}
      driverLicenseExpiry={driverLicenseExpiry}
    />
  );
};

export default DriverProfileScreen;

