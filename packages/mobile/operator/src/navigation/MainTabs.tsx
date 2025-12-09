import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';

// Screens
import OperatorHomeScreen from '../screens/OperatorHomeScreen';
import FleetScreen from '../screens/FleetScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ShipmentsScreen from '../screens/ShipmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Wrap each screen to catch errors and ensure rendering
const SafeScreen = (Component: React.ComponentType<any>, screenName: string) => {
  return (props: any) => (
    <ScreenWrapper screenName={screenName}>
      <Component {...props} />
    </ScreenWrapper>
  );
};

// Tab icon component that works on web and native
const TabIcon = ({ emoji }: { emoji: string }) => (
  <Text style={{ fontSize: 20 }}>{emoji}</Text>
);

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
        component={SafeScreen(OperatorHomeScreen, 'OperatorHomeScreen')}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <TabIcon emoji="🏠" />,
        }}
      />
      <Tab.Screen 
        name="Fleet" 
        component={SafeScreen(FleetScreen, 'FleetScreen')}
        options={{
          title: 'My Fleet',
          tabBarLabel: 'Fleet',
          tabBarIcon: ({ color, size }) => <TabIcon emoji="🚛" />,
        }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={SafeScreen(BookingsScreen, 'BookingsScreen')}
        options={{
          title: 'Available Bookings',
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => <TabIcon emoji="📦" />,
        }}
      />
      <Tab.Screen 
        name="Shipments" 
        component={SafeScreen(ShipmentsScreen, 'ShipmentsScreen')}
        options={{
          title: 'Active Shipments',
          tabBarLabel: 'Shipments',
          tabBarIcon: ({ color, size }) => <TabIcon emoji="🚚" />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={SafeScreen(ProfileScreen, 'ProfileScreen')}
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <TabIcon emoji="👤" />,
        }}
      />
    </Tab.Navigator>
  );
}

