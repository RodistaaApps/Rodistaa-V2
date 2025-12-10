/**
 * Navigation State Hook
 * Manages navigation-related state (last route, pending deep links, etc.)
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage } from '../storage/secureStorage';

const LAST_ROUTE_KEY = '@rodistaa/last_route';
const LAST_TAB_KEY = '@rodistaa/last_tab';
const PENDING_DEEP_LINK_KEY = '@rodistaa/pending_deep_link';

export interface NavigationState {
  lastRoute: string | null;
  lastTab: string | null;
  pendingDeepLink: string | null;
  isRestoring: boolean;
}

export function useNavigationState() {
  const [state, setState] = useState<NavigationState>({
    lastRoute: null,
    lastTab: null,
    pendingDeepLink: null,
    isRestoring: true,
  });

  // Restore state on mount
  useEffect(() => {
    restoreNavigationState();
  }, []);

  async function restoreNavigationState() {
    try {
      const [lastRoute, lastTab, pendingDeepLink] = await Promise.all([
        AsyncStorage.getItem(LAST_ROUTE_KEY),
        AsyncStorage.getItem(LAST_TAB_KEY),
        AsyncStorage.getItem(PENDING_DEEP_LINK_KEY),
      ]);

      setState({
        lastRoute,
        lastTab,
        pendingDeepLink,
        isRestoring: false,
      });
    } catch (error) {
      console.error('Failed to restore navigation state:', error);
      setState((prev) => ({ ...prev, isRestoring: false }));
    }
  }

  async function saveLastRoute(route: string) {
    try {
      await AsyncStorage.setItem(LAST_ROUTE_KEY, route);
      setState((prev) => ({ ...prev, lastRoute: route }));
    } catch (error) {
      console.error('Failed to save last route:', error);
    }
  }

  async function saveLastTab(tab: string) {
    try {
      await AsyncStorage.setItem(LAST_TAB_KEY, tab);
      setState((prev) => ({ ...prev, lastTab: tab }));
    } catch (error) {
      console.error('Failed to save last tab:', error);
    }
  }

  async function setPendingDeepLink(deepLink: string | null) {
    try {
      if (deepLink) {
        await AsyncStorage.setItem(PENDING_DEEP_LINK_KEY, deepLink);
      } else {
        await AsyncStorage.removeItem(PENDING_DEEP_LINK_KEY);
      }
      setState((prev) => ({ ...prev, pendingDeepLink: deepLink }));
    } catch (error) {
      console.error('Failed to set pending deep link:', error);
    }
  }

  async function clearPendingDeepLink() {
    await setPendingDeepLink(null);
  }

  return {
    ...state,
    saveLastRoute,
    saveLastTab,
    setPendingDeepLink,
    clearPendingDeepLink,
  };
}

