/**
 * Rodistaa Theme Configuration for Ant Design
 * Primary Color: #C90D0D (Rodistaa Red)
 * Body Font: Times New Roman
 */

import type { ThemeConfig } from 'antd';

export const rodistaaTheme: ThemeConfig = {
  token: {
    // Primary color - Rodistaa Red
    colorPrimary: '#C90D0D',
    colorInfo: '#C90D0D',
    colorSuccess: '#4CAF50',
    colorWarning: '#FF9800',
    colorError: '#F44336',
    
    // Typography
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 18,
    fontSizeHeading5: 16,
    
    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    
    // Spacing
    marginLG: 24,
    marginMD: 16,
    marginSM: 12,
    marginXS: 8,
    
    // Colors
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F5F5F5',
    colorBorder: '#D9D9D9',
    colorText: '#000000',
    colorTextSecondary: '#666666',
    colorTextDisabled: '#CCCCCC',
  },
  components: {
    Button: {
      primaryColor: '#FFFFFF',
      colorPrimaryHover: '#A00A0A',
      colorPrimaryActive: '#800808',
      fontWeight: 600,
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    Table: {
      headerBg: '#FAFAFA',
      headerColor: '#000000',
      rowHoverBg: '#FFF5F5',
    },
    Layout: {
      headerBg: '#C90D0D',
      headerColor: '#FFFFFF',
      siderBg: '#FFFFFF',
      bodyBg: '#F5F5F5',
    },
    Menu: {
      itemSelectedBg: '#FFF5F5',
      itemSelectedColor: '#C90D0D',
      itemHoverBg: '#FFF9F9',
      itemHoverColor: '#C90D0D',
    },
    Typography: {
      titleMarginBottom: 0,
    },
  },
};

export const colors = {
  primary: '#C90D0D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  bg: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  textSecondary: '#666666',
  border: '#D9D9D9',
};

