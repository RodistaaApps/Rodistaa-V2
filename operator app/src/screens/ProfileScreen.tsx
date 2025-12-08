/**
 * Operator Profile Screen
 * Pure React Native CLI - Uses Rodistaa Design System
 * Comprehensive profile with KYC, Documents, Settings, Security
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProfileScreenBase, type ProfileData, type Document } from '@rodistaa/mobile-shared/components/Profile/ProfileScreenBase';
import { SecureStore } from '../utils/storage.web';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  // Fetch profile data
  const { data: profileData } = useQuery<ProfileData>({
    queryKey: ['operator-profile'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/mobile/v1/users/OPR001/profile');
      // return response.data;
      
      // Mock data
      return {
        name: 'XYZ Transport',
        id: 'OPR001',
        role: 'Operator',
        mobile: '9876543211',
        franchise: 'Rodistaa Hyderabad',
        trustScore: 85,
        documents: [
          { id: 'DOC001', type: 'PAN', status: 'uploaded' as const },
          { id: 'DOC002', type: 'GST Certificate', status: 'uploaded' as const },
          { id: 'DOC003', type: 'Trade License', status: 'expiring' as const, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      };
    },
  });

  const handleDocumentView = async (docId: string, reason: string): Promise<string> => {
    // Call API with reason, generate audit log
    // const response = await apiClient.post('/mobile/v1/documents/' + docId + '/view', { reason });
    // return response.data.signedUrl;
    
    // Mock implementation
    console.log(`[AUDIT] Document ${docId} viewed. Reason: ${reason}`);
    return 'https://example.com/documents/' + docId;
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userRole');
    navigation.replace('Login');
  };

  if (!profileData) {
    return null; // Or loading state
  }

  return (
    <ProfileScreenBase
      profileData={profileData}
      onDocumentView={handleDocumentView}
      onLogout={handleLogout}
      onLanguageChange={(lang) => {
        // Handle language change
        console.log('Language changed to:', lang);
      }}
      isAdmin={false} // Get from user context
    />
  );
}
