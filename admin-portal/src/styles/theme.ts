/**
 * Rodistaa Admin Portal - Dark Theme Configuration
 * Based on reference UI screenshots
 */

export const rodistaaTheme = {
  // Rodistaa Brand Colors
  colors: {
    primary: '#C90D0D', // Rodistaa Red
    primaryHover: '#A00A0A',
    primaryActive: '#800808',
    
    // Background (Dark Theme)
    bgPrimary: '#0A0E14', // Main background
    bgSecondary: '#151922', // Card/panel background
    bgTertiary: '#1E2430', // Elevated components
    bgHover: '#252B38',
    
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#B4B9C5',
    textTertiary: '#6B7280',
    textDisabled: '#4B5563',
    
    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Borders
    border: '#2D3748',
    borderLight: '#374151',
    
    // State Colors
    active: '#10B981',
    pending: '#F59E0B',
    cancelled: '#EF4444',
    completed: '#10B981',
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      body: "'Times New Roman', Times, serif",
      heading: "'Baloo Bhai', 'Times New Roman', serif",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

// Ant Design Theme Override
export const antdThemeConfig = {
  token: {
    colorPrimary: '#C90D0D',
    colorBgContainer: '#151922',
    colorBgElevated: '#1E2430',
    colorBorder: '#2D3748',
    colorText: '#FFFFFF',
    colorTextSecondary: '#B4B9C5',
    colorTextTertiary: '#6B7280',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'Times New Roman', Times, serif",
  },
  components: {
    Layout: {
      headerBg: '#0A0E14',
      siderBg: '#0A0E14',
      bodyBg: '#0A0E14',
    },
    Card: {
      colorBgContainer: '#151922',
    },
    Table: {
      colorBgContainer: '#151922',
      headerBg: '#1E2430',
    },
    Button: {
      primaryColor: '#FFFFFF',
      colorPrimary: '#C90D0D',
      colorPrimaryHover: '#A00A0A',
      colorPrimaryActive: '#800808',
    },
  },
};

