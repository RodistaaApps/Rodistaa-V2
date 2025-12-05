import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FleetScreen from '../screens/FleetScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ShipmentsScreen from '../screens/ShipmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#C90D0D',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#C90D0D',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: () => <span style={{ fontSize: 20 }}>🏠</span>,
        }}
      />
      <Tab.Screen 
        name="Fleet" 
        component={FleetScreen}
        options={{
          title: 'My Fleet',
          tabBarLabel: 'Fleet',
          tabBarIcon: () => <span style={{ fontSize: 20 }}>🚛</span>,
        }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{
          title: 'Available Bookings',
          tabBarLabel: 'Bookings',
          tabBarIcon: () => <span style={{ fontSize: 20 }}>📦</span>,
        }}
      />
      <Tab.Screen 
        name="Shipments" 
        component={ShipmentsScreen}
        options={{
          title: 'Active Shipments',
          tabBarLabel: 'Shipments',
          tabBarIcon: () => <span style={{ fontSize: 20 }}>🚚</span>,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: () => <span style={{ fontSize: 20 }}>👤</span>,
        }}
      />
    </Tab.Navigator>
  );
}

