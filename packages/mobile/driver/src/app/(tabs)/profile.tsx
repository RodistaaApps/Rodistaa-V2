import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('authToken');
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.name}>Driver Name</Text>
        <Text style={styles.phone}>+91 9876543210</Text>
        <View style={styles.kycBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
          <Text style={styles.kycText}>License Verified</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹45K</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/edit')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="person-outline" size={24} color="#C90D0D" />
          </View>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={24} color="#D0D0D0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/license')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="card-outline" size={24} color="#C90D0D" />
          </View>
          <Text style={styles.menuText}>Driving License</Text>
          <Ionicons name="chevron-forward" size={24} color="#D0D0D0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/documents')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="document-text-outline" size={24} color="#C90D0D" />
          </View>
          <Text style={styles.menuText}>Documents</Text>
          <Ionicons name="chevron-forward" size={24} color="#D0D0D0" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipments</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/shipments')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="cube-outline" size={24} color="#C90D0D" />
          </View>
          <Text style={styles.menuText}>My Shipments</Text>
          <Ionicons name="chevron-forward" size={24} color="#D0D0D0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/earnings')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="cash-outline" size={24} color="#C90D0D" />
          </View>
          <Text style={styles.menuText}>Earnings</Text>
          <Ionicons name="chevron-forward" size={24} color="#D0D0D0" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/support/help')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="help-circle-outline" size={24} color="#C90D0D" />
          </View>
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#D0D0D0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/support/about')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="information-circle-outline" size={24} color="#C90D0D" />
          </View>
          <Text style={styles.menuText}>About</Text>
          <Ionicons name="chevron-forward" size={24} color="#D0D0D0" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#C90D0D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#4F4F4F',
    marginBottom: 12,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  kycText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C90D0D',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#4F4F4F',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F4F4F',
    marginLeft: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    padding: 16,
  },
  version: {
    fontSize: 14,
    color: '#999999',
  },
});
