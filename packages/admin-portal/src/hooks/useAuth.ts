/**
 * Authentication Hook for Portals
 * Manages login, logout, and user session
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: 'SUPER_ADMIN' | 'FRAUD_INVESTIGATOR' | 'ACCOUNTS' | 'SUPPORT' | 'FRANCHISE_DISTRICT' | 'FRANCHISE_UNIT';
  franchiseId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  sendOTP: (mobile: string) => Promise<void>;
  login: (mobile: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
  hasRole: (roles: string | string[]) => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      sendOTP: async (mobile: string) => {
        try {
          await apiClient.sendOTP(mobile);
        } catch (error) {
          throw error;
        }
      },

      login: async (mobile: string, otp: string) => {
        try {
          const response: any = await apiClient.login(mobile, otp);
          
          const { token, user } = response;
          
          apiClient.setToken(token);
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('userData', JSON.stringify(user));
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } finally {
          apiClient.clearToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      checkAuth: () => {
        const state = get();
        const token = apiClient.getToken();
        
        if (token && !state.token) {
          // Restore session from localStorage
          const userData = typeof window !== 'undefined' 
            ? localStorage.getItem('userData') 
            : null;
          
          if (userData) {
            const user = JSON.parse(userData);
            set({
              user,
              token,
              isAuthenticated: true,
            });
            return true;
          }
        }
        
        return state.isAuthenticated;
      },

      hasRole: (roles: string | string[]) => {
        const { user } = get();
        if (!user) return false;
        
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return allowedRoles.includes(user.role);
      },
    }),
    {
      name: 'rodistaa-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

