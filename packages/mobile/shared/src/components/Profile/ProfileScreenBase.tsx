/**
 * Profile Screen Base Component
 * Pure React Native CLI - Uses Rodistaa Design System
 * Shared base for all role-specific Profile screens
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system/tokens';
import { RProfileCard, RListCard, RActionButton } from '../ui';

export interface Document {
  id: string;
  type: string;
  status: 'uploaded' | 'missing' | 'expiring' | 'expired';
  expiryDate?: string;
}

export interface ProfileData {
  name: string;
  id: string;
  role: string;
  mobile: string;
  franchise?: string;
  trustScore?: number;
  documents: Document[];
}

export interface ProfileScreenBaseProps {
  profileData: ProfileData;
  onProfileUpdate?: (data: Partial<ProfileData>) => Promise<void>;
  onDocumentView?: (docId: string, reason: string) => Promise<string>;
  onLogout?: () => void;
  onLanguageChange?: (lang: string) => void;
  onMobileChange?: (mobile: string) => void;
  isAdmin?: boolean;
  driverLicenseExpiry?: string; // For driver role
}

export const ProfileScreenBase: React.FC<ProfileScreenBaseProps> = ({
  profileData,
  onProfileUpdate,
  onDocumentView,
  onLogout,
  onLanguageChange,
  onMobileChange,
  isAdmin = false,
  driverLicenseExpiry,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return RodistaaColors.success.main;
      case 'missing':
        return RodistaaColors.error.main;
      case 'expiring':
        return RodistaaColors.warning.main;
      case 'expired':
        return RodistaaColors.error.main;
      default:
        return RodistaaColors.text.secondary;
    }
  };

  const handleViewDocument = async (docId: string) => {
    setSelectedDocId(docId);
    setReasonModalVisible(true);
  };

  const handleConfirmViewDocument = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for viewing this document');
      return;
    }

    if (!onDocumentView || !selectedDocId) return;

    try {
      const signedUrl = await onDocumentView(selectedDocId, reason);
      // Navigate to document viewer or open URL
      Alert.alert('Success', 'Document opened');
      setReasonModalVisible(false);
      setReason('');
      setSelectedDocId(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to open document');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            onLogout?.();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <RProfileCard
        name={profileData.name}
        id={profileData.id}
        role={profileData.role}
        mobile={profileData.mobile}
        franchise={profileData.franchise}
        trustScore={profileData.trustScore}
        showEditButton={!isEditing}
        onEditPress={() => setIsEditing(true)}
      />

      {/* Driver License Expiry Warning */}
      {driverLicenseExpiry && (
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>License Expiring Soon</Text>
            <Text style={styles.warningText}>
              Your license expires on {new Date(driverLicenseExpiry).toLocaleDateString()}
            </Text>
          </View>
          <RActionButton
            label="Reupload"
            variant="primary"
            size="small"
            onPress={() => {
              // Navigate to license upload
            }}
          />
        </View>
      )}

      {/* KYC & Documents Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>KYC & Documents</Text>
        {profileData.documents.map((doc) => (
          <RListCard
            key={doc.id}
            title={doc.type}
            subtitle={doc.expiryDate ? `Expires: ${new Date(doc.expiryDate).toLocaleDateString()}` : 'No expiry'}
            rightContent={
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.status) }]}>
                <Text style={styles.statusBadgeText}>{doc.status.toUpperCase()}</Text>
              </View>
            }
            onPress={() => doc.status === 'uploaded' && handleViewDocument(doc.id)}
            testID={`doc-${doc.id}`}
          />
        ))}
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        {/* Language Selector */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Language</Text>
          <View style={styles.languageButtons}>
            {['EN', 'TE', 'HI'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  selectedLanguage === lang && styles.languageButtonActive,
                ]}
                onPress={() => {
                  setSelectedLanguage(lang);
                  onLanguageChange?.(lang);
                }}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    selectedLanguage === lang && styles.languageButtonTextActive,
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Change Mobile */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            // Navigate to mobile change flow
          }}
        >
          <Text style={styles.settingLabel}>Change Mobile</Text>
          <Text style={styles.settingValue}>{profileData.mobile}</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        {/* Notification Toggles */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: RodistaaColors.border.default, true: RodistaaColors.primary.main }}
          />
        </View>
      </View>

      {/* Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={styles.menuText}>Logout</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Alert.alert('Revoke Tokens', 'All sessions will be logged out');
          }}
        >
          <Text style={styles.menuIcon}>🔒</Text>
          <Text style={styles.menuText}>Revoke All Tokens</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            // Navigate to device management
          }}
        >
          <Text style={styles.menuIcon}>📱</Text>
          <Text style={styles.menuText}>Device Management</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Legal & Policies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal & Policies</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            // Navigate to no refund policy
          }}
        >
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuText}>No Refund Policy</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            // Navigate to terms
          }}
        >
          <Text style={styles.menuIcon}>📄</Text>
          <Text style={styles.menuText}>Terms & Conditions</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Controls (Hidden unless admin) */}
      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Controls</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Alert.alert('Impersonate', 'This will generate an audit entry');
            }}
          >
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>Impersonate User</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Alert.alert('Block/Unblock', 'Manage user status');
            }}
          >
            <Text style={styles.menuIcon}>🚫</Text>
            <Text style={styles.menuText}>Block/Unblock User</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reason Modal for Document Viewing */}
      <Modal
        visible={reasonModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReasonModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reason for Viewing Document</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              placeholderTextColor={RodistaaColors.text.disabled}
            />
            <View style={styles.modalButtons}>
              <RActionButton
                label="Cancel"
                variant="outline"
                onPress={() => {
                  setReasonModalVisible(false);
                  setReason('');
                }}
                style={styles.modalButton}
              />
              <RActionButton
                label="View Document"
                variant="primary"
                onPress={handleConfirmViewDocument}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  section: {
    marginTop: RodistaaSpacing.lg,
    backgroundColor: RodistaaColors.background.paper,
  },
  sectionTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.secondary,
    padding: RodistaaSpacing.lg,
    paddingBottom: RodistaaSpacing.md,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.warning.main,
    margin: RodistaaSpacing.lg,
    padding: RodistaaSpacing.lg,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    ...RNShadowStyles.sm,
  },
  warningIcon: {
    fontSize: 32,
    marginRight: RodistaaSpacing.md,
  },
  warningContent: {
    flex: 1,
    marginRight: RodistaaSpacing.md,
  },
  warningTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  warningText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.xs,
    borderRadius: RodistaaSpacing.borderRadius.md,
  },
  statusBadgeText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.primary.contrast,
    fontWeight: '700',
    fontSize: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: RodistaaSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  settingLabel: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    flex: 1,
  },
  settingValue: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginRight: RodistaaSpacing.sm,
  },
  settingArrow: {
    fontSize: 24,
    color: RodistaaColors.text.secondary,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: RodistaaSpacing.sm,
  },
  languageButton: {
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.xs,
    borderRadius: RodistaaSpacing.borderRadius.md,
    borderWidth: 1,
    borderColor: RodistaaColors.border.default,
    backgroundColor: RodistaaColors.background.default,
  },
  languageButtonActive: {
    backgroundColor: RodistaaColors.primary.main,
    borderColor: RodistaaColors.primary.main,
  },
  languageButtonText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
  },
  languageButtonTextActive: {
    color: RodistaaColors.primary.contrast,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: RodistaaSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: RodistaaSpacing.md,
  },
  menuText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    flex: 1,
  },
  menuArrow: {
    fontSize: 24,
    color: RodistaaColors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.lg,
  },
  reasonInput: {
    ...MobileTextStyles.body,
    borderWidth: 1,
    borderColor: RodistaaColors.border.default,
    borderRadius: RodistaaSpacing.borderRadius.md,
    padding: RodistaaSpacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: RodistaaSpacing.lg,
    color: RodistaaColors.text.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: RodistaaSpacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

